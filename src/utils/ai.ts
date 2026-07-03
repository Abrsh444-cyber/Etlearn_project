/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

// Helper to stream/parse Anthropic SSE responses forwarded from Express proxy
export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // raw base64 string
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  attachment?: ChatAttachment;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onComplete: (fullText: string) => void;
  onError: (err: any) => void;
}

export async function submitClaudeChat(
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string,
  callbacks: StreamCallbacks
) {
  try {
    let response: Response | null = null;
    let useFallback = false;

    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          system: systemPrompt,
          userApiKey: apiKey,
          model: 'claude-3-5-sonnet-20241022'
        })
      });

      if (response.status === 404) {
        console.warn('[EthioLearn Client] Server returned 404 for chat endpoint. Bypassing proxy and utilizing direct client-side fallback.');
        useFallback = true;
      }
    } catch (fetchErr) {
      console.warn('[EthioLearn Client] Failed to reach the Express backend server. Bypassing proxy and utilizing direct client-side fallback:', fetchErr);
      useFallback = true;
    }

    if (useFallback) {
      // Self-healing direct browser call if a mobile phone browser receives a 404 or cannot reach Express
      if (!apiKey || ['no-key', 'no-api-key', 'undefined', 'null', 'none'].includes(apiKey.trim().toLowerCase())) {
        throw new Error('Server proxy is offline/404, and no valid Gemini API Key is loaded in your settings.');
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });

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
          systemInstruction: systemPrompt || undefined,
        },
      });

      let accumulatedText = '';
      for await (const chunk of stream) {
        const content = chunk.text;
        if (content) {
          accumulatedText += content;
          callbacks.onChunk(content);
        }
      }

      callbacks.onComplete(accumulatedText);
      return;
    }

    if (!response || !response.ok) {
      const errDetails = await response.json().catch(() => ({}));
      throw new Error(errDetails.error || `Proxy failed with status ${response?.status}`);
    }

    if (!response.body) {
      throw new Error('Streaming not supported or failed.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedText = '';

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
          if (rawData === '[DONE]') continue;

          try {
            const parsed = JSON.parse(rawData);
            
            // Anthropic stream JSON uses type: "content_block_delta" with delta.text
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              const chunk = parsed.delta.text;
              accumulatedText += chunk;
              callbacks.onChunk(chunk);
            }
          } catch (e) {
            // Ignore parse errors on half-buffer slices
          }
        }
      }
    }

    // Flush remaining buffer
    if (buffer && buffer.startsWith('data:')) {
      try {
        const parsed = JSON.parse(buffer.substring(5).trim());
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          const chunk = parsed.delta.text;
          accumulatedText += chunk;
          callbacks.onChunk(chunk);
        }
      } catch (e) {}
    }

    callbacks.onComplete(accumulatedText);
  } catch (err: any) {
    callbacks.onError(err.message || 'Call failed.');
  }
}

// Generate an interactive quiz with 5 multiple-choice questions
export async function generateQuizAI(
  topic: string,
  subject: string,
  apiKey: string
): Promise<any[]> {
  const promptMessage = `Generate a high-quality academic practice quiz on the topic: "${topic}" under the subject "${subject}".
Format the response strictly as a JSON array of 5 MCQ objects. Do NOT wrapper it inside any markdown ticks, do NOT write any introductory or concluding text. Return raw JSON array only.

Each object in the array must contain:
1. "question": String (the exam question in English, with optional Amharic keywords where relevant)
2. "options": Array of 4 strings (unique options, with local context analogies)
3. "correctAnswer": String (must exactly match one of the elements in the "options" array)
4. "explanation": String (detailed educational explanation in a encouraging tone with traditional analogies if possible)`;

  const messages: ChatMessage[] = [
    { role: 'user', content: promptMessage }
  ];

  const system = "You are an automated high-fidelity exam processor for EthioLearn Pro. You reply exclusively in raw, valid, unformatted JSON arrays containing academic question objects.";

  return new Promise((resolve, reject) => {
    let fullText = '';
    submitClaudeChat(messages, system, apiKey, {
      onChunk: () => {},
      onComplete: (text) => {
        try {
          // Strip any markdown ticks if Claude accidentally added them
          let cleanJson = text.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
          }
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
          }
          if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          }
          
          const quiz = JSON.parse(cleanJson.trim());
          resolve(Array.isArray(quiz) ? quiz : []);
        } catch (err) {
          reject(new Error('Failed to parse Claude output into quiz questions. Please try again.'));
        }
      },
      onError: (err) => reject(err)
    });
  });
}

