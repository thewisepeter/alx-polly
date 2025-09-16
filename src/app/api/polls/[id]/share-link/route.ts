import { NextResponse } from 'next/server';
import { createPollShare } from '@/lib/db/polls';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const { password, expiresAt } = await request.json();

    const pollShare = await createPollShare(pollId, password, expiresAt ? new Date(expiresAt) : null);

    return NextResponse.json({ success: true, shareCode: pollShare.share_code });
  } catch (error) {
    console.error('Error creating poll share link:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
