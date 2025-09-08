
import { NextResponse } from 'next/server';
import { getPollResults } from '@/lib/db/polls';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const results = await getPollResults(pollId);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error getting poll results:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
