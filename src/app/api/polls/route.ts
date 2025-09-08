
import { NextResponse } from 'next/server';
import { createPoll } from '@/lib/db/polls';
import { getPublicPolls, getPollById } from '@/lib/db/polls';
import { getServerSession } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const allowAnonymousVotes = formData.get('allowAnonymousVotes') === 'true';

    const sessionResult = await getServerSession();

    if (sessionResult.error || !sessionResult.data?.session) {
      return NextResponse.json({ error: 'Auth session missing.' }, { status: 401 });
    }

    const options: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('option-') && value && typeof value === 'string' && value.trim() !== '') {
        options.push(value.trim());
      }
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (options.length < 2) {
      return NextResponse.json({ error: 'At least two options are required' }, { status: 400 });
    }

    const poll = await createPoll(
      title.trim(),
      description ? description.trim() : null,
      options,
      isPublic,
      allowAnonymousVotes,
      null
    );

    if (!poll) {
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
    }

    return NextResponse.json({ success: true, pollId: poll.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating poll:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const polls = await getPublicPolls(6);

    const pollsWithOptionCount = await Promise.all(
      polls.map(async (poll) => {
        const pollData = await getPollById(poll.id);
        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          optionCount: pollData?.options.length || 0,
        };
      })
    );

    return NextResponse.json({ success: true, polls: pollsWithOptionCount });
  } catch (error) {
    console.error('Error getting featured polls:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
