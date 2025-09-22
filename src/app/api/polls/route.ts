import { NextResponse } from 'next/server';
import { createPoll } from '@/lib/db/polls';
import { getPublicPolls } from '@/lib/db/polls';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database.types';

export async function POST(request: Request) {
  try {
    // Get cookies from the request
    const cookieStore = cookies();

    // Create Supabase client with cookies
    const supabase = await createServerSupabaseClient(cookieStore);

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('Supabase session:', session);
    console.log('Session error:', sessionError);

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Auth session missing. Please login first.' },
        { status: 401 }
      );
    }

    // Read form data
    const formData = await request.formData();
    const title = formData.get('title') as string;

    if (!title) {
      return NextResponse.json({ error: 'Poll title is required.' }, { status: 400 });
    }

    // Insert poll into Supabase
    const { data, error } = await supabase
      .from('polls')
      .insert({
        title,
        created_by: session.user.id,
        is_public: true,
        allow_anonymous_votes: false
      })
      .select();

    if (error) {
      console.error('Error inserting poll:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ poll: data });
  } catch (error) {
    console.error('Error in POST /api/polls:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
          ...poll,
          options: optionsWithVotes,
          totalVotes,
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
