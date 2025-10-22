import OpenAI from 'openai';
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.XAI_API_KEY;

async function testXAI() {
  console.log('🧪 Testing xAI Grok Image Generation API...\n');

  if (!API_KEY) {
    console.error('❌ Error: XAI_API_KEY not found in .env.local');
    process.exit(1);
  }

  try {
    const xai = new OpenAI({
      apiKey: API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });

    console.log('✅ xAI client initialized successfully');
    console.log('📝 Generating image with prompt: "A photorealistic candid photo of two people having coffee"\n');

    const response = await xai.images.generate({
      model: 'grok-2-image-1212',
      prompt: 'Candid iPhone photograph: 35-year-old Asian woman with shoulder-length dark hair and friendly 32-year-old man having coffee at a cozy cafe, bright natural daylight, genuine laughter, making eye contact, bustling background with other patrons, shallow depth of field with natural bokeh, photorealistic, 16:9 aspect ratio',
      n: 1,
    });

    console.log('✅ Image generation complete!');
    console.log('📸 Generated image details:');
    console.log('   - Image URL:', response.data[0]?.url);
    console.log('   - Status:', response.data[0]?.url ? 'Success' : 'No response');

    if (response.data[0]?.url) {
      // Download and save the image for verification
      console.log('\n📥 Downloading image...');
      const imageUrl = response.data[0].url;
      const imageResponse = await fetch(imageUrl);

      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }

      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);

      const filename = `test-xai-${Date.now()}.jpg`;
      const filepath = join(process.cwd(), 'public', 'glimpses', filename);
      await writeFile(filepath, imageBuffer);

      console.log(`✅ Image saved to: ${filepath}`);
      console.log(`   View at: http://localhost:3001/glimpses/${filename}`);
      console.log('\n🎉 SUCCESS! xAI Grok API is working correctly with your API key!');
    } else {
      console.log('\n⚠️  WARNING: Image generated but no URL returned');
    }

  } catch (error) {
    console.error('\n❌ Error testing xAI API:');
    console.error(error);

    if (error.message?.includes('API key') || error.message?.includes('401')) {
      console.log('\n💡 Tip: Check if your API key is valid and has access to image generation');
    }
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      console.log('\n💡 Tip: You may have hit the rate limit (300 requests per minute)');
    }
  }
}

testXAI();
