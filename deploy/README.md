# 🚀 YouTube Clip Maker - Deployment Guide

Complete deployment guide for the YouTube Clip Maker application with Frontend on Vercel and Backend on Railway.

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free)
- Railway account (starts with $5 credits)
- API keys from:
  - [Replicate](https://replicate.com/account/api-tokens) 
  - [Anthropic](https://console.anthropic.com/)

## 🎯 Deployment Overview

- **Frontend**: Next.js → Vercel (Free tier)
- **Backend**: Node.js + Express → Railway ($5/month minimum)
- **AI Services**: Replicate (Whisper) + Anthropic (Claude)

## 🔧 Step 1: Prepare Your Repository

1. **Directory Structure** (ensure you have):
   ```
   your-repo/
   ├── frontend/
   │   ├── package.json
   │   ├── next.config.js
   │   └── ... (Next.js app)
   └── backend/
       ├── package.json
       ├── index.js
       └── ... (Express app)
   ```

2. **Add Railway Configuration** to your backend directory:
   ```bash
   cp deploy/railway.toml backend/
   # OR copy deploy/Procfile backend/ (simpler alternative)
   ```

3. **Add Vercel Configuration** to your frontend directory:
   ```bash
   cp deploy/vercel.json frontend/
   ```

4. **Update Backend CORS** (in `backend/index.js`):
   ```javascript
   // Add the CORS configuration from deploy/cors-config.js
   ```

## 🚀 Step 2: Deploy Backend to Railway

1. **Create Railway Project**:
   - Go to [Railway.app](https://railway.com)
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**:
   - Set Root Directory: `backend`
   - Railway will auto-detect Node.js and use the start command from package.json

3. **Set Environment Variables**:
   ```bash
   REPLICATE_API_TOKEN=r_your_token_here
   ANTHROPIC_API_KEY=sk-ant-your_key_here
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app  # Update after Vercel deployment
   ```

4. **FFmpeg Configuration**:
   - If using `railway.toml`: FFmpeg is included automatically
   - If using custom Dockerfile: Add `RUN apt-get update && apt-get install -y ffmpeg`

5. **Deploy**:
   - Railway will automatically build and deploy
   - Note your Railway URL (e.g., `https://yourapp.up.railway.app`)

## 🌐 Step 3: Deploy Frontend to Vercel

1. **Import Project**:
   - Go to [Vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set Root Directory: `frontend`

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Set Environment Variables**:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-url.up.railway.app
   ```

4. **Deploy**:
   - Vercel will build and deploy automatically
   - Note your Vercel URL

## 🔄 Step 4: Update CORS Configuration

1. **Go back to Railway** and update the backend environment variables:
   ```bash
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
   ```

2. **Redeploy** the Railway service to apply CORS changes

## ✅ Step 5: Verify Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-railway-url.up.railway.app/api/health
   ```

2. **Frontend Access**:
   - Open your Vercel URL
   - Verify it can communicate with the backend

3. **Test Core Functionality**:
   - Upload a video file
   - Check transcription works (Replicate)
   - Verify clip generation (Anthropic)

## 📊 Estimated Costs

### Railway (Backend Hosting)
- **Minimum**: $5/month (includes $5 usage credits)
- **Resource Usage**:
  - CPU: $0.00000772 per vCPU/second
  - Memory: $0.00000386 per GB/second
  - Storage: $0.00000006 per GB/second
- **Typical small app**: $5-10/month
- **Free trial**: 30 days with $5 credits

### Vercel (Frontend Hosting)
- **Free Tier Limits**:
  - 100 GB bandwidth/month
  - 6,000 build minutes/month
  - 1,000 serverless function executions/hour
  - 1 GB storage
- **Upgrade**: $20/month for Pro plan

### AI Services (Pay-per-use)
- **Replicate (Whisper)**: ~$0.006 per minute of audio
  - 1 hour of audio = ~$0.36
  - 10 hours = ~$3.60
- **Anthropic (Claude)**: Variable based on tokens
  - Input: ~$3 per million tokens
  - Output: ~$15 per million tokens
  - Typical clip analysis: $0.01-0.05 per video

### Total Monthly Estimate
- **Light Usage** (10 hours audio/month): $8-15/month
- **Medium Usage** (50 hours audio/month): $15-30/month
- **Heavy Usage** (200+ hours audio/month): $30-100+/month

## ⚠️ Common Gotchas & Solutions

### Railway-Specific Issues

1. **FFmpeg Not Found**:
   - Solution: Use `railway.toml` with nixpkgs configuration
   - Alternative: Create custom Dockerfile with `apt-get install ffmpeg`

2. **Memory Limits**:
   - Free trial: Limited to 0.5GB RAM
   - Solution: Video processing uses temporary files, monitor memory usage
   - Consider breaking large files into chunks

3. **Build Timeouts**:
   - Railway limits: 20 min trial, 40 min hobby
   - Solution: Optimize dependencies, use `.dockerignore`

### Vercel-Specific Issues

1. **Build Size Limits**:
   - Limit: 100MB compressed, 250MB uncompressed
   - Solution: Optimize images, use `next/image`, exclude dev dependencies

2. **Function Timeout**:
   - Free: 10 seconds, Pro: 60 seconds
   - Solution: Move heavy processing to backend

3. **Environment Variables**:
   - Must prefix client-side vars with `NEXT_PUBLIC_`
   - Solution: Double-check variable names

### General Issues

1. **CORS Errors**:
   - Check `ALLOWED_ORIGINS` environment variable
   - Verify frontend URL is correct in backend config
   - Check browser network tab for exact error

2. **API Key Issues**:
   - Verify keys are active and have correct permissions
   - Check API quotas and billing
   - Monitor usage dashboards

3. **File Upload Limits**:
   - Railway: No hard limit, but memory constraints apply
   - Vercel: 4.5MB for API routes
   - Solution: Use direct backend uploads, implement chunking

## 🔧 Maintenance & Monitoring

### Set Up Monitoring
1. **Railway**: Built-in metrics dashboard
2. **Vercel**: Analytics and function logs
3. **External**: Consider Uptime Robot for health checks

### Regular Tasks
- Monitor API usage and costs
- Update dependencies monthly
- Review and rotate API keys quarterly
- Check error logs weekly

### Scaling Considerations
- **Railway**: Vertical scaling (increase RAM/CPU)
- **Vercel**: Automatic scaling included
- **Database**: Consider adding PostgreSQL when user data grows

## 🆘 Troubleshooting

### Deployment Fails
1. Check build logs in Railway/Vercel dashboards
2. Verify all environment variables are set
3. Test build locally first
4. Check for missing dependencies

### App Not Loading
1. Verify CORS configuration
2. Check environment variable spelling
3. Test backend health endpoint directly
4. Review browser console for errors

### High Costs
1. Monitor Replicate usage (audio minutes)
2. Check Anthropic token consumption
3. Optimize prompts to reduce token usage
4. Implement caching for repeated requests

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Replicate API Docs](https://replicate.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

**Need help?** Check the troubleshooting section above or create an issue in the repository.