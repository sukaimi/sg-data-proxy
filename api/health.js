module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    ok: true,
    service: "Pulse of Singapore Data Proxy",
    endpoints: ["/api/weather", "/api/health"],
    timestamp: new Date().toISOString(),
  });
};
