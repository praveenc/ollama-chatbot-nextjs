import { NextRequest, NextResponse } from 'next/server';
import { InMemoryStore } from '@langchain/core/stores';
import { BaseMessage } from '@langchain/core/messages';

const messageStore = new InMemoryStore<BaseMessage[]>();

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    await messageStore.mdelete([sessionId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear history API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}