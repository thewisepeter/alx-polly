import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { createServerSupabaseClient, getServerUser, getServerSession } from '../supabase-server';
import { Database, NewPoll, NewPollOption, NewVote, Poll, PollOption, PollResult, PollShare, Vote } from '../types/database.types';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

/**
 * Create a new poll with options
 */
export async function createPoll(
  title: string,
  description: string | null,
  options: string[],
  isPublic: boolean = true,
  allowAnonymousVotes: boolean = true,
  endDate: Date | null = null
): Promise<Poll | null> {
  // Use server-side Supabase client
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();

  const session = await getServerSession();

  console.log('createPoll - session:', session ? 'Session exists' : 'No session');
  console.log('createPoll - session.user:', session && session.user ? session.user.id : 'No session user');

  if (!session || !session.user) {
    throw new Error('User must be authenticated to create a poll');
  }
  const user = session.user;
  
  // Start a transaction
  const newPollData: NewPoll = {
    title,
    description,
    created_by: user.id,
    is_public: isPublic,
    allow_anonymous_votes: allowAnonymousVotes,
    end_date: endDate ? endDate.toISOString() : null,
  };
  const { data: poll, error: pollError } = await supabaseServer
    .from('polls')
    .insert<NewPoll>(newPollData)
    .select()
    .single();
  
  if (pollError) {
    console.error('Error creating poll:', pollError);
    throw pollError;
  }
  
  if (!poll) {
    throw new Error('Failed to create poll');
  }
  
  // Insert options
  const pollOptionsData = options.map(option => ({
     poll_id: poll.id,
     option_text: option,
   })) satisfies NewPollOption[];
  const { error: optionsError } = await supabaseServer
    .from('poll_options')
    .insert(pollOptionsData);
  
  if (optionsError) {
    console.error('Error creating poll options:', optionsError);
    // Try to clean up the poll since options failed
    await supabaseServer.from('polls').delete().eq('id', poll.id);
    throw optionsError;
  }
  
  return poll;
}

/**
 * Get a poll by ID with its options
 */
export async function getPollById(pollId: string): Promise<{ poll: Poll; options: PollOption[] } | null> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  // Get the poll
  const { data: poll, error: pollError } = await supabaseServer
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();
  
  if (pollError) {
    if (pollError.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error fetching poll:', pollError);
    throw pollError;
  }
  
  // Get the options
  const { data: options, error: optionsError } = await supabaseServer
    .from('poll_options')
    .select('*')
    .eq('poll_id', pollId)
    .order('created_at', { ascending: true });
  
  if (optionsError) {
    console.error('Error fetching poll options:', optionsError);
    throw optionsError;
  }
  
  return { poll, options: options || [] };
}

/**
 * Get polls created by the current user
 */
export async function getMyPolls(): Promise<Poll[]> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const user = (await supabaseServer.auth.getUser()).data.user;
  
  if (!user) {
    throw new Error('User must be authenticated to get their polls');
  }
  
  const { data, error } = await supabaseServer
    .from('polls')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user polls:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get public polls
 */
export async function getPublicPolls(limit: number = 10): Promise<Poll[]> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const { data, error } = await supabaseServer
    .from('polls')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching public polls:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Vote on a poll
 */
