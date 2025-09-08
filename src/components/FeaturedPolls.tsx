'use client'

import { useState, useEffect } from "react";
import { PollCard } from "./PollCard";
import { Poll } from "../lib/mockData";

interface FeaturedPollsProps {
  onViewPoll: (poll: Poll) => void;
}

export function FeaturedPolls({ onViewPoll }: FeaturedPollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);

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
          {polls.map((poll: any) => (
            <PollCard
              key={poll.id}
              id={poll.id}
              question={poll.title}
              options={poll.options}
              totalVotes={poll.totalVotes}
              createdAt={poll.createdAt}
              onViewPoll={() => onViewPoll(poll)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}