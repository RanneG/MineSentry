# Deploy MineSentry to Render (Alternative to Railway)

Since Railway's Limited Trial doesn't allow code deployments, we'll use **Render** which has a free tier that supports code deployments.

## Why Render?

- ✅ **Free tier allows code deployments** (unlike Railway Limited Trial)
- ✅ Supports Python FastAPI (our backend)
- ✅ Easy GitHub integration
- ✅ Automatic HTTPS
- ✅ Free tier is sufficient for hackathon demo

## Prerequisites

- GitHub repository: https://github.com/RanneG/MineSentry
- Render account: https://render.com (free signup)

## Step 1: Deploy Backend to Render

### Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy integration)
3. Verify your email

### Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select repository: **`RanneG/MineSentry`**
4. Render will auto-detect settings, but verify:

**Configuration:**
- **Name**: `minesentry-backend`
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: Leave blank (uses root)
- **Runtime**: `Python 3`
- **Build Command**: `python3.11 -m pip install --upgrade pip && python3.11 -m pip install -r requirements.txt`
- **Start Command**: `python start_server.py` ⚠️ **Make sure it says `start_server.py` NOT `start_service.py`**

**Important - Python Version:**
Render will automatically detect Python 3.11.10 from the `.python-version` and `runtime.txt` files in the repo. These files are now committed, so Render should use Python 3.11.10 automatically.

If Render still uses Python 3.13, you can specify it in the build command:
- Change **Build Command** to: `python3.11 -m pip install --upgrade pip && python3.11 -m pip install -r requirements.txt`

**Environment Variables** (click "Advanced"):
- `DETECTION_DEMO_MODE` = `true`
- `CORS_ORIGINS` = `*`
- `PORT` = `8000` (Render sets this automatically, but we include it)

5. **Plan**: Select **"Free"** plan
6. Click **"Create Web Service"**
7. Wait for deployment (2-5 minutes)

### Get Your Backend URL

Once deployed, you'll get a URL like:
```
https://minesentry-backend.onrender.com
```

**Note**: Free tier services on Render "spin down" after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds to wake up.

## Step 2: Deploy Frontend to Vercel (Same as Before)

Vercel is free and works great. Follow the original frontend deployment steps:

1. Go to [vercel.com](https://vercel.com)
2. Import `RanneG/MineSentry` repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - (Replace with your actual Render backend URL from Step 1)
5. Deploy!

## Step 3: Test Deployment

1. Visit your Vercel frontend URL
2. Submit a test report
3. Check detection results
4. Verify everything works

## Render Free Tier Limitations

- Services spin down after 15 minutes of inactivity (first request after wake-up takes ~30 seconds)
- 750 hours/month free (plenty for hackathon demo)
- Auto-scaling based on traffic

**For Hackathon Demo:**
- These limitations are fine
- Service will wake up automatically when someone visits
- Can mention in demo: "Free tier spins down after inactivity, first request takes a moment"

## Troubleshooting

### Service Won't Deploy

**Check build logs:**
- Click on your service in Render
- Go to "Logs" tab
- Look for errors in build or runtime logs

**Common issues:**
- Missing `requirements.txt` → Check it exists
- Wrong Python version → Ensure `runtime.txt` has `python-3.11`
- Import errors → Check all dependencies are in `requirements.txt`

### Health Check Fails

**Verify health endpoint:**
- Visit: `https://your-backend.onrender.com/health`
- Should return: `{"status": "healthy"}`

### Frontend Can't Connect

**Check:**
1. Backend URL in Vercel env vars matches Render URL
2. CORS is set to `*` in Render env vars
3. Backend is actually running (check Render logs)

### Slow First Request

**This is normal on free tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Subsequent requests are fast
- Mention this in your demo if needed

## Alternative: Deploy Both to Render

If you prefer everything in one place, you can also deploy the frontend to Render:

1. Create another **"Static Site"** service in Render
2. Connect same GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`

However, Vercel is recommended for frontend as it's faster and has better CDN.

## Cost

**Total Cost: $0/month**
- Render backend: Free tier
- Vercel frontend: Free tier

Perfect for hackathon submission! 🎉

