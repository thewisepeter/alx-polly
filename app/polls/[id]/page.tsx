import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for a specific poll
const mockPollOptions = [
  { id: "1", text: "JavaScript", votes: 15 },
  { id: "2", text: "Python", votes: 12 },
  { id: "3", text: "TypeScript", votes: 8 },
  { id: "4", text: "Rust", votes: 7 },
];

export default function PollPage({ params }: { params: { id: string } }) {
  const pollId = params.id;
  
  // In a real app, you would fetch the poll data based on the ID
  const poll = {
    id: pollId,
    title: "Favorite Programming Language",
    description: "What's your favorite programming language?",
    totalVotes: mockPollOptions.reduce((sum, option) => sum + option.votes, 0),
    created: "2023-05-15",
    options: mockPollOptions,
  };

  // Calculate percentages for the progress bars
  const getPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
  };

  return (
    <div className="container py-10">
      <Link href="/polls" className="text-primary mb-6 block">
        ← Back to all polls
      </Link>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>Created on {poll.created}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{poll.description}</p>
          
          <div className="space-y-4">
            {poll.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between">
                  <span>{option.text}</span>
                  <span className="text-muted-foreground">
                    {option.votes} votes ({getPercentage(option.votes)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${getPercentage(option.votes)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Vote</Button>
        </CardFooter>
      </Card>
    </div>
  );
}