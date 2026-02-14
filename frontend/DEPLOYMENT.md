# Deployment Guide

## Quick Start

### Local Development
```bash
cd /Users/tylergravez/.openclaw/workspace-carl/projects/youtube-clip-maker/frontend
npm install
cp .env.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_BASE_URL
npm run dev
```

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd /Users/tylergravez/.openclaw/workspace-carl/projects/youtube-clip-maker/frontend
   vercel
   ```

3. **Configure Environment Variables in Vercel Dashboard**:
   - Go to your Vercel project settings
   - Add `NEXT_PUBLIC_API_BASE_URL` with your production API URL
   - Example: `https://api.yourclipmaker.com`

### Environment Variables Required

**For Local Development** (`.env.local`):
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**For Production** (Vercel Dashboard):
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Vercel Project Settings

- **Framework Preset**: Next.js
- **Node.js Version**: 18.x
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### DNS Configuration

After deployment, update your DNS:
1. Point your domain to Vercel
2. Add domain in Vercel dashboard
3. Configure SSL (automatic)

### Performance Optimizations

The app is already optimized for production with:
- Next.js App Router for better performance
- Image optimization for YouTube thumbnails
- Bundle splitting and tree shaking
- CSS optimization with Tailwind
- Efficient polling for real-time updates

### Monitoring

Consider adding:
- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring
- User analytics

### Backend Requirements

Ensure your backend API supports:
- CORS for your frontend domain
- Proper error handling and status codes
- File streaming for large video downloads
- Rate limiting for API endpoints

### Troubleshooting

**Build Errors**:
- Check Node.js version (18.x required)
- Verify environment variables are set
- Clear cache with `vercel --prod --force`

**API Connection Issues**:
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check CORS settings on backend
- Ensure API endpoints return proper JSON

**Deployment Failures**:
- Check Vercel function logs
- Verify build succeeds locally first
- Review Vercel dashboard for detailed errors

## Success Checklist

- [ ] App builds successfully with `npm run build`
- [ ] Environment variables are configured
- [ ] API endpoints are accessible from frontend
- [ ] CORS is properly configured on backend
- [ ] Domain is properly configured (if using custom domain)
- [ ] SSL certificate is active
- [ ] Error handling works correctly
- [ ] Video downloads function properly