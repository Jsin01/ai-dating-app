import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

async function testVeo() {
  console.log('🧪 Testing Veo 3.1 API...\n');

  try {
    const client = new GoogleGenAI({
      apiKey: API_KEY,
    });

    console.log('✅ Client initialized successfully');
    console.log('📝 Generating video with prompt: "A cat walking in a park"\n');

    console.log('🔄 Using Veo 3.1 Preview...\n');

    const operation = await client.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: 'A cat walking in a park',
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
        resolution: '720p',
        personGeneration: 'allow_all',
      },
    });

    console.log('✅ Video generation started!');
    console.log('⏳ Operation ID:', operation.name);
    console.log('⏳ Polling for completion (this may take 30-60 seconds)...\n');

    let currentOp = operation;
    let pollCount = 0;

    while (!currentOp.done) {
      pollCount++;
      console.log(`   Poll ${pollCount}: Waiting...`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      currentOp = await client.operations.getVideosOperation({ operation: currentOp });
    }

    console.log('\n✅ Video generation complete!');
    console.log('📹 Generated video details:');
    console.log('   - Video URI:', currentOp.response?.generatedVideos?.[0]?.video?.uri);
    console.log('   - Status:', currentOp.response ? 'Success' : 'No response');

    if (currentOp.response?.generatedVideos?.[0]) {
      console.log('\n🎉 SUCCESS! Veo 3.1 API is working correctly with your API key!');
    } else {
      console.log('\n⚠️  WARNING: Video generated but no video data returned');
    }

  } catch (error) {
    console.error('\n❌ Error testing Veo API:');
    console.error(error);

    if (error.message?.includes('API key')) {
      console.log('\n💡 Tip: Check if your API key is valid and has Veo 3.1 access enabled');
    }
  }
}

testVeo();
