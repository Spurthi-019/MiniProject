const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in .env');
    return;
  }

  console.log('🔍 Listing available Gemini models...\n');
  console.log('API Key:', apiKey.substring(0, 15) + '...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Try to list models
    const models = await genAI.listModels();
    console.log('✅ Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.log('❌ Error listing models:', error.message);
    console.log('\n💡 Trying common model names...\n');
    
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log(`✅ ${modelName} WORKS!`);
        console.log(`   Response: ${response.text().substring(0, 50)}...\n`);
      } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message}\n`);
      }
    }
  }
}

listModels();
