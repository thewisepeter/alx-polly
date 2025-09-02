'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

import {
  createPoll,
  deletePoll,
  getPollById,
  getPollByShareCode,
  getPollResults,
  getPublicPolls,
  updatePoll,
  voteOnPoll,
  createPollShare
} from '../db/polls';
import { NewPoll, PollOption, PollResult } from '../types/database.types';

/**
 * Create a new poll with options
 */
export async function createPollAction(
  formData: FormData
): Promise<{ success: boolean; pollId?: string; error?: string }> {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const allowAnonymousVotes = formData.get('allowAnonymousVotes') === 'true';
    
    // Get options from form data
    const options: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('option-') && value && typeof value === 'string' && value.trim() !== '') {
        options.push(value.trim());
      }
    }
    
    // Validate inputs
    if (!title || title.trim() === '') {
      return { success: false, error: 'Title is required' };
    }
    
    if (options.length < 2) {
      return { success: false, error: 'At least two options are required' };
    }
    
    // Create the poll
    const poll = await createPoll(
      title.trim(),
      description ? description.trim() : null,
      options,
      isPublic,
      allowAnonymousVotes,
      null // No end date for now
    );
    
    if (!poll) {
      return { success: false, error: 'Failed to create poll' };
    }
    
    revalidatePath('/my-polls');
    revalidatePath('/');
    
    return { success: true, pollId: poll.id };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Vote on a poll
 */
export async function voteOnPollAction(
  pollId: string,
  optionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // For anonymous users, we'll use a cookie to track their votes
    const cookieStore = await cookies();
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
    
    revalidatePath(`/poll/${pollId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error voting on poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Get poll results
 */
export async function getPollResultsAction(
  pollId: string
): Promise<{ success: boolean; results?: PollResult[]; error?: string }> {
  try {
    const results = await getPollResults(pollId);
    return { success: true, results };
  } catch (error) {
    console.error('Error getting poll results:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Delete a poll
 */
export async function deletePollAction(
  pollId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deletePoll(pollId);
    
    revalidatePath('/my-polls');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Generate a QR code for a poll
 */
export async function generatePollQRCodeAction(
  pollId: string,
  baseUrl: string
): Promise<{ success: boolean; qrCode?: string; shareUrl?: string; error?: string }> {
  try {
    // Create a share link
    const share = await createPollShare(pollId);
    
    // Generate the share URL
    const shareUrl = `${baseUrl}/poll/share/${share.share_code}`;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    
    return { success: true, qrCode, shareUrl };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Get featured polls for the homepage
 */
export async function getFeaturedPollsAction(): Promise<{ 
  success: boolean; 
  polls?: Array<{ id: string; title: string; description: string | null; optionCount: number }>;
  error?: string 
}> {
  try {
    const polls = await getPublicPolls(6); // Get 6 most recent public polls
    
    // For each poll, get the number of options
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
    
    return { success: true, polls: pollsWithOptionCount };
  } catch (error) {
    console.error('Error getting featured polls:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Get a poll by share code
 */
export async function getPollByShareCodeAction(
  shareCode: string
): Promise<{ success: boolean; pollId?: string; error?: string }> {
  try {
    const pollData = await getPollByShareCode(shareCode);
    
    if (!pollData) {
      return { success: false, error: 'Poll not found' };
    }
    
    return { success: true, pollId: pollData.poll.id };
  } catch (error) {
    console.error('Error getting poll by share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}