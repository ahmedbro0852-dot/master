'use strict';
const { isAuthorized, validateContent, publishPhoto } = require('../lib/meta-publisher.cjs');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const secret = process.env.META_PUBLISH_SECRET;
  if (!isAuthorized(req.headers?.authorization, secret)) return res.status(401).json({ error: 'unauthorized' });
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!/^\d{6,25}$/.test(pageId || '') || !token || token.length < 20) return res.status(503).json({ error: 'meta_not_configured' });
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid_json' }); }
  }
  const hosts = ['static.metricool.com', 'master-pi-six.vercel.app'];
  const validated = validateContent(body, hosts);
  if (validated.error) return res.status(400).json({ error: validated.error });
  if (body.dryRun === true) return res.status(200).json({ ok: true, dryRun: true, message: 'ready_to_publish' });
  try {
    const result = await publishPhoto({ pageId, token, message: validated.message, imageUrl: validated.imageUrl });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.metaCode === 190 || error.metaCode === 200 ? 503 : 502;
    return res.status(status).json({ error: 'meta_publish_unavailable', upstreamStatus: error.statusCode || null });
  }
};
