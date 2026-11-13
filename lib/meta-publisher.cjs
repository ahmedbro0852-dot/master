'use strict';

const { timingSafeEqual } = require('node:crypto');
const GRAPH_VERSION = 'v27.0';

function isAuthorized(value, secret) {
  if (typeof value !== 'string' || typeof secret !== 'string' || secret.length < 24) return false;
  if (!value.startsWith('Bearer ')) return false;
  const candidate = Buffer.from(value.slice(7), 'utf8');
  const expected = Buffer.from(secret, 'utf8');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function validateContent(body, allowedHosts) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'invalid_json' };
  const message = body.message;
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) return { error: 'invalid_message' };
  if (typeof body.imageUrl !== 'string' || body.imageUrl.length > 2048) return { error: 'image_required' };
  let url;
  try { url = new URL(body.imageUrl); } catch { return { error: 'invalid_image_url' }; }
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.hash || !allowedHosts.includes(url.hostname.toLowerCase())) return { error: 'image_host_not_allowed' };
  if (!/\.(?:png|jpe?g|webp)(?:$|\?)/i.test(url.pathname + url.search)) return { error: 'image_must_be_public_file' };
  return { message: message.trim(), imageUrl: url.toString() };
}

async function graphRequest(path, options = {}, config = {}) {
  const address = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  const isGet = !options.method || options.method === 'GET';
  if (isGet && options.params) Object.entries(options.params).forEach(([key, value]) => address.searchParams.set(key, String(value)));
  const result = await fetch(address, {
    method: isGet ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${config.token}`, ...(isGet ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' }) },
    body: isGet ? undefined : new URLSearchParams(options.body),
    signal: AbortSignal.timeout(20000)
  });
  const body = await result.json().catch(() => ({}));
  if (!result.ok || body.error) {
    // Never log or return raw Meta errors: they can contain sensitive data.
    const err = new Error('meta_api_failed');
    err.statusCode = result.status;
    err.metaCode = Number(body.error?.code) || null;
    throw err;
  }
  return body;
}

async function publishPhoto({ pageId, token, message, imageUrl }) {
  const existing = await graphRequest(`${encodeURIComponent(pageId)}/posts`, {
    params: { fields: 'id,message,created_time', limit: 50 }
  }, { token });
  if (!Array.isArray(existing.data)) throw new Error('meta_posts_unavailable');
  const duplicate = existing.data.find(post => post.message === message);
  if (duplicate) return { ok: true, duplicate: true, postId: duplicate.id, postUrl: `https://www.facebook.com/${encodeURIComponent(duplicate.id)}` };

  const result = await graphRequest(`${encodeURIComponent(pageId)}/photos`, {
    method: 'POST', body: { url: imageUrl, caption: message, published: 'true' }
  }, { token });
  if (!result.id) throw new Error('meta_response_missing_id');
  return { ok: true, duplicate: false, postId: result.post_id || result.id, postUrl: `https://www.facebook.com/${encodeURIComponent(result.post_id || result.id)}` };
}

module.exports = { GRAPH_VERSION, isAuthorized, validateContent, publishPhoto };
