'use client'

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ArrowLeft, Users, Share2 } from "lucide-react";
import { Poll, PollOption } from "../lib/mockData";
import { PollShare } from "./PollShare";
import { useToast } from "./ui/use-toast";

interface PollVotingViewProps {
  initialPoll: Poll;
  onBack: () => void;
  initialHasVoted?: boolean;
  initialUserVote?: string;
}

export function PollVotingView({ 
  initialPoll, 
  onBack, 
  initialHasVoted = false, 
  initialUserVote 
}: PollVotingViewProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOption, setSelectedOption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [userVote, setUserVote] = useState(initialUserVote);
  const { toast } = useToast();

  const fetchPollResults = async () => {
    try {
      const response = await fetch(`/api/polls/${poll.id}/results`);
      if (response.ok) {
        const data = await response.json();
        const newOptions = poll.options.map(option => {
          const result = data.results.find((r: any) => r.option_id === option.id);
          return { ...option, votes: result ? result.vote_count : 0 };
        });
        const totalVotes = newOptions.reduce((acc, opt) => acc + opt.votes, 0);
        setPoll({ ...poll, options: newOptions, totalVotes });
      }
    } catch (error) {
      console.error("Failed to fetch poll results", error);
    }
  };

  useEffect(() => {
    if (hasVoted) {
      fetchPollResults();
    }
  }, [hasVoted]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      if (response.ok) {
        setHasVoted(true);
        setUserVote(selectedOption);
        toast({
          title: "Vote submitted",
          description: "Your vote has been successfully recorded.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error submitting vote",
          description: data.error || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error submitting vote",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (option: PollOption) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((option.votes / poll.totalVotes) * 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Polls
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{poll.question}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {poll.totalVotes} votes
                </span>
                <span>Created {formatDate(poll.createdAt)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {!hasVoted ? (
            // Voting Interface
            <div className="space-y-6">
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                <div className="space-y-3">
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label 
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button 
                onClick={handleVote}
                disabled={!selectedOption || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Submitting Vote..." : "Vote"}
              </Button>
            </div>
          ) : (
            // Results View
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800">Thank you for voting!</p>
              </div>

              <div className="space-y-4">
                {poll.options.map((option) => {
                  const percentage = getPercentage(option);
                  const isUserVote = userVote === option.id;

                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`${isUserVote ? 'font-medium text-primary' : ''}`}>
                          {option.text}
                          {isUserVote && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Your vote
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {option.votes} votes ({percentage}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-3"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Total votes: {poll.totalVotes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      {showShare && (
        <PollShare 
          poll={poll} 
          onClose={() => setShowShare(false)} 
        />
      )}
    </div>
  );
}