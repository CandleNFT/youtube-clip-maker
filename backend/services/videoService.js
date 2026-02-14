const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

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
    
    try {
      // Use Cobalt API for reliable YouTube downloads
      const cobaltResponse = await this.fetchFromCobalt(youtubeUrl);
      
      if (!cobaltResponse.url) {
        throw new Error('No download URL returned from Cobalt');
      }

      const videoPath = path.join(outputDir, 'video.mp4');
      const audioPath = path.join(outputDir, 'audio.mp3');
      
      // Download the video file
      await this.downloadFile(cobaltResponse.url, videoPath);
      
      // Extract audio using ffmpeg
      await this.extractAudio(videoPath, audioPath);

      return {
        videoPath,
        audioPath,
        outputDir,
        metadata: {
          title: cobaltResponse.filename || 'Unknown',
          duration: null
        }
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  fetchFromCobalt(youtubeUrl) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        url: youtubeUrl,
        vCodec: "h264",
        vQuality: "720",
        aFormat: "mp3",
        isAudioOnly: false,
        isNoTTWatermark: true,
        isTTFullAudio: false,
        disableMetadata: false
      });

      const options = {
        hostname: 'api.cobalt.tools',
        port: 443,
        path: '/api/json',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.status === 'error') {
              reject(new Error(parsed.text || 'Cobalt API error'));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error('Failed to parse Cobalt response'));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      const protocol = url.startsWith('https') ? https : http;
      
      const request = (downloadUrl) => {
        protocol.get(downloadUrl, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            file.close();
            fs.unlinkSync(destPath);
            const newFile = fs.createWriteStream(destPath);
            const redirectProtocol = response.headers.location.startsWith('https') ? https : http;
            redirectProtocol.get(response.headers.location, (redirectResponse) => {
              redirectResponse.pipe(newFile);
              newFile.on('finish', () => {
                newFile.close();
                resolve(destPath);
              });
            }).on('error', reject);
            return;
          }
          
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(destPath);
          });
        }).on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      };

      request(url);
    });
  }

  extractAudio(videoPath, audioPath) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
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
