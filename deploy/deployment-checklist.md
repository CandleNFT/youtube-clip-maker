# ✅ Deployment Checklist

Use this checklist to ensure your YouTube Clip Maker app is properly deployed and configured.

## 🎯 Pre-Deployment Setup

### API Keys & Accounts
- [ ] **Replicate account** created and API token generated
- [ ] **Anthropic account** created and API key generated  
- [ ] **Railway account** created (with $5 trial credits)
- [ ] **Vercel account** created
- [ ] **GitHub repository** contains both frontend and backend code

### Repository Structure
- [ ] Frontend in `/frontend` directory with `package.json`
- [ ] Backend in `/backend` directory with `package.json`
- [ ] Railway config copied to backend (`railway.toml` or `Procfile`)
- [ ] Vercel config copied to frontend (`vercel.json`)
- [ ] CORS configuration added to backend
- [ ] Health check endpoint added to backend (`/api/health`)

## 🚀 Railway Backend Deployment

### Project Setup
- [ ] Railway project created from GitHub repo
- [ ] Root directory set to `backend`
- [ ] Build detected as Node.js
- [ ] Start command configured (`npm start`)

### Environment Variables
- [ ] `REPLICATE_API_TOKEN` - Set with valid token
- [ ] `ANTHROPIC_API_KEY` - Set with valid key
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Set to `3001` (or default)
- [ ] `FRONTEND_URL` - Set to Vercel URL (update after Vercel deployment)
- [ ] `ALLOWED_ORIGINS` - Set to Vercel URL

### FFmpeg Configuration
- [ ] FFmpeg installation configured in `railway.toml` OR
- [ ] Custom Dockerfile with FFmpeg installation

### Deployment Verification
- [ ] Build completed successfully
- [ ] Service is running (green status)
- [ ] Health endpoint accessible: `https://your-app.up.railway.app/api/health`
- [ ] Railway URL noted for Vercel configuration

## 🌐 Vercel Frontend Deployment

### Project Setup  
- [ ] Vercel project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Framework preset detected as Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables
- [ ] `NEXT_PUBLIC_BACKEND_URL` - Set to Railway URL
- [ ] Optional analytics variables configured

### Deployment Verification
- [ ] Build completed successfully
- [ ] Site is accessible
- [ ] Frontend can communicate with backend
- [ ] Vercel URL noted for Railway CORS update

## 🔄 Post-Deployment Configuration

### CORS Update
- [ ] Railway backend `FRONTEND_URL` updated with Vercel URL
- [ ] Railway backend `ALLOWED_ORIGINS` updated
- [ ] Railway service redeployed to apply CORS changes
- [ ] CORS functionality tested (no browser console errors)

### Domain Configuration (Optional)
- [ ] Custom domain added to Vercel
- [ ] DNS configured for custom domain
- [ ] SSL certificate verified
- [ ] Railway CORS updated with custom domain

## ✨ Functionality Testing

### Basic Functionality
- [ ] Frontend loads without errors
- [ ] Backend health endpoint responds
- [ ] File upload interface works
- [ ] CORS allows frontend-backend communication

### AI Integration Testing
- [ ] Audio file upload works
- [ ] Replicate Whisper transcription functions
- [ ] Anthropic Claude analysis works
- [ ] Generated clips display properly
- [ ] Error handling works for API failures

### Performance Testing
- [ ] Large file uploads (within limits)
- [ ] Multiple concurrent requests
- [ ] Response times acceptable
- [ ] Memory usage within Railway limits

## 📊 Monitoring Setup

### Cost Monitoring
- [ ] Replicate usage alerts configured
- [ ] Anthropic spending limits set
- [ ] Railway resource usage monitored
- [ ] Vercel bandwidth tracking enabled

### Application Monitoring
- [ ] Error logging configured
- [ ] Health check monitoring (optional: Uptime Robot)
- [ ] Performance metrics tracking
- [ ] User analytics (optional)

### Security Verification
- [ ] CORS properly restricts origins
- [ ] API keys not exposed in frontend
- [ ] HTTPS enabled for all endpoints
- [ ] Rate limiting configured (recommended)

## 🔧 Documentation

### User Documentation
- [ ] Setup instructions documented
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide created

### Developer Documentation
- [ ] Deployment process documented
- [ ] Configuration options explained
- [ ] Scaling considerations noted
- [ ] Cost optimization tips included

## 🚨 Backup & Recovery

### Code Backup
- [ ] Code committed to GitHub
- [ ] Production branch protected
- [ ] Deployment triggered from main/production branch
- [ ] Environment variables backed up securely

### Configuration Backup
- [ ] Railway environment variables documented
- [ ] Vercel environment variables documented
- [ ] Domain configurations noted
- [ ] API key sources documented

## 🎯 Go-Live Checklist

### Final Verification
- [ ] All features working end-to-end
- [ ] Error handling tested
- [ ] Cost monitoring active
- [ ] Team access configured
- [ ] User feedback mechanism ready

### Launch Preparation
- [ ] Marketing site updated with app links
- [ ] Social media announcements prepared
- [ ] User onboarding flow tested
- [ ] Support channels ready

### Post-Launch
- [ ] Monitor error rates first 24 hours
- [ ] Track user signup/usage patterns
- [ ] Review cost impact after first week
- [ ] Collect user feedback for improvements

---

## 🆘 Common Issues & Solutions

### Build Failures
- **Issue**: Frontend build fails
- **Solution**: Check for missing environment variables, verify Next.js config

### CORS Errors  
- **Issue**: Frontend can't connect to backend
- **Solution**: Verify ALLOWED_ORIGINS includes frontend URL exactly

### High Costs
- **Issue**: Unexpected AI service charges
- **Solution**: Check for processing loops, implement rate limiting

### Performance Issues
- **Issue**: Slow response times
- **Solution**: Optimize file processing, check Railway resource limits

---

## 📝 Notes Section

Use this space for deployment-specific notes:

**Railway URL**: ________________________________

**Vercel URL**: ________________________________

**Custom Domain**: ________________________________

**API Key Sources**: 
- Replicate: ________________________________
- Anthropic: ________________________________

**Team Access**:
- Railway: ________________________________
- Vercel: ________________________________

**Deployment Date**: ________________________________

**Next Review Date**: ________________________________