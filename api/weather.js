const fetch = require("node-fetch");

const BASE = "https://api-open.data.gov.sg/v2/real-time/api";

const ENDPOINTS = {
  temperature: "/air-temperature",
  rainfall: "/rainfall",
  humidity: "/relative-humidity",
  pm25: "/pm25",
  psi: "/psi",
  wind: "/wind-speed",
  uv: "/uv-index",
};

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const API_KEY = process.env.NEA_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "NEA_API_KEY not configured" });

  const headers = { "x-api-key": API_KEY };
  const result = {};

  try {
    const fetches = Object.entries(ENDPOINTS).map(async ([key, path]) => {
      try {
        const r = await fetch(BASE + path, { headers });
        const json = await r.json();
        return [key, json];
      } catch (e) {
        return [key, { error: e.message }];
      }
    });

    const results = await Promise.allSettled(fetches);

    for (const r of results) {
      if (r.status === "fulfilled") {
        const [key, data] = r.value;
        result[key] = data;
      }
    }

    // Process into simple values for the jellyfish
    const processed = {};

    // Temperature (station-based: data.readings[0].data)
    try {
      const readings = result.temperature?.data?.readings;
      if (readings && readings[0] && readings[0].data) {
        const rd = readings[0].data;
        const avg = rd.reduce((s, x) => s + x.value, 0) / rd.length;
        processed.temperature = { value: Math.round(avg * 10) / 10, unit: "°C", stations: rd.length };
      }
    } catch (e) {}

    // Rainfall (station-based: data.readings[0].data)
    try {
      const readings = result.rainfall?.data?.readings;
      if (readings && readings[0] && readings[0].data) {
        const rd = readings[0].data;
        const avg = rd.reduce((s, x) => s + x.value, 0) / rd.length;
        const max = Math.max(...rd.map(x => x.value));
        processed.rainfall = { avg: Math.round(avg * 10) / 10, max: max, unit: "mm", stations: rd.length };
      }
    } catch (e) {}

    // Humidity (station-based: data.readings[0].data)
    try {
      const readings = result.humidity?.data?.readings;
      if (readings && readings[0] && readings[0].data) {
        const rd = readings[0].data;
        const avg = rd.reduce((s, x) => s + x.value, 0) / rd.length;
        processed.humidity = { value: Math.round(avg), unit: "%", stations: rd.length };
      }
    } catch (e) {}

    // PM2.5
    try {
      const items = result.pm25?.data?.items;
      if (items && items[0] && items[0].readings) {
        const rd = items[0].readings.pm25_one_hourly;
        if (rd) processed.pm25 = { national: rd.national, regions: rd };
      }
    } catch (e) {}

    // PSI
    try {
      const items = result.psi?.data?.items;
      if (items && items[0] && items[0].readings) {
        const rd = items[0].readings;
        processed.psi = {
          psi_twenty_four_hourly: rd.psi_twenty_four_hourly,
          pm25: rd.pm25_one_hourly,
        };
      }
    } catch (e) {}

    // Wind (station-based: data.readings[0].data)
    try {
      const readings = result.wind?.data?.readings;
      if (readings && readings[0] && readings[0].data) {
        const rd = readings[0].data;
        const avg = rd.reduce((s, x) => s + x.value, 0) / rd.length;
        processed.wind = { avg: Math.round(avg * 10) / 10, unit: "knots", stations: rd.length };
      }
    } catch (e) {}

    // UV (region-based: data.items)
    try {
      const items = result.uv?.data?.items;
      if (items && items[0]) {
        processed.uv = { value: items[0].index || items[0].value, timestamp: items[0].timestamp };
      }
    } catch (e) {}

    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      processed: processed,
      raw: result,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
