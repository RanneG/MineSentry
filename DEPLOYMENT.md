# MineSentry Deployment Guide

This guide covers deploying MineSentry to production for hackathon demonstrations.

## Deployment Architecture

- **Backend**: Railway (Python FastAPI)
- **Frontend**: Vercel (React/Vite)
- **Database**: SQLite (ephemeral - resets on restart) or PostgreSQL (recommended for production)

## Prerequisites

- GitHub repository: https://github.com/RanneG/MineSentry
- Railway account: https://railway.app
- Vercel account: https://vercel.com

## Phase 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `RanneG/MineSentry` repository
5. Railway will auto-detect Python

### Step 2: Configure Backend Service

Railway will create a service. Configure it:

**Settings:**
- **Name**: `minesentry-backend`
- **Root Directory**: `.` (root of repo)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python start_server.py`

**Environment Variables** (Go to "Variables" tab):

```
DETECTION_DEMO_MODE=true
PORT=8000
DATABASE_URL=sqlite:///minesentry.db
CORS_ORIGINS=*
```

**Important**: 
- `DETECTION_DEMO_MODE=true` enables demo detection without Bitcoin Core
- `PORT` is set by Railway automatically, but we set a default
- `CORS_ORIGINS=*` allows all origins (update after frontend deployment)

### Step 3: Deploy

1. Click "Deploy" or push to main branch (Railway auto-deploys)
2. Wait for build (2-5 minutes)
3. Get your backend URL from Railway dashboard (e.g., `https://minesentry-backend-production.up.railway.app`)

### Step 4: Test Backend

Visit your backend URL:
- **API Docs**: `https://your-backend-url.railway.app/docs`
- **Health Check**: `https://your-backend-url.railway.app/health`

You should see the FastAPI Swagger documentation.

## Phase 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New" → "Project"
4. Import `RanneG/MineSentry` repository

### Step 2: Configure Frontend

**Project Settings:**
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Environment Variables** (Go to "Environment Variables"):

```
VITE_API_URL=https://your-backend-url.railway.app
```

**Important**: Replace `your-backend-url.railway.app` with your actual Railway backend URL from Phase 1.

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build (1-3 minutes)
3. Get your frontend URL (e.g., `https://minesentry.vercel.app`)

### Step 4: Update Backend CORS

After getting your frontend URL, update Railway environment variables:

1. Go back to Railway dashboard
2. Update `CORS_ORIGINS` to: `https://your-frontend-url.vercel.app,http://localhost:3000`

Or keep `CORS_ORIGINS=*` for development/demo purposes.

3. Redeploy backend (Railway auto-redeploys on env var changes)

## Phase 3: Test Full Deployment

### Test Checklist

1. **Frontend loads**: Visit `https://your-frontend-url.vercel.app`
   - ✅ Should see MineSentry dashboard

2. **Submit a report**:
   - Pool Address: `tb1qtest1234567890abcdefghijklmnopqrstuvwx`
   - Block Height: `2750000`
   - Evidence Type: `censorship`
   - Description: `Test from live demo`
   - ✅ Should submit successfully

3. **View detection results**:
   - Go to "Reports" page
   - Click on your report
   - Click "Validate Report"
   - ✅ Should see:
     - Confidence Score: 75%
     - Detection Methods: 3 methods
     - Missing Transactions: 2 transactions
     - Real evidence (not placeholder)

4. **Check API docs**:
   - Visit backend URL + `/docs`
   - ✅ Should see FastAPI Swagger UI

## Troubleshooting

### "Failed to get private network endpoint" in Railway

**Problem**: Railway shows "Failed to get private network endpoint" in Settings > Networking.

**Solution**: This is **NOT a critical error** and won't prevent deployment:
- Private networking is a Railway premium feature
- Your **public URL will still work** (e.g., `https://xxx.up.railway.app`)
- You can ignore this error and proceed with deployment
- The public endpoint is what your frontend will use anyway

To verify your deployment works:
1. Check the "Deployments" tab - deployment should complete successfully
2. Copy the **public URL** from Railway (not the private endpoint)
3. Test the public URL: `https://your-service.up.railway.app/health`
4. If that works, you're good to proceed with frontend deployment

### Frontend shows connection error

**Solution**:
1. Check backend URL in Vercel env vars matches Railway URL
2. Check CORS settings in Railway (`CORS_ORIGINS`)
3. Verify backend is running (check Railway logs)
4. Check browser console for exact error

### Backend fails to deploy

**Solution**:
1. Check Railway build logs
2. Verify `requirements.txt` exists
3. Ensure `start_server.py` exists (we created it)
4. Check Python version (runtime.txt specifies 3.11)

### Demo mode not working

**Solution**:
1. Verify `DETECTION_DEMO_MODE=true` in Railway env vars
2. Check Railway logs for errors
3. Restart the service in Railway

### Database errors

**Solution**:
- Railway uses ephemeral storage (database resets on restart)
- For production, consider adding PostgreSQL addon in Railway
- For demo, this is fine - judges can submit fresh reports

### Static files 404

**Solution**:
1. Check Vercel build logs
2. Verify `npm run build` works locally
3. Check `vercel.json` configuration
4. Ensure `dist` directory is being generated

## Environment Variables Reference

### Backend (Railway)

```
DETECTION_DEMO_MODE=true          # Enable demo mode (no Bitcoin Core needed)
PORT=8000                         # Port (Railway sets this automatically)
DATABASE_URL=sqlite:///minesentry.db  # Database URL
CORS_ORIGINS=*                    # CORS origins (or specific frontend URL)
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend-url.railway.app  # Backend API URL
```

## Quick Deployment Commands

### Railway

Railway auto-deploys on git push. To manually trigger:
1. Go to Railway dashboard
2. Click "Redeploy" button

### Vercel

Vercel auto-deploys on git push. To manually trigger:
```bash
cd frontend
vercel --prod
```

## Post-Deployment

After successful deployment:

1. ✅ Test all major features
2. ✅ Record demo video using live URLs
3. ✅ Update hackathon submission with:
   - Frontend URL
   - Backend URL
   - API Docs URL
4. ✅ Add deployment URLs to README.md

## Production Considerations

For production (beyond hackathon demo):

1. **Database**: Use PostgreSQL instead of SQLite
2. **CORS**: Set specific frontend URL instead of `*`
3. **Security**: Add authentication/authorization
4. **Monitoring**: Set up error tracking (Sentry, etc.)
5. **Backups**: Configure database backups
6. **SSL**: Ensure HTTPS (Railway/Vercel provide this)
7. **Rate Limiting**: Add rate limiting to API

## Support

If deployment issues occur:
1. Check Railway logs: Railway Dashboard → Service → Logs
2. Check Vercel logs: Vercel Dashboard → Project → Deployments → Logs
3. Test locally first: `python start_server.py` and `cd frontend && npm run dev`
4. Check this guide's troubleshooting section

