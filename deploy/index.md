# 🎬 YouTube Clip Maker - Deployment Resources

Welcome to the deployment configuration for your YouTube Clip Maker application. This directory contains everything you need to deploy your app to production.

## 📁 Files Overview

### 🚀 Quick Start
- **[deploy.sh](./deploy.sh)** - Automated deployment setup script
- **[deployment-checklist.md](./deployment-checklist.md)** - Step-by-step deployment checklist

### 📖 Documentation  
- **[README.md](./README.md)** - Complete deployment guide with step-by-step instructions
- **[pricing-summary.md](./pricing-summary.md)** - Detailed cost analysis and optimization tips
- **[environment-variables.md](./environment-variables.md)** - All required environment variables

### ⚙️ Configuration Files
- **[vercel.json](./vercel.json)** - Vercel deployment configuration for Next.js frontend
- **[railway.toml](./railway.toml)** - Railway deployment configuration for Node.js backend
- **[Procfile](./Procfile)** - Alternative Railway configuration (simpler approach)
- **[cors-config.js](./cors-config.js)** - CORS setup for secure frontend-backend communication

## 🎯 Quick Start Guide

### Option 1: Automated Setup (Recommended)
```bash
# Run the deployment setup script
./deploy.sh
```

### Option 2: Manual Setup
1. Read the [complete deployment guide](./README.md)
2. Follow the [deployment checklist](./deployment-checklist.md)
3. Configure environment variables using [this guide](./environment-variables.md)

## 💰 Cost Summary

| Component | Cost | Notes |
|-----------|------|--------|
| **Railway** (Backend) | $5/month minimum | Includes $5 credits |
| **Vercel** (Frontend) | Free for most apps | $20/month for Pro |
| **Replicate** (Whisper) | $0.006/minute audio | Pay-per-use |
| **Anthropic** (Claude) | ~$3-15/1M tokens | Pay-per-use |

**Typical monthly cost for light usage**: $8-15/month

See [pricing-summary.md](./pricing-summary.md) for detailed cost analysis.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Next.js)     │───▶│   (Node.js)     │
│   @ Vercel      │    │   @ Railway     │
└─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  AI Services    │
                    │  Replicate +    │
                    │  Anthropic      │
                    └─────────────────┘
```

## 🔧 Environment Setup

### Backend (Railway)
```bash
REPLICATE_API_TOKEN=r_xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
```

## 📋 Deployment Checklist

- [ ] API keys obtained (Replicate, Anthropic)
- [ ] GitHub repository prepared
- [ ] Railway project created and configured
- [ ] Vercel project deployed
- [ ] Environment variables set
- [ ] CORS configuration updated
- [ ] End-to-end testing completed

## 🆘 Common Issues

### CORS Errors
- **Problem**: Frontend can't connect to backend
- **Solution**: Check `ALLOWED_ORIGINS` in Railway matches your Vercel URL exactly

### Build Failures
- **Problem**: Deployment fails during build
- **Solution**: Test builds locally first, check environment variables

### High Costs
- **Problem**: Unexpected charges from AI services
- **Solution**: Monitor usage, implement rate limiting, optimize prompts

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FFmpeg in Docker](https://github.com/jrottenberg/ffmpeg)

## 🤝 Support

If you encounter issues:

1. Check the [troubleshooting section](./README.md#troubleshooting) in the main guide
2. Review the [deployment checklist](./deployment-checklist.md)
3. Verify all environment variables are set correctly
4. Check the service logs in Railway/Vercel dashboards

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor API usage and costs monthly
- Update dependencies quarterly
- Rotate API keys annually
- Review and optimize based on usage patterns

### Version Updates
- Test updates in development first
- Deploy backend first, then frontend
- Monitor for errors after deployment
- Keep rollback plan ready

---

## 🎉 Ready to Deploy?

1. **Start here**: Run `./deploy.sh` for automated setup
2. **Need details**: Read the [complete guide](./README.md)  
3. **Want checklist**: Use the [deployment checklist](./deployment-checklist.md)

**Happy deploying! 🚀**