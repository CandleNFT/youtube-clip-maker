const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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
    return new Promise((resolve, reject) => {
      const outputDir = path.join(this.uploadsDir, jobId);
      
      // Create job-specific directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const videoPath = path.join(outputDir, 'video.%(ext)s');
      const audioPath = path.join(outputDir, 'audio.%(ext)s');

      console.log(`Downloading video from: ${youtubeUrl}`);
      
      // Download video and audio separately for better quality control
      const ytDlpArgs = [
        youtubeUrl,
        '--format', 'best[height<=1080]',
        '--output', videoPath,
        '--write-info-json',
        '--extract-flat', 'false'
      ];

      const ytDlpProcess = spawn('yt-dlp', ytDlpArgs);

      let errorOutput = '';
      let infoOutput = '';

      ytDlpProcess.stdout.on('data', (data) => {
        infoOutput += data.toString();
        console.log(`yt-dlp stdout: ${data}`);
      });

      ytDlpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`yt-dlp stderr: ${data}`);
      });

      ytDlpProcess.on('close', async (code) => {
        if (code !== 0) {
          console.error(`yt-dlp process exited with code ${code}`);
          console.error(`Error output: ${errorOutput}`);
          return reject(new Error(`Failed to download video: ${errorOutput}`));
        }

        try {
          // Find the downloaded files
          const files = fs.readdirSync(outputDir);
          const videoFile = files.find(f => f.startsWith('video.') && !f.endsWith('.json'));
          const infoFile = files.find(f => f.endsWith('.info.json'));

          if (!videoFile) {
            throw new Error('Video file not found after download');
          }

          const actualVideoPath = path.join(outputDir, videoFile);
          
          // Extract audio from video
          const actualAudioPath = await this.extractAudio(actualVideoPath, outputDir);

          // Read metadata if available
          let metadata = {};
          if (infoFile) {
            const infoPath = path.join(outputDir, infoFile);
            const infoContent = fs.readFileSync(infoPath, 'utf8');
            metadata = JSON.parse(infoContent);
          }

          resolve({
            videoPath: actualVideoPath,
            audioPath: actualAudioPath,
            metadata: {
              title: metadata.title || 'Unknown',
              duration: metadata.duration || 0,
              uploader: metadata.uploader || 'Unknown',
              uploadDate: metadata.upload_date || null,
              description: metadata.description || ''
            }
          });

        } catch (error) {
          console.error('Error processing downloaded files:', error);
          reject(error);
        }
      });

      ytDlpProcess.on('error', (error) => {
        console.error('Failed to start yt-dlp:', error);
        reject(new Error(`Failed to start yt-dlp: ${error.message}`));
      });
    });
  }

  async extractAudio(videoPath, outputDir) {
    return new Promise((resolve, reject) => {
      const audioPath = path.join(outputDir, 'audio.wav');
      
      const ffmpegArgs = [
        '-i', videoPath,
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        audioPath,
        '-y' // Overwrite if exists
      ];

      console.log(`Extracting audio with ffmpeg: ${ffmpegArgs.join(' ')}`);

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      let errorOutput = '';

      ffmpegProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // Don't log everything as ffmpeg is very verbose
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`ffmpeg process exited with code ${code}`);
          console.error(`ffmpeg error: ${errorOutput}`);
          return reject(new Error(`Failed to extract audio: ffmpeg exited with code ${code}`));
        }

        if (!fs.existsSync(audioPath)) {
          return reject(new Error('Audio file was not created'));
        }

        console.log(`Audio extracted successfully: ${audioPath}`);
        resolve(audioPath);
      });

      ffmpegProcess.on('error', (error) => {
        console.error('Failed to start ffmpeg:', error);
        reject(new Error(`Failed to start ffmpeg: ${error.message}`));
      });
    });
  }
}

module.exports = new VideoService();