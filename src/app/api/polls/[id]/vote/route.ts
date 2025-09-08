
import { NextResponse } from 'next/server';
import { voteOnPoll } from '@/lib/db/polls';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const { optionId } = await request.json();

    const cookieStore = cookies();
    let anonymousId = cookieStore.get('anonymous_user_id')?.value;

    if (!anonymousId) {
      anonymousId = uuidv4();
      cookieStore.set('anonymous_user_id', anonymousId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    await voteOnPoll(pollId, optionId, anonymousId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting on poll:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