// Generate 10 new flashcards on a topic
export async function generateFlashcardsAI(
  topic: string,
  subject: string,
  apiKey: string
): Promise<any[]> {
  const promptMessage = `Generate 10 high-quality flashcards for revision on: "${topic}" inside the "${subject}" curriculum.
Respond strictly in a JSON array of objects. Do not wrap inside code tags or markdown blocks, do not write any standard filler text. 

Each object must contain:
1. "question": String (clean, precise questioning)
2. "answer": String (concise, factual summary)
3. "explanation": String (optional study tip or mnemonic)`;

  const messages: ChatMessage[] = [{ role: 'user', content: promptMessage }];
  const system = "You are a flashcards drafting engine. You output exclusively raw, unformatted JSON lists. No greeting, no markdown wrapper.";

  return new Promise((resolve, reject) => {
    submitClaudeChat(messages, system, apiKey, {
      onChunk: () => {},
      onComplete: (text) => {
        try {
          let cleanJson = text.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
          }
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
          }
          if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          }
          const cards = JSON.parse(cleanJson.trim());
          resolve(Array.isArray(cards) ? cards : []);
        } catch (err) {
          reject(new Error('Failed to parse AI flashcard lists. Let us try one more time.'));
        }
      },
      onError: (err) => reject(err)
    });
  });
}

// Generate flashcards from custom context (like notes or chat histories)
export async function generateFlashcardsFromContextAI(
  context: string,
  subject: string,
  apiKey: string
): Promise<any[]> {
  const promptMessage = `Based on the following custom educational content or conversation context:
"""
${context}
"""

Generate 5 high-quality flashcards for revision. Make sure they extract the core concepts, figures, equations, or vocabulary from the text provided.
Respond strictly in a JSON array of objects. Do not wrap inside code tags or markdown blocks, do not write any standard filler text. 

Each object must contain:
1. "question": String (clean, precise questioning)
2. "answer": String (concise, factual summary)
3. "explanation": String (optional study tip or mnemonic)`;

  const messages: ChatMessage[] = [{ role: 'user', content: promptMessage }];
  const system = "You are a flashcards drafting engine. You output exclusively raw, unformatted JSON lists. No greeting, no markdown wrapper.";

  return new Promise((resolve, reject) => {
    submitClaudeChat(messages, system, apiKey, {
      onChunk: () => {},
      onComplete: (text) => {
        try {
          let cleanJson = text.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
          }
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
          }
          if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          }
          const cards = JSON.parse(cleanJson.trim());
          resolve(Array.isArray(cards) ? cards : []);
        } catch (err) {
          reject(new Error('Failed to parse AI flashcard lists. Let us try one more time.'));
        }
      },
      onError: (err) => reject(err)
    });
  });
}

// Generate structured educational note
export async function generateNoteAI(
  topic: string,
  subject: string,
  apiKey: string
): Promise<any> {
  const promptMessage = `Draft an extremely detailed, styled study note for the topic: "${topic}" under the curriculum: "${subject}".
The output must use a encouraging academic layout tailored for Ethiopian secondary or university levels. Use local examples where appropriate (Ethiopian economy, rivers, agriculture, biology, values).

Your response must be in raw JSON matching this TypeScript type:
{
  "title": string,
  "intro": string,
  "definition": string,
  "explanation": string (styled in markdown structure with neat sections),
  "diagram": string (detailed visual text/diagram or ASCII art showing cycles),
  "mnemonics": string (clever memory device),
  "tableHeader": string[],
  "tableRows": string[][] (must have at least 3 rows explaining subdivisions)
}

Do NOT write markdown wrap blocks or conversational responses. Output the clean raw JSON.`;

  const messages: ChatMessage[] = [{ role: 'user', content: promptMessage }];
  const system = "You are a study notes compiling microservice. You render output solely as a raw valid JSON object. No conversational wrapper.";

  return new Promise((resolve, reject) => {
    submitClaudeChat(messages, system, apiKey, {
      onChunk: () => {},
      onComplete: (text) => {
        try {
          let cleanJson = text.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
          }
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
          }
          if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          }
          const noteObj = JSON.parse(cleanJson.trim());
          resolve(noteObj);
        } catch (err) {
          reject(new Error('Failed to compile study note correctly.'));
        }
      },
      onError: (err) => reject(err)
    });
  });
}
