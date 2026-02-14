# Deployment Guide

## Project Structure

```
youtube-clip-maker/backend/
├── services/                 # Core business logic
│   ├── videoService.js      # YouTube video download with yt-dlp
│   ├── transcriptionService.js  # Replicate Whisper API integration
│   ├── clipAnalysisService.js   # Claude AI clip analysis
│   ├── videoProcessingService.js # FFmpeg video processing
│   └── fileCleanupService.js    # Automatic file cleanup
├── scripts/
│   └── test-api.js          # API testing script
├── index.js                 # Main Express server
├── package.json             # Dependencies and scripts
├── Dockerfile              # Container configuration
├── .env.example            # Environment variables template
├── README.md               # Complete documentation
├── .gitignore              # Git ignore rules
└── DEPLOYMENT.md           # This file
```

## Quick Deploy

### 1. Railway (Recommended)

1. **Fork/Clone** this repository
2. **Go to Railway.app** and create new project
3. **Connect GitHub** repository
4. **Add Environment Variables:**
   ```
   REPLICATE_API_TOKEN=your_replicate_token
   ANTHROPIC_API_KEY=your_anthropic_key
   ```
5. **Deploy** - Railway will automatically build and deploy

### 2. Render

1. **Create Web Service** on Render
2. **Connect Repository**
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Add Environment Variables** in Render dashboard

### 3. Docker (Any Platform)

```bash
# Build
docker build -t youtube-clip-maker .

# Run
docker run -p 3000:3000 \
  -e REPLICATE_API_TOKEN=your_token \
  -e ANTHROPIC_API_KEY=your_key \
  youtube-clip-maker
```

## Required API Keys

### Replicate API (Whisper Transcription)
1. Sign up at https://replicate.com
2. Go to Account → API Tokens
3. Create new token
4. Copy token to `REPLICATE_API_TOKEN`

### Anthropic API (Claude Analysis)
1. Sign up at https://console.anthropic.com
2. Go to Account → API Keys
3. Create new key
4. Copy key to `ANTHROPIC_API_KEY`

## Testing

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start server
npm run dev

# Test API
node scripts/test-api.js
```

## API Endpoints

Once deployed, your API will have:

- `POST /api/process` - Process YouTube URL
- `GET /api/status/:jobId` - Check processing status  
- `GET /api/health` - Health check
- `GET /uploads/:jobId/clips/:filename` - Download clips

## System Requirements

- **Memory:** 2GB+ (video processing)
- **Storage:** 10GB+ temp space
- **CPU:** 2+ cores recommended
- **Network:** Good bandwidth for downloads

## Scaling Considerations

For high traffic:
1. **Use cloud storage** (S3, GCS) instead of local files
2. **Add Redis** for job status tracking
3. **Use queue system** (Bull, Agenda) for processing
4. **Add rate limiting** (already included)
5. **Monitor resource usage**

## Security Notes

- Rate limiting is enabled (5 requests/15min per IP)
- Files are automatically cleaned up after 1 hour
- Input validation on all endpoints
- CORS and Helmet security headers
- No file uploads (URLs only)

## Monitoring

Set up monitoring for:
- `/api/health` endpoint
- Disk usage (temp files)
- Memory usage during processing
- Failed job rates

## Support

The API is fully documented and ready for production deployment. Check the README.md for detailed usage instructions.