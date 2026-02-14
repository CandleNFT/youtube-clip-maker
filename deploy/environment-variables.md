# Environment Variables Configuration

This document lists all required environment variables for the YouTube Clip Maker application.

## Backend (Railway) Environment Variables

### Required Variables
```bash
# AI Services
REPLICATE_API_TOKEN=r_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: File Upload Limits
MAX_FILE_SIZE_MB=100
TEMP_DIR=/tmp/uploads

# Optional: Logging
LOG_LEVEL=info
```

### Variable Descriptions

**REPLICATE_API_TOKEN**
- Get from: https://replicate.com/account/api-tokens
- Used for: Whisper transcription and other AI models
- Format: `r_` followed by alphanumeric string
- Cost: ~$0.006 per minute of audio

**ANTHROPIC_API_KEY**
- Get from: https://console.anthropic.com/
- Used for: Content analysis and clip generation
- Format: `sk-ant-` followed by alphanumeric string
- Cost: Variable based on token usage

**FRONTEND_URL**
- Production URL of your Vercel deployment
- Used for: CORS configuration
- Example: `https://your-app.vercel.app`

**ALLOWED_ORIGINS**
- Comma-separated list of allowed frontend URLs
- Include both Vercel URL and any custom domains
- Used for: CORS security

## Frontend (Vercel) Environment Variables

### Required Variables
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Variable Descriptions

**NEXT_PUBLIC_BACKEND_URL**
- URL of your Railway backend deployment
- Must start with `NEXT_PUBLIC_` to be available in browser
- Example: `https://youtube-clip-maker-backend.up.railway.app`

## Setting Environment Variables

### On Railway:
1. Go to your project dashboard
2. Click on your service
3. Navigate to "Variables" tab
4. Add each environment variable
5. Deploy to apply changes

### On Vercel:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development
4. Redeploy to apply changes

## Security Notes

- Never commit API keys to version control
- Use different keys for development and production
- Rotate API keys regularly
- Monitor API usage to detect unauthorized access
- Keep CORS origins restrictive (don't use wildcards in production)

## Cost Monitoring

**Replicate Usage:**
- Monitor at: https://replicate.com/account/billing
- Set up usage alerts
- Typical cost: $0.006/minute for Whisper

**Anthropic Usage:**
- Monitor at: https://console.anthropic.com/settings/billing
- Track token consumption
- Set monthly spending limits