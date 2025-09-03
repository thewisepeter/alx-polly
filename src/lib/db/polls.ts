import { supabase } from '../supabase';
import { createServerSupabaseClient, getServerUser, getServerSession } from '../supabase-server';
import { NewPoll, NewPollOption, NewVote, Poll, PollOption, PollResult, PollShare, Vote } from '../types/database.types';

/**
 * Create a new poll with options
 */
export async function createPoll(
  title: string,
  description: string | null,
  options: string[],
  isPublic: boolean = true,
  allowAnonymousVotes: boolean = true,
  endDate: Date | null = null,
  userId: string
): Promise<Poll | null> {
  // Use server-side Supabase client
  const supabaseServer = await createServerSupabaseClient();
  
  // Start a transaction
  const { data: poll, error: pollError } = await supabaseServer
    .from('polls')
    .insert({
      title,
      description,
      created_by: userId,
      is_public: isPublic,
      allow_anonymous_votes: allowAnonymousVotes,
      end_date: endDate?.toISOString() || null,
    })
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
  const pollOptions = options.map(option => ({
    poll_id: poll.id,
    option_text: option,
  }));
  
  const { error: optionsError } = await supabaseServer
    .from('poll_options')
    .insert(pollOptions);
  
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
  // Get the poll
  const { data: poll, error: pollError } = await supabase
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
  const { data: options, error: optionsError } = await supabase
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
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    throw new Error('User must be authenticated to get their polls');
  }
  
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const user = (await supabase.auth.getUser()).data.user;
  
  // Check if the poll allows anonymous votes if no user is authenticated
  if (!user && !anonymousUserId) {
    const { data: poll, error: pollError } = await supabase
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
    const { data: existingVote, error: voteCheckError } = await supabase
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
    const { data: existingVote, error: voteCheckError } = await supabase
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
  const { error } = await supabase
    .from('votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user?.id || null,
      anonymous_user_id: !user ? anonymousUserId : null,
    });
  
  if (error) {
    console.error('Error voting on poll:', error);
    throw error;
  }
}

/**
 * Get poll results
 */
export async function getPollResults(pollId: string): Promise<PollResult[]> {
  const { data, error } = await supabase
    .rpc('get_poll_results', { poll_id: pollId });
  
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
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    return false;
  }
  
  const { data, error } = await supabase
    .rpc('has_user_voted', { poll_id: pollId, user_id: user.id });
  
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
  const user = (await supabase.auth.getUser()).data.user;
  
  // Generate a random share code
  const shareCode = Math.random().toString(36).substring(2, 10);
  
  const { data, error } = await supabase
    .from('poll_shares')
    .insert({
      poll_id: pollId,
      created_by: user?.id || null,
      share_code: shareCode,
    })
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
  // Get the share
  const { data: share, error: shareError } = await supabase
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
  const { error } = await supabase
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
  const { data, error } = await supabase
    .from('polls')
    .update({
      title: updates.title,
      description: updates.description,
      is_public: updates.isPublic,
      allow_anonymous_votes: updates.allowAnonymousVotes,
      end_date: updates.endDate?.toISOString() || null,
      updated_at: new Date().toISOString(),
    })
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