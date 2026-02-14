# YouTube Clip Maker Backend

A Node.js backend API that automatically generates viral-worthy clips from YouTube videos using AI transcription and analysis.

## Features

- 🎬 Downloads YouTube videos with `yt-dlp`
- 🎵 Extracts and transcribes audio using Replicate's Whisper API
- 🤖 AI-powered clip analysis using Claude to identify viral moments
- ✂️ Automatic video processing with `ffmpeg` to create 9:16 vertical clips
- 🗑️ Automatic file cleanup after 1 hour
- 📊 Progress tracking and error handling
- 🚀 Ready for deployment on Railway, Render, or any Docker platform

## Quick Start

### Prerequisites

- Node.js 18+
- FFmpeg
- yt-dlp
- Replicate API token
- Anthropic API key

### Local Development

1. **Clone and setup:**
   ```bash
   cd youtube-clip-maker/backend
   npm install
   ```

2. **Install system dependencies:**
   ```bash
   # macOS
   brew install ffmpeg yt-dlp
   
   # Ubuntu/Debian
   sudo apt install ffmpeg python3-pip
   pip3 install yt-dlp
   
   # Windows
   # Install ffmpeg from https://ffmpeg.org/download.html
   # Install yt-dlp with pip
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the server:**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

### Docker Deployment

1. **Build image:**
   ```bash
   docker build -t youtube-clip-maker .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 \
     -e REPLICATE_API_TOKEN=your_token \
     -e ANTHROPIC_API_KEY=your_key \
     youtube-clip-maker
   ```

### Railway/Render Deployment

1. **Railway:**
   - Connect your GitHub repo
   - Set environment variables in Railway dashboard
   - Deploy automatically

2. **Render:**
   - Create new Web Service
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

## API Endpoints

### POST `/api/process`

Process a YouTube URL to generate viral clips.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "message": "Video processing started",
  "estimatedTime": "2-5 minutes"
}
```

### GET `/api/status/:jobId`

Get processing status and results.

**Response (Processing):**
```json
{
  "status": "transcribing",
  "progress": 25,
  "message": "Transcribing audio...",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "progress": 100,
  "message": "Processing complete!",
  "clips": [
    {
      "id": 1,
      "title": "This Reaction Will Shock You",
      "startTime": 123.5,
      "endTime": 187.2,
      "duration": 63.7,
      "url": "/uploads/jobId/clips/clip_1_this_reaction_will_shock_you.mp4",
      "hookStrength": 9,
      "reason": "Unexpected emotional moment"
    }
  ],
  "completedAt": "2024-01-15T10:35:00.000Z"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## Processing Pipeline

1. **Download Video** - Uses `yt-dlp` to download video and extract metadata
2. **Extract Audio** - Uses `ffmpeg` to extract audio in WAV format
3. **Transcribe** - Sends audio to Replicate's Whisper API for transcription with timestamps
4. **Analyze** - Uses Claude to identify 5-10 viral clip moments with exact timestamps
5. **Generate Clips** - Uses `ffmpeg` to cut clips and resize to 9:16 aspect ratio
6. **Cleanup** - Automatically deletes files after 1 hour

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REPLICATE_API_TOKEN` | Yes | Replicate API token for Whisper transcription |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude analysis |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## Error Handling

The API includes comprehensive error handling:

- **Invalid URLs** - Returns 400 with validation errors
- **Download failures** - Handles yt-dlp errors gracefully
- **Transcription errors** - Retries and fallback mechanisms
- **Processing failures** - Partial results when possible
- **Rate limiting** - 5 requests per 15 minutes per IP

## File Management

- Files are stored in `/uploads/:jobId/` directories
- Automatic cleanup after 1 hour using cron jobs
- Clips are served statically via `/uploads/` endpoint
- Production: Consider using cloud storage (S3, GCS, etc.)

## Performance Notes

- Average processing time: 2-5 minutes depending on video length
- Memory usage scales with video size
- CPU intensive during ffmpeg processing
- Network dependent for API calls

## Monitoring

- Health check endpoint at `/api/health`
- Comprehensive logging with Morgan
- Process monitoring recommended (PM2, etc.)
- Consider setting up alerts for failed jobs

## Development

### Adding New Features

1. **New Services** - Add to `/services/` directory
2. **New Endpoints** - Add to main `index.js`
3. **Environment Variables** - Update `.env.example`

### Testing

```bash
# Test with a sample video
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests if applicable
4. Submit pull request

## License

MIT License - see LICENSE file for details.