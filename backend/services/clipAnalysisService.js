const axios = require('axios');

class ClipAnalysisService {
  constructor() {
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!this.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
  }

  async identifyClipMoments(transcript, metadata) {
    try {
      console.log('Starting clip analysis with Claude...');
      
      const prompt = this.buildAnalysisPrompt(transcript, metadata);
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': this.anthropicApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const analysisResult = response.data.content[0].text;
      console.log('Claude analysis completed');
      
      return this.parseClipMoments(analysisResult);

    } catch (error) {
      console.error('Clip analysis failed:', error);
      throw new Error(`Clip analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(transcript, metadata) {
    const { text, segments } = transcript;
    const duration = metadata.duration;
    const title = metadata.title;

    return `You are an expert video editor specializing in creating viral short-form content. Analyze this YouTube video transcript and identify 5-10 potential viral clip moments that would work well as YouTube Shorts, TikToks, or Instagram Reels.

VIDEO DETAILS:
Title: ${title}
Duration: ${duration} seconds

TRANSCRIPT WITH TIMESTAMPS:
${this.formatTranscriptForAnalysis(segments)}

FULL TEXT:
${text}

INSTRUCTIONS:
1. Identify 5-10 potential viral moments (aim for the most engaging content)
2. Each clip should be 15-60 seconds long (ideal for short-form platforms)
3. Look for moments that are:
   - Surprising, shocking, or unexpected
   - Emotionally engaging (funny, inspirational, controversial)
   - Self-contained stories or punchlines
   - Quotable or shareable
   - Have strong hooks in the first 3 seconds

4. For each clip, provide:
   - Start timestamp (in seconds, precise to 0.1s)
   - End timestamp (in seconds, precise to 0.1s)
   - Compelling clip title (8-12 words max, hook-focused)
   - Brief reason why it would be viral
   - Hook strength (1-10 rating)

OUTPUT FORMAT (JSON only, no other text):
{
  "clips": [
    {
      "startTime": 123.5,
      "endTime": 187.2,
      "title": "This Teacher's Reaction Will Shock You",
      "reason": "Unexpected emotional moment with strong visual payoff",
      "hookStrength": 9,
      "duration": 63.7
    }
  ]
}

Focus on moments that would make someone stop scrolling and watch. Prioritize quality over quantity.`;
  }

  formatTranscriptForAnalysis(segments) {
    return segments.map(segment => {
      const minutes = Math.floor(segment.start / 60);
      const seconds = (segment.start % 60).toFixed(1);
      return `[${minutes}:${seconds.padStart(4, '0')}] ${segment.text}`;
    }).join('\n');
  }

  parseClipMoments(analysisResult) {
    try {
      // Extract JSON from the response
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in analysis result');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.clips || !Array.isArray(parsed.clips)) {
        throw new Error('Invalid clip analysis format');
      }

      // Validate and clean the clips
      const validClips = parsed.clips.filter(clip => {
        return (
          typeof clip.startTime === 'number' &&
          typeof clip.endTime === 'number' &&
          clip.endTime > clip.startTime &&
          clip.title &&
          typeof clip.title === 'string'
        );
      }).map(clip => {
        // Ensure duration is calculated
        clip.duration = clip.endTime - clip.startTime;
        
        // Ensure reasonable clip length (15-120 seconds)
        if (clip.duration < 15) {
          clip.endTime = clip.startTime + 15;
          clip.duration = 15;
        }
        if (clip.duration > 120) {
          clip.endTime = clip.startTime + 60;
          clip.duration = 60;
        }

        return {
          startTime: parseFloat(clip.startTime.toFixed(1)),
          endTime: parseFloat(clip.endTime.toFixed(1)),
          duration: parseFloat(clip.duration.toFixed(1)),
          title: clip.title.trim(),
          reason: clip.reason || 'Engaging content',
          hookStrength: clip.hookStrength || 5
        };
      });

      // Sort by hook strength descending
      validClips.sort((a, b) => (b.hookStrength || 5) - (a.hookStrength || 5));

      // Limit to top 10 clips
      const finalClips = validClips.slice(0, 10);

      console.log(`Identified ${finalClips.length} potential viral clips`);
      
      return finalClips;

    } catch (error) {
      console.error('Error parsing clip moments:', error);
      console.error('Analysis result:', analysisResult);
      
      // Fallback: create some basic clips if parsing fails
      return this.createFallbackClips(analysisResult);
    }
  }

  createFallbackClips(transcript) {
    console.log('Creating fallback clips due to parsing error');
    
    // Simple fallback: create clips at regular intervals
    const segments = transcript.segments || [];
    if (segments.length === 0) return [];

    const clips = [];
    const totalDuration = segments[segments.length - 1]?.end || 300;
    const clipDuration = 45; // 45 second clips
    const numberOfClips = Math.min(5, Math.floor(totalDuration / clipDuration));

    for (let i = 0; i < numberOfClips; i++) {
      const startTime = i * clipDuration;
      const endTime = Math.min(startTime + clipDuration, totalDuration);
      
      clips.push({
        startTime,
        endTime,
        duration: endTime - startTime,
        title: `Highlight ${i + 1}`,
        reason: 'Auto-generated clip',
        hookStrength: 5
      });
    }

    return clips;
  }
}

module.exports = new ClipAnalysisService();