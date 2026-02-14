const ytdl = require('@distube/ytdl-core');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

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
      // Get video info
      const info = await ytdl.getInfo(youtubeUrl);
      const title = info.videoDetails.title;
      const duration = parseInt(info.videoDetails.lengthSeconds);

      console.log(`Video: ${title}, Duration: ${duration}s`);

      // Download video
      await new Promise((resolve, reject) => {
        const video = ytdl(youtubeUrl, {
          quality: 'highest',
          filter: 'audioandvideo'
        });

        const writeStream = fs.createWriteStream(videoPath);
        video.pipe(writeStream);

        video.on('error', reject);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      console.log('Video downloaded, extracting audio...');

      // Extract audio using ffmpeg
      await this.extractAudio(videoPath, audioPath);

      return {
        videoPath,
        audioPath,
        outputDir,
        metadata: {
          title,
          duration
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

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(audioPath);
        } else {
          console.error('FFmpeg error:', stderr);
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
