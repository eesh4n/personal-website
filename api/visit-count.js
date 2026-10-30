// Vercel function: bumps the same Redis counter the old site used.
module.exports = async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token) return res.status(503).json({ count: null });
  const r = await fetch(`${url}/incr/lifetime_visits`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return res.status(502).json({ count: null });
  const data = await r.json();
  res.status(200).json({ count: typeof data.result === "number" ? data.result : null });
};
