import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database, NewPoll, NewPollOption, NewVote, Poll, PollOption, PollResult, PollShare, Vote } from '../types/database.types';
import { cookies } from 'next/headers';
import { 
  mockPolls, 
  mockPollOptions, 
  mockVotes, 
  mockPollShares, 
  getMockPollResults, 
  mockUser1Id,
  mockUser2Id,
  mockAnonymousUserId1
} from '@/lib/mockData';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

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
  if (USE_MOCK_DATA) {
    const newPoll: Poll = {
      id: 'mock-poll-' + Math.random().toString(36).substring(7),
      title,
      description,
      created_by: mockUser1Id, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: isPublic,
      allow_anonymous_votes: allowAnonymousVotes,
      end_date: endDate ? endDate.toISOString() : null,
    };
    mockPolls.push(newPoll);

    options.forEach(optionText => {
      mockPollOptions.push({
        id: 'mock-option-' + Math.random().toString(36).substring(7),
        poll_id: newPoll.id,
        option_text: optionText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
    return newPoll;
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();

  console.log('createPoll - session:', session ? 'Session exists' : 'No session');
  console.log('createPoll - session.user:', session && session.user ? session.user.id : 'No session user');

  if (sessionError || !session || !session.user) {
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
  if (USE_MOCK_DATA) {
    const poll = mockPolls.find(p => p.id === pollId);
    if (!poll) return null;
    const options = mockPollOptions.filter(o => o.poll_id === pollId);
    return { poll, options };
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
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
  if (USE_MOCK_DATA) {
    // For mock data, we'll assume mockUser1Id is the current user
    return mockPolls.filter(poll => poll.created_by === mockUser1Id);
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  
  if (userError || !user) {
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
  if (USE_MOCK_DATA) {
    return mockPolls.filter(poll => poll.is_public).slice(0, limit);
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
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
  if (USE_MOCK_DATA) {
    const poll = mockPolls.find(p => p.id === pollId);
    const option = mockPollOptions.find(o => o.id === optionId);

    if (!poll || !option) {
      throw new Error('Poll or option not found');
    }

    const existingVote = mockVotes.find(v => 
      v.poll_id === pollId && (
        (v.user_id && v.user_id === mockUser1Id) || // Assuming mockUser1Id is current authenticated user for mock voting
        (v.anonymous_user_id && v.anonymous_user_id === anonymousUserId)
      )
    );

    if (existingVote) {
      throw new Error('You have already voted on this poll');
    }

    mockVotes.push({
      id: 'mock-vote-' + Math.random().toString(36).substring(7), // Generate a unique ID for mock data
      poll_id: pollId,
      option_id: optionId,
      user_id: anonymousUserId ? null : mockUser1Id, // Simulate user1 voting or anonymous
      anonymous_user_id: anonymousUserId || null,
      created_at: new Date().toISOString(),
      ip_address: '127.0.0.1', // Mock IP
    });
    return;
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  
  // Check if the poll allows anonymous votes if no user is authenticated
  if (userError || !user && !anonymousUserId) {
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
export async function getPollResults(
  pollId: string,
  filterUserId: string | null = null,
  filterAnonymousUserId: string | null = null
): Promise<PollResult[]> {
  if (USE_MOCK_DATA) {
    return getMockPollResults(pollId, filterUserId, filterAnonymousUserId);
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  const { data, error } = await supabaseServer
    .rpc('get_poll_results', { 
      poll_id: pollId, 
      filter_user_id: filterUserId, 
      filter_anonymous_user_id: filterAnonymousUserId
    }) as { data: PollResult[] | null, error: PostgrestError | null };
  
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
  if (USE_MOCK_DATA) {
    // For mock data, assume user1 has voted on poll1
    return mockVotes.some(v => v.poll_id === pollId && v.user_id === mockUser1Id);
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  
  if (userError || !user) {
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
export async function createPollShare(
  pollId: string,
  password: string | null = null,
  expiresAt: Date | null = null
): Promise<PollShare> {
  if (USE_MOCK_DATA) {
    const newShare: PollShare = {
      id: 'mock-share-' + Math.random().toString(36).substring(7),
      poll_id: pollId,
      created_by: mockUser1Id, // Assume user1 creates share links
      share_code: 'mock-share-' + Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
      expires_at: expiresAt?.toISOString() || null,
      password: password, // Store plain password for mock testing
    };
    mockPollShares.push(newShare);
    return newShare;
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  
  // Generate a random share code
  const shareCode = Math.random().toString(36).substring(2, 10);
  
  // TODO: Hash password before storing
  const hashedPassword = password; // Placeholder for now

  const newPollShareData: NewPollShare = { 
    poll_id: pollId,
    created_by: user?.id || null,
    share_code: shareCode,
    password: hashedPassword,
    expires_at: expiresAt?.toISOString() || null,
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
export async function getPollByShareCode(shareCode: string): Promise<{ pollShare: PollShare; poll: Poll; options: PollOption[] } | null> {
  if (USE_MOCK_DATA) {
    const share = mockPollShares.find(s => s.share_code === shareCode);
    if (!share) return null;
    const poll = mockPolls.find(p => p.id === share.poll_id);
    if (!poll) return null;
    const options = mockPollOptions.filter(o => o.poll_id === poll.id);
    return { pollShare: share, poll, options };
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
  // Get the share
  const { data: share, error: shareError } = await supabaseServer
    .from('poll_shares')
    .select('*, poll_id(*)') // Select all from poll_shares and join with polls table
    .eq('share_code', shareCode)
    .single();
  
  if (shareError) {
    if (shareError.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error fetching poll share:', shareError);
    throw shareError;
  }

  if (!share || !share.poll_id) {
    throw new Error('Invalid share code or associated poll not found');
  }

  const pollData = await getPollById(share.poll_id.id); // Access the nested poll_id object

  if (!pollData) {
    return null;
  }
  
  return { pollShare: share, poll: pollData.poll, options: pollData.options };
}

/**
 * Delete a poll
 */
export async function deletePoll(pollId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    const index = mockPolls.findIndex(p => p.id === pollId);
    if (index !== -1) {
      mockPolls.splice(index, 1);
      mockPollOptions.filter(o => o.poll_id !== pollId);
      mockVotes.filter(v => v.poll_id !== pollId);
      mockPollShares.filter(s => s.poll_id !== pollId);
    }
    return;
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
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
  if (USE_MOCK_DATA) {
    const poll = mockPolls.find(p => p.id === pollId);
    if (!poll) throw new Error('Poll not found');

    if (updates.title) poll.title = updates.title;
    if (updates.description !== undefined) poll.description = updates.description;
    if (updates.isPublic !== undefined) poll.is_public = updates.isPublic;
    if (updates.allowAnonymousVotes !== undefined) poll.allow_anonymous_votes = updates.allowAnonymousVotes;
    if (updates.endDate !== undefined) poll.end_date = updates.endDate?.toISOString() || null;
    poll.updated_at = new Date().toISOString();
    return poll;
  }

  const cookieStore = cookies();
  const supabaseServer = await createServerSupabaseClient(cookieStore);
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