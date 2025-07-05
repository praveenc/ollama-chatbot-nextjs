import { NextResponse } from 'next/server';
import ollama from 'ollama';

export async function GET() {
  try {
    const response = await ollama.list();
    
    const foundationModels = response.models.map(model => ({
      modelId: model.name,
      modelName: model.name.split(':')[0],
    }));

    return NextResponse.json({ foundationModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models from Ollama' },
      { status: 500 }
    );
  }
}