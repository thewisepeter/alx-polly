
import { NextResponse } from 'next/server';
import { getPollByShareCode } from '@/lib/db/polls';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const shareCode = params.code;
    const pollData = await getPollByShareCode(shareCode);

    if (!pollData) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pollId: pollData.poll.id });
  } catch (error) {
    console.error('Error getting poll by share code:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
