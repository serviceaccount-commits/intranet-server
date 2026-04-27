import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env['GEMINI_AI_API_KEY'];

if (!apiKey) {
  console.error('GEMINI_AI_API_KEY not found in environment variables.');
  process.exit(1);
}

async function listModels() {
  try {
    // Note: The listModels method might not be directly available on the main instance depending on the SDK version.
    // If it's not, we might need to use the model manager or similar.
    // However, looking at documentation, it's often on the client or via a specific manager.
    // Let's try to infer from typical usage or just try a standard model first.
    // Actually, for this SDK, it might not expose listModels easily in the main class.
    // Let's try to just run a test with 'gemini-pro' and 'gemini-1.5-flash' to see what works.

    console.log('Fetching available models via API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as any;
    console.log('Available Models:');
    if (data.models) {
      data.models.forEach((model: any) => {
        console.log(
          `- ${model.name} (${model.supportedGenerationMethods.join(', ')})`,
        );
      });
    } else {
      console.log('No models found in response:', data);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

listModels();
