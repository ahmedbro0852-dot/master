const PROVIDERS = {
  OpenAI: {
    key: 'OPENAI_API_KEY',
    models: new Set(['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna'])
  },
  Anthropic: {
    key: 'ANTHROPIC_API_KEY',
    models: new Set(['claude-fable-5', 'claude-mythos-5', 'claude-opus-5', 'claude-sonnet-5'])
  },
  Google: {
    key: 'GEMINI_API_KEY',
    models: new Set(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-pro'])
  },
  xAI: {
    key: 'XAI_API_KEY',
    models: new Set(['grok-4.7', 'grok-4.6', 'grok-4.5'])
  },
  DeepSeek: {
    key: 'DEEPSEEK_API_KEY',
    models: new Set(['deepseek-flash', 'deepseek-v4-pro'])
  }
};

const MODE_INSTRUCTIONS = {
  Chat: 'Be a helpful, direct assistant. Answer the user clearly and avoid unnecessary filler.',
  Work: 'Act as a professional work assistant. Break complex tasks into concrete outputs and preserve important constraints.',
  Research: 'Be rigorous and explicit about uncertainty. Do not fabricate citations or claim external verification unless it was actually provided.',
  Code: 'Act as a software engineering assistant. Prefer correct, maintainable solutions and explain material implementation details concisely.'
};

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .slice(-24)
    .map(item => ({
      role: item?.role === 'assistant' ? 'assistant' : 'user',
      text: String(item?.text || '').slice(0, 12000)
    }))
    .filter(item => item.text.trim());
}

function totalChars(messages) {
  return messages.reduce((sum, item) => sum + item.text.length, 0);
}

function reasoningEffort(value) {
  const map = {
    Instant: 'low',
    Medium: 'medium',
    High: 'high',
    'Extra High': 'xhigh'
  };
  return map[value] || 'medium';
}

async function fetchJson(url, options, timeoutMs = 90000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.error ||
        data?.message ||
        `Provider error (${response.status})`;
      const error = new Error(String(message));
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function extractResponsesText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      const text = content?.text || content?.output_text;
      if (typeof text === 'string' && text.trim()) chunks.push(text.trim());
    }
  }
  return chunks.join('\n\n').trim();
}

async function callOpenAI(model, messages, mode, reasoning) {
  const input = messages.map(item => ({ role: item.role, content: item.text }));
  const data = await fetchJson('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      instructions: MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.Chat,
      input,
      reasoning: { effort: reasoningEffort(reasoning) },
      max_output_tokens: 4096
    })
  });
  return extractResponsesText(data);
}

async function callXAI(model, messages, mode, reasoning) {
  const input = [
    { role: 'system', content: MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.Chat },
    ...messages.map(item => ({ role: item.role, content: item.text }))
  ];
  const data = await fetchJson('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input,
      reasoning: { effort: reasoningEffort(reasoning) }
    })
  }, 120000);
  return extractResponsesText(data);
}

async function callDeepSeek(model, messages, mode) {
  const data = await fetchJson('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.Chat },
        ...messages.map(item => ({ role: item.role, content: item.text }))
      ],
      max_tokens: 4096
    })
  }, 120000);
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

async function callAnthropic(model, messages, mode) {
  const data = await fetchJson('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      system: MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.Chat,
      max_tokens: 4096,
      messages: messages.map(item => ({ role: item.role, content: item.text }))
    })
  }, 120000);
  return (data?.content || [])
    .filter(item => item?.type === 'text' && typeof item?.text === 'string')
    .map(item => item.text)
    .join('\n\n')
    .trim();
}

async function callGoogle(model, messages, mode) {
  const contents = messages.map(item => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.text }]
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const data = await fetchJson(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.Chat }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 4096
      }
    })
  }, 120000);
  return (data?.candidates?.[0]?.content?.parts || [])
    .map(part => typeof part?.text === 'string' ? part.text : '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const provider = String(req.body?.provider || '');
  const model = String(req.body?.model || '');
  const mode = String(req.body?.mode || 'Chat');
  const reasoning = String(req.body?.reasoning || 'Medium');
  const config = PROVIDERS[provider];

  if (!config || !config.models.has(model)) {
    return res.status(400).json({ error: 'Unsupported provider or model.' });
  }

  const apiKey = process.env[config.key];
  if (!apiKey) {
    return res.status(503).json({
      error: `${provider} is not connected. Add ${config.key} to the server environment.`
    });
  }

  const messages = normalizeMessages(req.body?.messages);
  if (!messages.length) {
    return res.status(400).json({ error: 'A message is required.' });
  }
  if (totalChars(messages) > 90000) {
    return res.status(413).json({ error: 'Conversation is too large. Start a new chat and try again.' });
  }

  try {
    let text = '';
    if (provider === 'OpenAI') text = await callOpenAI(model, messages, mode, reasoning);
    else if (provider === 'Anthropic') text = await callAnthropic(model, messages, mode);
    else if (provider === 'Google') text = await callGoogle(model, messages, mode);
    else if (provider === 'xAI') text = await callXAI(model, messages, mode, reasoning);
    else if (provider === 'DeepSeek') text = await callDeepSeek(model, messages, mode);

    if (!text) {
      return res.status(502).json({ error: 'The provider returned no text.' });
    }

    return res.status(200).json({ text, provider, model });
  } catch (error) {
    const status = Number(error?.status);
    const safeStatus = status >= 400 && status < 600 ? status : 502;
    return res.status(safeStatus).json({
      error: String(error?.message || 'The provider request failed.').slice(0, 500)
    });
  }
};
