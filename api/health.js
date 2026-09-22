export default function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({
    ok:true,
    service:'MASTER AI',
    providerConfigured:Boolean(process.env.AEROLINK_API_KEY),
    model:process.env.AEROLINK_MODEL || 'gpt-5.6-sol'
  });
}
