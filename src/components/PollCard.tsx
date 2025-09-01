'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Share2 } from "lucide-react";
import { Poll } from "../lib/mockData";
import { PollShare } from "./PollShare";

interface PollCardProps extends Poll {
  onViewPoll: (poll: Poll) => void;
}

export function PollCard({ id, question, options, totalVotes, createdAt, createdBy, isActive, onViewPoll }: PollCardProps) {
  const poll = { id, question, options, totalVotes, createdAt, createdBy, isActive };
  const [showShare, setShowShare] = useState(false);
  
  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewPoll(poll)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-medium mb-3">{question}</h3>
            <div className="space-y-2">
              {options.slice(0, 3).map((option) => (
                <div 
                  key={option.id}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{option.text}</span>
                    <span className="text-gray-500">{getPercentage(option.votes)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-gray-800 rounded-full transition-all"
                      style={{ width: `${getPercentage(option.votes)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {options.length > 3 && (
                <p className="text-sm text-gray-500">+{options.length - 3} more options</p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-3">{totalVotes} votes</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewPoll(poll);
              }}
            >
              Vote
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowShare(true);
              }}
              className="p-2"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Share Modal */}
      {showShare && (
        <PollShare 
          poll={poll} 
          onClose={() => setShowShare(false)} 
        />
      )}
    </Card>
  );
}