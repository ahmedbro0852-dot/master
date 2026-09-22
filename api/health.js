module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    service: "MASTER STORE AI",
    configured: Boolean(process.env.AEROLINK_API_KEY)
  });
};
