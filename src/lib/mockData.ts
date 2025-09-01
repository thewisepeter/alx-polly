export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: Date;
  createdBy: string; // User email who created the poll
  isActive: boolean; // Whether the poll is still accepting votes
}

export const mockPolls: Poll[] = [
  {
    id: "1",
    question: "What's your favorite programming language?",
    options: [
      { id: "1_js", text: "JavaScript", votes: 423 },
      { id: "1_py", text: "Python", votes: 387 },
      { id: "1_ts", text: "TypeScript", votes: 298 },
      { id: "1_go", text: "Go", votes: 139 }
    ],
    totalVotes: 1247,
    createdAt: new Date('2024-12-20'),
    createdBy: "demo@example.com",
    isActive: true
  },
  {
    id: "2", 
    question: "Which framework do you prefer for web development?",
    options: [
      { id: "2_react", text: "React", votes: 445 },
      { id: "2_vue", text: "Vue", votes: 267 },
      { id: "2_angular", text: "Angular", votes: 134 },
      { id: "2_svelte", text: "Svelte", votes: 46 }
    ],
    totalVotes: 892,
    createdAt: new Date('2024-12-18'),
    createdBy: "demo@example.com",
    isActive: true
  },
  {
    id: "3",
    question: "What's the best time for team meetings?",
    options: [
      { id: "3_morning", text: "Morning (9-11 AM)", votes: 289 },
      { id: "3_afternoon", text: "Afternoon (2-4 PM)", votes: 198 },
      { id: "3_evening", text: "Evening (5-7 PM)", votes: 147 }
    ],
    totalVotes: 634,
    createdAt: new Date('2024-12-15'),
    createdBy: "john@example.com",
    isActive: false
  },
  {
    id: "4",
    question: "What's your preferred work style?",
    options: [
      { id: "4_remote", text: "Fully Remote", votes: 156 },
      { id: "4_hybrid", text: "Hybrid", votes: 234 },
      { id: "4_office", text: "In Office", votes: 78 }
    ],
    totalVotes: 468,
    createdAt: new Date('2024-12-22'),
    createdBy: "demo@example.com",
    isActive: true
  }
];