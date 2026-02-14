const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class VideoProcessingService {
  constructor() {
    this.outputWidth = 1080;
    this.outputHeight = 1920; // 9:16 aspect ratio
  }

  async generateClips(videoPath, clipMoments, jobId) {
    try {
      console.log(`Processing ${clipMoments.length} clips for job ${jobId}`);
      
      const clips = [];
      const outputDir = path.dirname(videoPath);
      const clipsDir = path.join(outputDir, 'clips');

      // Create clips directory
      if (!fs.existsSync(clipsDir)) {
        fs.mkdirSync(clipsDir, { recursive: true });
      }

      // Get video dimensions first
      const videoDimensions = await this.getVideoDimensions(videoPath);
      console.log(`Original video dimensions: ${videoDimensions.width}x${videoDimensions.height}`);

      // Process each clip
      for (let i = 0; i < clipMoments.length; i++) {
        const clip = clipMoments[i];
        const clipFileName = `clip_${i + 1}_${this.sanitizeFileName(clip.title)}.mp4`;
        const clipPath = path.join(clipsDir, clipFileName);

        console.log(`Processing clip ${i + 1}/${clipMoments.length}: ${clip.title}`);

        try {
          await this.createClip(videoPath, clip, clipPath, videoDimensions);
          
          const stats = fs.statSync(clipPath);
          const clipUrl = `/uploads/${jobId}/clips/${clipFileName}`;

          clips.push({
            id: i + 1,
            title: clip.title,
            startTime: clip.startTime,
            endTime: clip.endTime,
            duration: clip.duration,
            reason: clip.reason,
            hookStrength: clip.hookStrength,
            filePath: clipPath,
            url: clipUrl,
            fileSize: stats.size,
            processed: true
          });

          console.log(`Clip ${i + 1} processed successfully: ${clipFileName}`);

        } catch (error) {
          console.error(`Failed to process clip ${i + 1}:`, error);
          
          clips.push({
            id: i + 1,
            title: clip.title,
            startTime: clip.startTime,
            endTime: clip.endTime,
            duration: clip.duration,
            error: error.message,
            processed: false
          });
        }
      }

      console.log(`Completed processing ${clips.filter(c => c.processed).length}/${clipMoments.length} clips`);
      return clips;

    } catch (error) {
      console.error('Video processing failed:', error);
      throw new Error(`Video processing failed: ${error.message}`);
    }
  }

  async getVideoDimensions(videoPath) {
    return new Promise((resolve, reject) => {
      const ffprobeArgs = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        videoPath
      ];

      const ffprobeProcess = spawn('ffprobe', ffprobeArgs);
      
      let outputData = '';
      let errorData = '';

      ffprobeProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      ffprobeProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      ffprobeProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`ffprobe failed: ${errorData}`));
        }

        try {
          const probeData = JSON.parse(outputData);
          const videoStream = probeData.streams.find(stream => stream.codec_type === 'video');
          
          if (!videoStream) {
            return reject(new Error('No video stream found'));
          }

          resolve({
            width: videoStream.width,
            height: videoStream.height,
            duration: parseFloat(probeData.format.duration)
          });

        } catch (error) {
          reject(new Error(`Failed to parse ffprobe output: ${error.message}`));
        }
      });

      ffprobeProcess.on('error', (error) => {
        reject(new Error(`ffprobe process failed: ${error.message}`));
      });
    });
  }

  async createClip(videoPath, clipMoment, outputPath, videoDimensions) {
    return new Promise((resolve, reject) => {
      // Calculate crop and scale filters for 9:16 aspect ratio
      const { cropFilter, scaleFilter } = this.calculateVideoFilters(videoDimensions);
      
      const ffmpegArgs = [
        '-i', videoPath,
        '-ss', clipMoment.startTime.toString(),
        '-t', clipMoment.duration.toString(),
        '-vf', `${cropFilter},${scaleFilter}`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', '+faststart', // Optimize for web playback
        '-avoid_negative_ts', 'make_zero',
        outputPath,
        '-y' // Overwrite if exists
      ];

      console.log(`ffmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
      
      let errorOutput = '';

      ffmpegProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`ffmpeg failed for clip: ${errorOutput}`);
          return reject(new Error(`ffmpeg failed with code ${code}: ${errorOutput}`));
        }

        if (!fs.existsSync(outputPath)) {
          return reject(new Error(`Output file was not created: ${outputPath}`));
        }

        resolve();
      });

      ffmpegProcess.on('error', (error) => {
        reject(new Error(`ffmpeg process failed: ${error.message}`));
      });
    });
  }

  calculateVideoFilters(videoDimensions) {
    const { width: inputWidth, height: inputHeight } = videoDimensions;
    const targetAspect = 9 / 16; // 0.5625
    const currentAspect = inputWidth / inputHeight;

    let cropFilter, scaleFilter;

    if (currentAspect > targetAspect) {
      // Video is too wide, crop horizontally
      const newWidth = Math.floor(inputHeight * targetAspect);
      const cropX = Math.floor((inputWidth - newWidth) / 2);
      cropFilter = `crop=${newWidth}:${inputHeight}:${cropX}:0`;
    } else {
      // Video is too tall, crop vertically
      const newHeight = Math.floor(inputWidth / targetAspect);
      const cropY = Math.floor((inputHeight - newHeight) / 2);
      cropFilter = `crop=${inputWidth}:${newHeight}:0:${cropY}`;
    }

    // Scale to target resolution
    scaleFilter = `scale=${this.outputWidth}:${this.outputHeight}`;

    return { cropFilter, scaleFilter };
  }

  sanitizeFileName(title) {
    return title
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 50); // Limit length
  }
}

module.exports = new VideoProcessingService();