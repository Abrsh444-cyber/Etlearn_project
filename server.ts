/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Route for Claude proxy redirected to OpenRouter or natively served via Google Gemini
  app.post('/api/claude/chat', async (req, res) => {
    try {
      const { messages, system, userApiKey, model } = req.body;
      
      // Prioritize client-provided API key from settings, then fallback to server env
      const apiKey = userApiKey || req.headers['x-api-key'] || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY; 
      
      if (!apiKey) {
        return res.status(401).json({ 
          error: 'Missing API Key. Please provide an API key in Onboarding or Settings to enable AI tutoring features.' 
        });
      }

      // Check if we can use native Google Gemini API directly (if key is Google API Key or fallback is used)
      const useGeminiDirectly = apiKey.startsWith('AIzaSy') || (!userApiKey && process.env.GEMINI_API_KEY && apiKey === process.env.GEMINI_API_KEY);

      // Check if we can use Groq API directly (if key is a Groq Key or fallback is used)
      const useGroqDirectly = apiKey.startsWith('gsk_') || (!userApiKey && process.env.GROQ_API_KEY && apiKey === process.env.GROQ_API_KEY);

      if (useGeminiDirectly) {
        // Configure chunks for Server-Sent Events (SSE) streaming helper
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Initialize Google Gen AI client
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        // Convert messages format to Gemini contents schema
        const geminiContents = messages.map((m: any) => {
          const parts: any[] = [];
          if (m.content) {
            parts.push({ text: m.content });
          }
          if (m.attachment && m.attachment.data && m.attachment.mimeType) {
            parts.push({
              inlineData: {
                data: m.attachment.data,
                mimeType: m.attachment.mimeType
              }
            });
          }
          if (parts.length === 0) {
            parts.push({ text: '' });
          }
          return {
            role: m.role === 'assistant' ? 'model' : 'user',
            parts
          };
        });

        const stream = await ai.models.generateContentStream({
          model: 'gemini-3.5-flash',
          contents: geminiContents,
          config: {
            systemInstruction: system || undefined,
          },
        });

        for await (const chunk of stream) {
          const content = chunk.text;
          if (content) {
            const legacyChunk = {
              type: 'content_block_delta',
              delta: { text: content }
            };
            res.write(`data: ${JSON.stringify(legacyChunk)}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      if (useGroqDirectly) {
        console.log('[EthioLearn Server] Routing chat request directly to Groq Cloud API');
        
        // Convert Anthropic-messages and system prompt structure to OpenAI-compatible message array
        const groqMessages = [];
        if (system) {
          groqMessages.push({ role: 'system', content: system });
        }
        if (Array.isArray(messages)) {
          const mapped = messages.map((m: any) => {
            if (m.attachment && m.attachment.data && m.attachment.mimeType) {
              if (m.attachment.mimeType.startsWith('image/')) {
                return {
                  role: m.role,
                  content: [
                    { type: 'text', text: m.content || '' },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:${m.attachment.mimeType};base64,${m.attachment.data}`
                      }
                    }
                  ]
                };
              } else {
                return {
                  role: m.role,
                  content: `${m.content || ''}\n[Attached File: ${m.attachment.name || 'document'} (${m.attachment.mimeType})]`
                };
              }
            }
            return { role: m.role, content: m.content || '' };
          });
          groqMessages.push(...mapped);
        }

        // Configure columns for Server-Sent Events (SSE) streaming helper
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Resolve suitable Groq model or default to the premium llama-3.3-70b-versatile
        let finalGroqModel = model || 'llama-3.3-70b-versatile';
        if (
          finalGroqModel.includes('claude') || 
          finalGroqModel.includes('sonnet') || 
          finalGroqModel.includes('gpt') ||
          finalGroqModel === 'claude-3-5-sonnet-20241022'
        ) {
          finalGroqModel = 'llama-3.3-70b-versatile';
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: finalGroqModel,
            messages: groqMessages,
            stream: true,
            max_tokens: 2048,
          }),
        });

        if (!groqResponse.ok) {
          const errBody = await groqResponse.text();
          console.error('Groq API returned error:', errBody);
          return res.status(groqResponse.status).json({ error: errBody });
        }

        if (!groqResponse.body) {
          return res.status(500).json({ error: 'Response body is empty. Could not initiate Groq stream.' });
        }

        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.startsWith('data:')) {
              const rawData = cleanLine.substring(5).trim();
              if (rawData === '[DONE]') {
                res.write('data: [DONE]\n\n');
                continue;
              }

              try {
                const parsed = JSON.parse(rawData);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  const legacyChunk = {
                    type: 'content_block_delta',
                    delta: { text: content }
                  };
                  res.write(`data: ${JSON.stringify(legacyChunk)}\n\n`);
                }
              } catch (e) {
                // Ignore partial JSON blocks
              }
            }
          }
        }

        if (buffer && buffer.startsWith('data:')) {
          const rawData = buffer.substring(5).trim();
          if (rawData !== '[DONE]') {
            try {
              const parsed = JSON.parse(rawData);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                const legacyChunk = {
                  type: 'content_block_delta',
                  delta: { text: content }
                };
                res.write(`data: ${JSON.stringify(legacyChunk)}\n\n`);
              }
            } catch (e) {}
          }
        }

        res.end();
        return;
      }

      // Convert Anthropic-messages and system prompt structure to OpenRouter/OpenAI-compatible message array
      const openRouterMessages = [];
      if (system) {
        openRouterMessages.push({ role: 'system', content: system });
      }
      if (Array.isArray(messages)) {
        const mapped = messages.map((m: any) => {
          if (m.attachment && m.attachment.data && m.attachment.mimeType) {
            if (m.attachment.mimeType.startsWith('image/')) {
              return {
                role: m.role,
                content: [
                  { type: 'text', text: m.content || '' },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${m.attachment.mimeType};base64,${m.attachment.data}`
                    }
                  }
                ]
              };
            } else {
              return {
                role: m.role,
                content: `${m.content || ''}\n[Attached File: ${m.attachment.name || 'document'} (${m.attachment.mimeType})]`
              };
            }
          }
          return { role: m.role, content: m.content || '' };
        });
        openRouterMessages.push(...mapped);
      }

      // Resolve a standard OpenRouter model ID matching 2026 active endpoints list
      let openRouterModel = model || 'anthropic/claude-sonnet-4';
      if (openRouterModel.includes('claude-3-5-sonnet') || openRouterModel.includes('claude-3.5-sonnet') || openRouterModel.includes('claude-sonnet-latest')) {
        openRouterModel = 'anthropic/claude-sonnet-4';
      }

      // We make a direct POST to OpenRouter chat completions API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ai.studio/build',
          'X-Title': 'EthioLearn',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: openRouterMessages,
          stream: true,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('OpenRouter API returned error:', errBody);
        return res.status(response.status).json({ error: errBody });
      }

      // Configure chunks for Server-Sent Events (SSE) streaming helper
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Check readable stream exists
      if (!response.body) {
        return res.status(500).json({ error: 'Response body is empty. Could not initiate stream.' });
      }

      // Read OpenRouter (OpenAI-compatible) chunks, decode, translation to legacy stream format, and pipe
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep partial line in buffer

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith('data:')) {
            const rawData = cleanLine.substring(5).trim();
            if (rawData === '[DONE]') {
              res.write('data: [DONE]\n\n');
              continue;
            }

            try {
              const parsed = JSON.parse(rawData);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                // Return an Anthropic-compatible block delta format to keep existing client parsing functional
                const legacyChunk = {
                  type: 'content_block_delta',
                  delta: { text: content }
                };
                res.write(`data: ${JSON.stringify(legacyChunk)}\n\n`);
              }
            } catch (e) {
              // Ignore partial parsing errors
            }
          }
        }
      }

      // Flush remaining stream buffer
      if (buffer && buffer.startsWith('data:')) {
        const rawData = buffer.substring(5).trim();
        if (rawData !== '[DONE]') {
          try {
            const parsed = JSON.parse(rawData);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              const legacyChunk = {
                type: 'content_block_delta',
                delta: { text: content }
              };
              res.write(`data: ${JSON.stringify(legacyChunk)}\n\n`);
            }
          } catch (e) {}
        }
      }
      res.end();
    } catch (err: any) {
      console.error('Express proxy error calling OpenRouter:', err);
      res.status(500).json({ error: err.message || 'Internal proxy server failure.' });
    }
  });

  // Serve static assets in production or use Vite developer middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EthioLearn Server] bound on port ${PORT}`);
  });
}

startServer();
