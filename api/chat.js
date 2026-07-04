export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages, system } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log('chat.js invoked. Has key:', !!apiKey);

  if (!apiKey) {
    console.error('Missing OPENROUTER_API_KEY');
    res.status(500).json({ error: 'Server missing OPENROUTER_API_KEY' });
    return;
  }

  try {
    const chatMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...(messages || []).map(m => ({ role: m.role, content: m.content }))
    ];

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: chatMessages
      })
    });

    const data = await orRes.json();
    console.log('OpenRouter status:', orRes.status, 'Body:', JSON.stringify(data).slice(0, 500));

    if (!orRes.ok) {
      console.error('OpenRouter error:', JSON.stringify(data));
      res.status(orRes.status).json({ error: data.error?.message || 'OpenRouter API error' });
      return;
    }

    const fullText = data.choices?.[0]?.message?.content || '';

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const chunkSize = 20;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      const chunk = fullText.slice(i, i + chunkSize);
      const payload = JSON.stringify({ type: 'content_block_delta', delta: { text: chunk } });
      res.write(`data: ${payload}\n\n`);
    }

    res.end();
  } catch (err) {
    console.error('Handler crashed:', err.message);
    res.status(500).json({ error: err.message });
  }
}
