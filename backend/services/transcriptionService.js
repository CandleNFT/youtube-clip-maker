const axios = require('axios');
const fs = require('fs');

class TranscriptionService {
  constructor() {
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!this.replicateApiToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable is required');
    }
  }

  async transcribeAudio(audioPath) {
    try {
      console.log(`Starting transcription for: ${audioPath}`);
      
      // Check if file exists
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // Upload file to a temporary URL (in production, use cloud storage)
      const audioBase64 = fs.readFileSync(audioPath, 'base64');
      const dataUrl = `data:audio/wav;base64,${audioBase64}`;

      // Create prediction
      const prediction = await this.createPrediction(dataUrl);
      
      // Wait for completion and get result
      const result = await this.waitForCompletion(prediction.id);
      
      console.log('Transcription completed successfully');
      return this.parseTranscriptionResult(result);

    } catch (error) {
      console.error('Transcription failed:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  async createPrediction(audioDataUrl) {
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2',
        input: {
          audio: audioDataUrl,
          model: 'large-v3',
          transcription: 'srt',  // Get timestamps
          translate: false,
          temperature: 0,
          suppress_tokens: '-1',
          logprob_threshold: -1.0,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
          temperature_increment_on_fallback: 0.2
        }
      },
      {
        headers: {
          'Authorization': `Token ${this.replicateApiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Prediction created: ${response.data.id}`);
    return response.data;
  }

  async waitForCompletion(predictionId, maxWaitTime = 600000) { // 10 minutes max
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${this.replicateApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const prediction = response.data;
      console.log(`Prediction status: ${prediction.status}`);

      if (prediction.status === 'succeeded') {
        return prediction.output;
      } else if (prediction.status === 'failed') {
        throw new Error(`Transcription failed: ${prediction.error || 'Unknown error'}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Transcription timed out');
  }

  parseTranscriptionResult(output) {
    try {
      // Whisper returns transcription in SRT format when transcription: 'srt' is specified
      const srtContent = output.transcription || output;
      
      if (typeof srtContent !== 'string') {
        throw new Error('Invalid transcription output format');
      }

      // Parse SRT format to extract segments with timestamps
      const segments = this.parseSRT(srtContent);
      
      // Also get plain text
      const text = segments.map(segment => segment.text).join(' ');

      return {
        text,
        segments,
        language: output.detected_language || 'en'
      };

    } catch (error) {
      console.error('Error parsing transcription result:', error);
      throw new Error(`Failed to parse transcription: ${error.message}`);
    }
  }

  parseSRT(srtContent) {
    const segments = [];
    const blocks = srtContent.trim().split('\n\n');

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const index = parseInt(lines[0]);
        const timecodeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        
        if (timecodeMatch) {
          const startTime = this.srtTimeToSeconds(timecodeMatch[1]);
          const endTime = this.srtTimeToSeconds(timecodeMatch[2]);
          const text = lines.slice(2).join(' ').trim();

          segments.push({
            index,
            start: startTime,
            end: endTime,
            text
          });
        }
      }
    }

    return segments;
  }

  srtTimeToSeconds(srtTime) {
    // Convert SRT timestamp format (HH:MM:SS,mmm) to seconds
    const [time, milliseconds] = srtTime.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    
    return hours * 3600 + minutes * 60 + seconds + parseInt(milliseconds) / 1000;
  }
}

module.exports = new TranscriptionService();