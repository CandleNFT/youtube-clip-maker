const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

class VideoService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async downloadVideo(youtubeUrl, jobId) {
    const outputDir = path.join(this.uploadsDir, jobId);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Downloading video from: ${youtubeUrl}`);
    
    const videoPath = path.join(outputDir, 'video.mp4');
    const audioPath = path.join(outputDir, 'audio.mp3');

    try {
      // Use yt-dlp with --cookies-from-browser workaround disabled
      // Try basic download first
      const ytdlpCmd = `yt-dlp "${youtubeUrl}" -f "best[height<=720]" -o "${videoPath}" --no-check-certificates --no-warnings 2>&1`;
      
      console.log('Running yt-dlp...');
      const result = execSync(ytdlpCmd, { timeout: 300000, maxBuffer: 50 * 1024 * 1024 });
      console.log('yt-dlp output:', result.toString());

      if (!fs.existsSync(videoPath)) {
        // Check for different extension
        const files = fs.readdirSync(outputDir);
        const videoFile = files.find(f => f.startsWith('video.'));
        if (videoFile) {
          const actualPath = path.join(outputDir, videoFile);
          fs.renameSync(actualPath, videoPath);
        } else {
          throw new Error('Video file not found after download');
        }
      }

      console.log('Video downloaded, extracting audio...');
      await this.extractAudio(videoPath, audioPath);

      return {
        videoPath,
        audioPath,
        outputDir,
        metadata: {
          title: 'Downloaded Video',
          duration: null
        }
      };
    } catch (error) {
      console.error('Download failed:', error.message);
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  extractAudio(videoPath, audioPath) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-vn',
        '-acodec', 'libmp3lame',
        '-q:a', '2',
        '-y',
        audioPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(audioPath);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  cleanupJob(jobId) {
    const jobDir = path.join(this.uploadsDir, jobId);
    if (fs.existsSync(jobDir)) {
      fs.rmSync(jobDir, { recursive: true, force: true });
    }
  }
}

module.exports = new VideoService();
