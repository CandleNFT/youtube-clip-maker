#!/usr/bin/env node

/**
 * Simple test script to verify the API is working
 * Usage: node scripts/test-api.js [youtube-url]
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const TEST_URL = process.argv[2] || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function testAPI() {
  try {
    console.log('🧪 Testing YouTube Clip Maker API');
    console.log(`📡 API Base: ${API_BASE}`);
    console.log(`🎬 Test Video: ${TEST_URL}`);
    console.log('');

    // Test health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('');

    // Test video processing
    console.log('2️⃣ Starting video processing...');
    const processResponse = await axios.post(`${API_BASE}/api/process`, {
      url: TEST_URL
    });
    
    const jobId = processResponse.data.jobId;
    console.log(`✅ Job started: ${jobId}`);
    console.log(`⏱️ Estimated time: ${processResponse.data.estimatedTime}`);
    console.log('');

    // Poll for status
    console.log('3️⃣ Polling for status updates...');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (!completed && attempts < maxAttempts) {
      attempts++;
      
      try {
        const statusResponse = await axios.get(`${API_BASE}/api/status/${jobId}`);
        const status = statusResponse.data;
        
        console.log(`📊 [${attempts}] Status: ${status.status} (${status.progress || 0}%) - ${status.message}`);
        
        if (status.status === 'completed') {
          completed = true;
          console.log('');
          console.log('🎉 Processing completed successfully!');
          console.log(`📽️ Generated ${status.clips?.length || 0} clips:`);
          
          if (status.clips) {
            status.clips.forEach((clip, index) => {
              console.log(`   ${index + 1}. ${clip.title}`);
              console.log(`      Duration: ${clip.duration}s (${clip.startTime}s - ${clip.endTime}s)`);
              console.log(`      Hook Strength: ${clip.hookStrength}/10`);
              console.log(`      URL: ${API_BASE}${clip.url}`);
              console.log('');
            });
          }
          break;
          
        } else if (status.status === 'failed') {
          console.log('❌ Processing failed:', status.error);
          break;
        }
        
      } catch (error) {
        console.log(`⚠️ Status check failed: ${error.message}`);
      }
      
      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (!completed && attempts >= maxAttempts) {
      console.log('⏰ Polling timeout reached');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

console.log('YouTube Clip Maker API Test');
console.log('===========================');
testAPI();