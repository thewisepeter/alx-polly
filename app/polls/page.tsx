import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for polls
const mockPolls = [
  {
    id: "1",
    title: "Favorite Programming Language",
    description: "What's your favorite programming language?",
    votes: 42,
    created: "2023-05-15",
  },
  {
    id: "2",
    title: "Best Frontend Framework",
    description: "Which frontend framework do you prefer?",
    votes: 38,
    created: "2023-05-10",
  },
  {
    id: "3",
    title: "Remote Work Preference",
    description: "Do you prefer working remotely or in an office?",
    votes: 56,
    created: "2023-05-05",
  },
];

export default function PollsPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Polls</h1>
        <Link href="/create-poll">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPolls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <CardDescription>Created on {poll.created}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{poll.description}</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">{poll.votes} votes</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}