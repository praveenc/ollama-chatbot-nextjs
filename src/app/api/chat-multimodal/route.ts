import { NextRequest } from 'next/server';
import { ChatOllama } from "@langchain/ollama";
import { InMemoryStore } from '@langchain/core/stores';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

const messageStore = new InMemoryStore<BaseMessage[]>();

const getMessageHistory = async (sessionId: string): Promise<BaseMessage[]> => {
  const history = await messageStore.mget([sessionId]);
  return history[0] || [];
};

const addMessageToHistory = async (sessionId: string, message: BaseMessage) => {
  const history = await getMessageHistory(sessionId);
  history.push(message);
  await messageStore.mset([[sessionId, history]]);
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const modelId = formData.get('modelId') as string;
    const temperature = parseFloat(formData.get('temperature') as string) || 0.1;
    const topP = parseFloat(formData.get('topP') as string) || 0.5;
    const maxTokens = parseInt(formData.get('maxTokens') as string) || 1024;
    const sessionId = formData.get('sessionId') as string || 'default';

    const files = formData.getAll('files') as File[];

    if (!message || !modelId) {
      return new Response('Missing required fields', { status: 400 });
    }

    const model = new ChatOllama({
      baseUrl: 'http://localhost:11434',
      model: modelId,
      temperature,
      topP,
      numPredict: maxTokens,
    });

    // Handle images for multimodal models
    if (files.length > 0) {
      const images: string[] = [];

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          images.push(base64);
        }
      }

      if (images.length > 0) {
        const boundModel = model.bind({ images });
        const history = await getMessageHistory(sessionId);
        const messages = [...history, new HumanMessage(message)];

        const stream = await boundModel.stream(messages);

        // Add user message to history
        await addMessageToHistory(sessionId, new HumanMessage(message));

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              let fullResponse = '';
              for await (const chunk of stream) {
                const content = chunk.content || '';
                fullResponse += content;
                const encoded = encoder.encode(content);
                controller.enqueue(encoded);
              }
              // Add AI response to history
              await addMessageToHistory(sessionId, new AIMessage(fullResponse));
              controller.close();
            } catch (error) {
              console.error('Streaming error:', error);
              controller.error(error);
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked',
          },
        });
      }
    }

    // Fallback to regular text chat with history
    const history = await getMessageHistory(sessionId);
    const messages = [...history, new HumanMessage(message)];

    const stream = await model.stream(messages);

    // Add user message to history
    await addMessageToHistory(sessionId, new HumanMessage(message));

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          for await (const chunk of stream) {
            const content = chunk.content || '';
            fullResponse += content;
            const encoded = encoder.encode(content);
            controller.enqueue(encoded);
          }
          // Add AI response to history
          await addMessageToHistory(sessionId, new AIMessage(fullResponse));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Multimodal chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}