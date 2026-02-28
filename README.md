# Pulse of Singapore - Deploy Guide

## What this does
This sets up a tiny server on Vercel (free) that talks to the Singapore
government weather API on your behalf. Your jellyfish webpage will call
this server to get live temperature, rainfall, humidity, PSI data etc.

---

## STEP 1: Create a Vercel account (skip if you already have one)

1. Go to https://vercel.com
2. Click Sign Up
3. Sign up with your GitHub account (easiest)
   - If you don't have GitHub, create one at https://github.com first
4. Done

---

## STEP 2: Upload the proxy code to GitHub

1. Go to https://github.com/new (create new repository)
2. Fill in:
   - Repository name: sg-data-proxy
   - Keep it Public (or Private, either works)
   - Click Create repository
3. You'll see a page with instructions - ignore those for now
4. Click the "uploading an existing file" link on that page
5. Drag and drop ALL the files from the folder I gave you:
   - package.json
   - vercel.json
   - api/weather.js
   - api/health.js
   
   IMPORTANT: Make sure the api folder structure is preserved!
   The files must be at: api/weather.js and api/health.js
   
6. Click Commit changes

---

## STEP 3: Deploy on Vercel

1. Go to https://vercel.com/new
2. It will show your GitHub repos - find sg-data-proxy and click Import
3. On the configure page:
   - Framework Preset: Other (should auto-detect)
   - Leave everything else as default
4. IMPORTANT - Add your API key:
   - Scroll down to Environment Variables
   - Click to expand it
   - Add this:
     - Name: NEA_API_KEY
     - Value: (your data.gov.sg API key)
   - Click Add
5. Click Deploy
6. Wait about 30 seconds for it to build

---

## STEP 4: Test it

Once deployed, Vercel gives you a URL like:
https://sg-data-proxy.vercel.app

1. Open your browser and go to:
   https://sg-data-proxy.vercel.app/api/health
   
   You should see: {"ok": true, "service": "Pulse of Singapore Data Proxy"...}

2. Then test the weather endpoint:
   https://sg-data-proxy.vercel.app/api/weather
   
   You should see live Singapore weather data!

---

## STEP 5: Tell me your URL

Come back and give me the Vercel URL (e.g. https://sg-data-proxy.vercel.app)
and I'll wire it into the jellyfish.

---

## Troubleshooting

Build failed:
- Check that api/weather.js is inside an api folder, not at root level

NEA_API_KEY not configured:
- Go to Vercel dashboard > your project > Settings > Environment Variables
- Make sure NEA_API_KEY is added

API returns errors:
- Check if your data.gov.sg API key is still active at https://data.gov.sg

---

## Cost
Vercel free tier: 100,000 requests/month - more than enough.
The jellyfish polls every 60 seconds = about 43,200 requests/month if running 24/7.
