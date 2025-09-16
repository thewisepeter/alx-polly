import { Poll, PollOption, PollResult, Vote, PollShare } from './types/database.types';

// Helper to generate UUIDs (for mock data)
const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

// Mock Users (for created_by and user_id)
export const mockUser1Id = generateUUID();
export const mockUser2Id = generateUUID();
export const mockAnonymousUserId1 = 'anon_user_1';
export const mockAnonymousUserId2 = 'anon_user_2';

// Mock Polls
export const mockPoll1: Poll = {
  id: generateUUID(),
  title: "Favorite Programming Language",
  description: "Which programming language do you prefer for daily development?",
  created_by: mockUser1Id,
  created_at: new Date('2025-01-01T10:00:00Z').toISOString(),
  updated_at: new Date('2025-01-01T10:00:00Z').toISOString(),
  is_public: true,
  allow_anonymous_votes: true,
  end_date: null, // Active poll
};

export const mockPoll2: Poll = {
  id: generateUUID(),
  title: "Best Cloud Provider",
  description: "Which cloud provider do you use most often?",
  created_by: mockUser2Id,
  created_at: new Date('2024-11-15T12:00:00Z').toISOString(),
  updated_at: new Date('2024-11-15T12:00:00Z').toISOString(),
  is_public: false, // Private poll
  allow_anonymous_votes: false,
  end_date: new Date('2025-01-10T23:59:59Z').toISOString(), // Ends soon
};

export const mockPoll3: Poll = {
  id: generateUUID(),
  title: "Favorite Editor",
  description: "What's your go-to code editor?",
  created_by: mockUser1Id,
  created_at: new Date('2024-10-01T08:00:00Z').toISOString(),
  updated_at: new Date('2024-10-01T08:00:00Z').toISOString(),
  is_public: true,
  allow_anonymous_votes: true,
  end_date: new Date('2024-10-31T23:59:59Z').toISOString(), // Ended poll
};

export const mockPolls: Poll[] = [mockPoll1, mockPoll2, mockPoll3];

// Mock Poll Options
export const mockPoll1Option1: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll1.id,
  option_text: "JavaScript",
  created_at: new Date('2025-01-01T10:05:00Z').toISOString(),
  updated_at: new Date('2025-01-01T10:05:00Z').toISOString(),
};
export const mockPoll1Option2: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll1.id,
  option_text: "Python",
  created_at: new Date('2025-01-01T10:06:00Z').toISOString(),
  updated_at: new Date('2025-01-01T10:06:00Z').toISOString(),
};
export const mockPoll1Option3: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll1.id,
  option_text: "TypeScript",
  created_at: new Date('2025-01-01T10:07:00Z').toISOString(),
  updated_at: new Date('2025-01-01T10:07:00Z').toISOString(),
};

export const mockPoll2Option1: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll2.id,
  option_text: "AWS",
  created_at: new Date('2024-11-15T12:05:00Z').toISOString(),
  updated_at: new Date('2024-11-15T12:05:00Z').toISOString(),
};
export const mockPoll2Option2: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll2.id,
  option_text: "Azure",
  created_at: new Date('2024-11-15T12:06:00Z').toISOString(),
  updated_at: new Date('2024-11-15T12:06:00Z').toISOString(),
};

export const mockPoll3Option1: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll3.id,
  option_text: "VS Code",
  created_at: new Date('2024-10-01T08:05:00Z').toISOString(),
  updated_at: new Date('2024-10-01T08:05:00Z').toISOString(),
};
export const mockPoll3Option2: PollOption = {
  id: generateUUID(),
  poll_id: mockPoll3.id,
  option_text: "IntelliJ IDEA",
  created_at: new Date('2024-10-01T08:06:00Z').toISOString(),
  updated_at: new Date('2024-10-01T08:06:00Z').toISOString(),
};

export const mockPollOptions: PollOption[] = [
  mockPoll1Option1, mockPoll1Option2, mockPoll1Option3,
  mockPoll2Option1, mockPoll2Option2,
  mockPoll3Option1, mockPoll3Option2,
];

