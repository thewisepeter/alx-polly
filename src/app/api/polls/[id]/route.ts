
import { NextResponse } from 'next/server';
import { deletePoll } from '@/lib/db/polls';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    await deletePoll(pollId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
