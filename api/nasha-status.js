module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({
    providers: {
      OpenAI: Boolean(process.env.OPENAI_API_KEY),
      Anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      Google: Boolean(process.env.GEMINI_API_KEY),
      xAI: Boolean(process.env.XAI_API_KEY),
      DeepSeek: Boolean(process.env.DEEPSEEK_API_KEY)
    }
  });
};
