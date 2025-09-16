
import { NextResponse } from 'next/server';
import { createPoll } from '@/lib/db/polls';
import { getPublicPolls, getPollById } from '@/lib/db/polls';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const allowAnonymousVotes = formData.get('allowAnonymousVotes') === 'true';

    const cookieStore = cookies();
    // Directly create Supabase client in the route handler
    const supabase = await createServerSupabaseClient(cookieStore);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('API Route POST /api/polls - Auth session missing:', sessionError?.message || 'No session data');
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

    const pollsWithFullDetails = await Promise.all(
      polls.map(async (poll) => {
        const cookieStore = cookies();
        const supabase = await createServerSupabaseClient(cookieStore);
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', poll.id);

        if (optionsError) {
          console.error('Error fetching options for poll:', optionsError);
          return { ...poll, options: [], totalVotes: 0 };
        }

        const options = optionsData || [];

        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('poll_id', poll.id);

        if (votesError) {
          console.error('Error fetching vote count for poll:', votesError);
          return { ...poll, options, totalVotes: 0 };
        }

        const totalVotes = votesData?.count || 0;

        const optionsWithVotes = await Promise.all(
          options.map(async (option) => {
            const { count: optionVoteCount, error: optionVoteCountError } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('option_id', option.id);

            if (optionVoteCountError) {
              console.error('Error fetching vote count for option:', optionVoteCountError);
              return { ...option, votes: 0 };
            }
            return { ...option, votes: optionVoteCount || 0 };
          })
        );

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          created_at: poll.created_at,
          created_by: poll.created_by,
          is_public: poll.is_public,
          allow_anonymous_votes: poll.allow_anonymous_votes,
          end_date: poll.end_date,
          options: optionsWithVotes, // Pass options with vote counts
          totalVotes: totalVotes,
        };
      })
    );

    return NextResponse.json({ success: true, polls: pollsWithFullDetails });
  } catch (error) {
    console.error('Error getting featured polls:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
