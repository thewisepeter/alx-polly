'use client'

import { PollCard } from "./PollCard";
import { Poll } from "../lib/mockData";

interface FeaturedPollsProps {
  onViewPoll: (poll: Poll) => void;
  polls?: Poll[];
}

export function FeaturedPolls({ onViewPoll, polls }: FeaturedPollsProps) {
  // Use provided polls or import mockPolls as fallback
  const { mockPolls } = require('../lib/mockData')
  const displayPolls = polls || mockPolls
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-medium mb-8">Featured Polls</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPolls.map((poll: Poll) => (
            <PollCard
              key={poll.id}
              id={poll.id}
              question={poll.question}
              options={poll.options}
              totalVotes={poll.totalVotes}
              createdAt={poll.createdAt}
              onViewPoll={onViewPoll}
            />
          ))}
        </div>
      </div>
    </section>
  );
}