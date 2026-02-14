const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const videoService = require('./services/videoService');
const transcriptionService = require('./services/transcriptionService');
const clipAnalysisService = require('./services/clipAnalysisService');
const videoProcessingService = require('./services/videoProcessingService');
const fileCleanupService = require('./services/fileCleanupService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/process', limiter);

// Start file cleanup service
fileCleanupService.startCleanupService();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'YouTube Clip Maker API',
    version: '1.0.0',
    endpoints: {
      'POST /api/process': 'Process YouTube URL to generate clips',
      'GET /api/status/:jobId': 'Get processing status',
      'GET /api/health': 'Health check'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main processing endpoint
app.post('/api/process',
  [
    body('url')
      .isURL()
      .withMessage('Valid YouTube URL is required')
      .matches(/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/)
      .withMessage('Must be a valid YouTube URL')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { url } = req.body;
    const jobId = require('uuid').v4();

    try {
      // Send immediate response with job ID
      res.json({
        jobId,
        status: 'processing',
        message: 'Video processing started',
        estimatedTime: '2-5 minutes'
      });

      // Process asynchronously
      processVideo(jobId, url);

    } catch (error) {
      console.error('Error starting video processing:', error);
      res.status(500).json({
        error: 'Failed to start processing',
        message: error.message
      });
    }
  }
);

// Status endpoint
app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const status = getJobStatus(jobId);
  
  if (!status) {
    return res.status(404).json({
      error: 'Job not found',
      jobId
    });
  }
  
  res.json(status);
});

// Job status storage (in production, use Redis or database)
const jobStatuses = new Map();

function updateJobStatus(jobId, status) {
  jobStatuses.set(jobId, {
    ...jobStatuses.get(jobId),
    ...status,
    updatedAt: new Date().toISOString()
  });
}

function getJobStatus(jobId) {
  return jobStatuses.get(jobId);
}

async function processVideo(jobId, youtubeUrl) {
  try {
    // Initialize job status
    updateJobStatus(jobId, {
      status: 'downloading',
      progress: 0,
      message: 'Downloading video...'
    });

    // Step 1: Download video
    console.log(`[${jobId}] Starting video download...`);
    const { videoPath, audioPath, metadata } = await videoService.downloadVideo(youtubeUrl, jobId);
    
    updateJobStatus(jobId, {
      status: 'transcribing',
      progress: 25,
      message: 'Transcribing audio...',
      metadata
    });

    // Step 2: Transcribe audio
    console.log(`[${jobId}] Starting transcription...`);
    const transcript = await transcriptionService.transcribeAudio(audioPath);
    
    updateJobStatus(jobId, {
      status: 'analyzing',
      progress: 50,
      message: 'Analyzing content for viral moments...',
      transcript
    });

    // Step 3: Analyze for clips
    console.log(`[${jobId}] Analyzing for viral moments...`);
    const clipMoments = await clipAnalysisService.identifyClipMoments(transcript, metadata);
    
    updateJobStatus(jobId, {
      status: 'processing_clips',
      progress: 75,
      message: 'Generating video clips...',
      clipMoments
    });

    // Step 4: Process video clips
    console.log(`[${jobId}] Processing video clips...`);
    const clips = await videoProcessingService.generateClips(videoPath, clipMoments, jobId);
    
    // Complete
    updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      message: 'Processing complete!',
      clips,
      completedAt: new Date().toISOString()
    });

    console.log(`[${jobId}] Processing completed successfully`);

  } catch (error) {
    console.error(`[${jobId}] Processing failed:`, error);
    updateJobStatus(jobId, {
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.listen(PORT, () => {
  console.log(`YouTube Clip Maker API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;