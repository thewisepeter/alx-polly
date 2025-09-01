'use client'

import { Button } from "./ui/button";

interface HeroSectionProps {
  onCreatePoll: () => void;
  onViewPolls: () => void;
  isAuthenticated: boolean;
}

export function HeroSection({ onCreatePoll, onViewPolls, isAuthenticated }: HeroSectionProps) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-medium mb-8 max-w-4xl mx-auto leading-tight">
          Create, share, and vote on polls instantly
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="min-w-[140px]" onClick={onCreatePoll}>
            {isAuthenticated ? "Create a Poll" : "Sign In to Create"}
          </Button>
          <Button variant="outline" size="lg" className="min-w-[140px]" onClick={onViewPolls}>
            View Polls
          </Button>
        </div>
        
        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            Sign in to create polls, track your votes, and access sharing features
          </p>
        )}
      </div>
    </section>
  );
}