export async function voteOnPoll(
  pollId: string,
  optionId: string,
  anonymousUserId?: string
): Promise<void> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const user = (await supabaseServer.auth.getUser()).data.user;
  
  // Check if the poll allows anonymous votes if no user is authenticated
  if (!user && !anonymousUserId) {
    const { data: poll, error: pollError } = await supabaseServer
      .from('polls')
      .select('allow_anonymous_votes')
      .eq('id', pollId)
      .single();
    
    if (pollError) {
      console.error('Error checking poll:', pollError);
      throw pollError;
    }
    
    if (!poll.allow_anonymous_votes) {
      throw new Error('This poll does not allow anonymous votes');
    }
    
    if (!anonymousUserId) {
      throw new Error('Anonymous user ID is required for anonymous voting');
    }
  }
  
  // Check if user has already voted
  if (user) {
    const { data: existingVote, error: voteCheckError } = await supabaseServer
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      throw voteCheckError;
    }
    
    if (existingVote) {
      throw new Error('You have already voted on this poll');
    }
  } else if (anonymousUserId) {
    const { data: existingVote, error: voteCheckError } = await supabaseServer
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('anonymous_user_id', anonymousUserId)
      .maybeSingle();
    
    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      throw voteCheckError;
    }
    
    if (existingVote) {
      throw new Error('You have already voted on this poll');
    }
  }
  
  // Create the vote
  const newVoteData = { 
    poll_id: pollId,
    option_id: optionId,
    user_id: user?.id || null,
    anonymous_user_id: !user ? anonymousUserId : null,
  } satisfies NewVote;
  const { error } = await supabaseServer
    .from('votes')
    .insert<NewVote>(newVoteData);
  
  if (error) {
    console.error('Error voting on poll:', error);
    throw error;
  }
}

/**
 * Get poll results
 */
export async function getPollResults(pollId: string): Promise<PollResult[]> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const { data, error } = await supabaseServer
    .rpc('get_poll_results', { poll_id: pollId }) as { data: PollResult[] | null, error: PostgrestError | null };
  
  if (error) {
    console.error('Error getting poll results:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Check if the current user has voted on a poll
 */
export async function hasUserVoted(pollId: string): Promise<boolean> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const user = (await supabaseServer.auth.getUser()).data.user;
  
  if (!user) {
    return false;
  }
  
  const { data, error } = await supabaseServer
    .rpc('has_user_voted', { poll_id: pollId, user_id: user.id }) as { data: boolean | null, error: PostgrestError | null };
  
  if (error) {
    console.error('Error checking if user voted:', error);
    throw error;
  }
  
  return data || false;
}

/**
 * Create a share link for a poll
 */
export async function createPollShare(pollId: string): Promise<PollShare> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const user = (await supabaseServer.auth.getUser()).data.user;
  
  // Generate a random share code
  const shareCode = Math.random().toString(36).substring(2, 10);
  
  const newPollShareData: NewPollShare = { 
    poll_id: pollId,
    created_by: user?.id || null,
    share_code: shareCode,
  };
  const { data, error } = await supabaseServer
    .from('poll_shares')
    .insert<NewPollShare>(newPollShareData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating poll share:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to create poll share');
  }
  
  return data;
}

/**
 * Get a poll by share code
 */
export async function getPollByShareCode(shareCode: string): Promise<{ poll: Poll; options: PollOption[] } | null> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  // Get the share
  const { data: share, error: shareError } = await supabaseServer
    .from('poll_shares')
    .select('poll_id')
    .eq('share_code', shareCode)
    .single();
  
  if (shareError) {
    if (shareError.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error fetching poll share:', shareError);
    throw shareError;
  }
  
  // Get the poll with options
  return await getPollById(share.poll_id);
}

/**
 * Delete a poll
 */
export async function deletePoll(pollId: string): Promise<void> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const { error } = await supabaseServer
    .from('polls')
    .delete()
    .eq('id', pollId);
  
  if (error) {
    console.error('Error deleting poll:', error);
    throw error;
  }
}

/**
 * Update a poll
 */
export async function updatePoll(
  pollId: string,
  updates: {
    title?: string;
    description?: string | null;
    isPublic?: boolean;
    allowAnonymousVotes?: boolean;
    endDate?: Date | null;
  }
): Promise<Poll> {
  const supabaseServer: SupabaseClient<Database> = await createServerSupabaseClient();
  const updateData: UpdatePoll = { 
    title: updates.title,
    description: updates.description,
    is_public: updates.isPublic,
    allow_anonymous_votes: updates.allowAnonymousVotes,
    end_date: updates.endDate?.toISOString() || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseServer
    .from('polls')
    .update<UpdatePoll>(updateData)
    .eq('id', pollId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating poll:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to update poll');
  }
  
  return data;
}