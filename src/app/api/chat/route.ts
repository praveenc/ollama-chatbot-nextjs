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
    const { message, modelId, temperature, topP, maxTokens, sessionId } = await request.json();

    if (!message || !modelId) {
      return new Response('Missing required fields', { status: 400 });
    }

    const model = new ChatOllama({
      baseUrl: 'http://localhost:11434',
      model: modelId,
      temperature: temperature || 0.1,
      topP: topP || 0.5,
      numPredict: maxTokens || 1024,
    });

    const history = await getMessageHistory(sessionId || 'default');
    const messages = [...history, new HumanMessage(message)];

    const stream = await model.stream(messages);

    // Add user message to history
    await addMessageToHistory(sessionId || 'default', new HumanMessage(message));

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
          await addMessageToHistory(sessionId || 'default', new AIMessage(fullResponse));
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
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}