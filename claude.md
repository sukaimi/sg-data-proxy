# sg-data-proxy

## What is this
Serverless proxy deployed on Vercel that forwards requests to Singapore's data.gov.sg v2 real-time APIs. Built for the "Pulse of Singapore" project — an artistic data visualization that renders Singapore urban data as an animated jellyfish ecosystem.

## Why a proxy
- The jellyfish frontend runs as a static page / React artifact
- data.gov.sg API requires an API key passed via `x-api-key` header
- API key must not be exposed in client-side code
- This proxy holds the key server-side and adds CORS headers

## Architecture
```
Jellyfish frontend → GET /api/weather → Vercel serverless function → data.gov.sg v2 API
```

## Endpoints
- `GET /api/weather` — Fetches all NEA weather data in one call, returns combined + processed JSON
- `GET /api/health` — Health check

## Environment variables
- `NEA_API_KEY` — data.gov.sg v2 API key (set in Vercel dashboard, never commit to code)

## data.gov.sg v2 real-time APIs used
All under `https://api-open.data.gov.sg/v2/real-time/api/`:
- `/air-temperature` — per-minute readings from NEA weather stations
- `/rainfall` — 5-minute readings
- `/relative-humidity` — per-minute readings
- `/pm25` — hourly, regional breakdown (north/south/east/west/central/national)
- `/psi` — hourly, includes pm25_one_hourly and psi_twenty_four_hourly
- `/wind-speed` — per-minute readings in knots
- `/uv-index` — hourly between 7am-7pm SGT

## Response format
`/api/weather` returns:
```json
{
  "ok": true,
  "timestamp": "ISO string",
  "processed": {
    "temperature": { "value": 28.5, "unit": "°C", "stations": 17 },
    "rainfall": { "avg": 0.2, "max": 5.0, "unit": "mm" },
    "humidity": { "value": 82, "unit": "%" },
    "pm25": { "national": 15, "regions": {...} },
    "psi": { "psi_twenty_four_hourly": {...}, "pm25": {...} },
    "wind": { "avg": 5.2, "unit": "knots" },
    "uv": { "value": 8 }
  },
  "raw": { ... full API responses ... }
}
```

## Tech stack
- Node.js (Vercel serverless functions)
- node-fetch v2
- Vercel free tier (100K requests/month)

## Rate limits
- data.gov.sg rate limits reset every 10 seconds
- Production API key gets higher limits than no-key access
- Jellyfish polls every 60 seconds — well within limits

## Related project
- Pulse of Singapore jellyfish visualization (React/Canvas/Web Audio)
- Owner: Sukaimi, Code&Canvas (Singapore)
- Future additions: LTA DataMall (traffic/buses), MPA (port vessels)

## Key files
- `api/weather.js` — main proxy handler, fetches all endpoints, processes into normalized values
- `api/health.js` — simple health check
- `vercel.json` — CORS headers, caching config (60s cache, 120s stale-while-revalidate)
- `package.json` — dependencies (node-fetch only)
