'use client'

import { useState, useEffect } from "react";
import { PollCard } from "./PollCard";
import { Poll, PollOption } from "../lib/types/database.types"; // Import Poll from database.types

interface FeaturedPollsProps {
  onViewPoll: (poll: Poll & { options: (PollOption & { votes: number })[]; totalVotes: number }) => void;
}

// Extend Poll type for FeaturedPolls to include options with votes and totalVotes
interface FeaturedPoll extends Poll {
  options: (PollOption & { votes: number })[];
  totalVotes: number;
}

export function FeaturedPolls({ onViewPoll }: FeaturedPollsProps) {
  const [polls, setPolls] = useState<FeaturedPoll[]>([]);

  useEffect(() => {
    const fetchFeaturedPolls = async () => {
      try {
        const response = await fetch('/api/polls');
        if (response.ok) {
          const data = await response.json();
          setPolls(data.polls);
        }
      } catch (error) {
        console.error("Failed to fetch featured polls", error);
      }
    };

    fetchFeaturedPolls();
  }, []);
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-medium mb-8">Featured Polls</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              id={poll.id}
              title={poll.title}
              question={poll.title} // PollCard expects 'question', but API returns 'title'
              options={poll.options}
              totalVotes={poll.totalVotes}
              createdAt={poll.created_at} // Use created_at from database type
              createdBy={poll.created_by}
              isActive={!poll.end_date || new Date(poll.end_date) > new Date()} // Derive isActive
              onViewPoll={() => onViewPoll(poll)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}