// Mock Votes
export const mockVotes: Vote[] = [
  // Votes for Poll 1 (Active, Public, Anonymous allowed)
  { id: generateUUID(), poll_id: mockPoll1.id, option_id: mockPoll1Option1.id, user_id: mockUser1Id, anonymous_user_id: null, created_at: new Date().toISOString(), ip_address: '192.168.1.1' },
  { id: generateUUID(), poll_id: mockPoll1.id, option_id: mockPoll1Option1.id, user_id: null, anonymous_user_id: mockAnonymousUserId1, created_at: new Date().toISOString(), ip_address: '192.168.1.2' },
  { id: generateUUID(), poll_id: mockPoll1.id, option_id: mockPoll1Option2.id, user_id: mockUser2Id, anonymous_user_id: null, created_at: new Date().toISOString(), ip_address: '192.168.1.3' },
  { id: generateUUID(), poll_id: mockPoll1.id, option_id: mockPoll1Option3.id, user_id: null, anonymous_user_id: mockAnonymousUserId2, created_at: new Date().toISOString(), ip_address: '192.168.1.4' },
  { id: generateUUID(), poll_id: mockPoll1.id, option_id: mockPoll1Option1.id, user_id: generateUUID(), anonymous_user_id: null, created_at: new Date().toISOString(), ip_address: '192.168.1.5' },

  // Votes for Poll 2 (Private, Anonymous not allowed, Ends soon)
  { id: generateUUID(), poll_id: mockPoll2.id, option_id: mockPoll2Option1.id, user_id: mockUser1Id, anonymous_user_id: null, created_at: new Date().toISOString(), ip_address: '192.168.1.6' },
  { id: generateUUID(), poll_id: mockPoll2.id, option_id: mockPoll2Option1.id, user_id: mockUser2Id, anonymous_user_id: null, created_at: new Date().toISOString(), ip_address: '192.168.1.7' },

  // Votes for Poll 3 (Ended, Public, Anonymous allowed)
  { id: generateUUID(), poll_id: mockPoll3.id, option_id: mockPoll3Option1.id, user_id: mockUser1Id, anonymous_user_id: null, created_at: new Date('2024-10-10T10:00:00Z').toISOString(), ip_address: '192.168.1.8' },
  { id: generateUUID(), poll_id: mockPoll3.id, option_id: mockPoll3Option1.id, user_id: null, anonymous_user_id: mockAnonymousUserId1, created_at: new Date('2024-10-10T10:05:00Z').toISOString(), ip_address: '192.168.1.9' },
  { id: generateUUID(), poll_id: mockPoll3.id, option_id: mockPoll3Option2.id, user_id: mockUser2Id, anonymous_user_id: null, created_at: new Date('2024-10-10T10:10:00Z').toISOString(), ip_address: '192.168.1.10' },
];

// Mock Poll Results (derived from mockVotes)
export const getMockPollResults = (pollId: string, filterUserId: string | null = null, filterAnonymousUserId: string | null = null): PollResult[] => {
  const filteredVotes = mockVotes.filter(vote => 
    vote.poll_id === pollId &&
    (filterUserId === null || vote.user_id === filterUserId) &&
    (filterAnonymousUserId === null || vote.anonymous_user_id === filterAnonymousUserId)
  );

  const resultsMap = new Map<string, { option_text: string; vote_count: number }>();

  filteredVotes.forEach(vote => {
    const option = mockPollOptions.find(opt => opt.id === vote.option_id);
    if (option) {
      const current = resultsMap.get(option.id) || { option_text: option.option_text, vote_count: 0 };
      current.vote_count++;
      resultsMap.set(option.id, current);
    }
  });

  return Array.from(resultsMap.entries()).map(([option_id, data]) => ({
    option_id,
    option_text: data.option_text,
    vote_count: data.vote_count,
  }));
};

// Mock Poll Shares
export const mockPollShare1: PollShare = {
  id: generateUUID(),
  poll_id: mockPoll1.id,
  created_by: mockUser1Id,
  share_code: "active-share-code",
  created_at: new Date().toISOString(),
  expires_at: null, // Never expires
  password: null, // No password
};

export const mockPollShare2: PollShare = {
  id: generateUUID(),
  poll_id: mockPoll2.id,
  created_by: mockUser2Id,
  share_code: "protected-share-code",
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // Expires in 1 hour
  password: "securepassword", // With password
};

export const mockPollShare3: PollShare = {
  id: generateUUID(),
  poll_id: mockPoll3.id,
  created_by: mockUser1Id,
  share_code: "expired-share-code",
  created_at: new Date('2024-09-01T12:00:00Z').toISOString(),
  expires_at: new Date('2024-09-02T12:00:00Z').toISOString(), // Expired yesterday
  password: null,
};

export const mockPollShares: PollShare[] = [mockPollShare1, mockPollShare2, mockPollShare3];

export type { Poll };
