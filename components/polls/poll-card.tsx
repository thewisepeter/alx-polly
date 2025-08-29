import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type PollCardProps = {
  id: string;
  title: string;
  description: string;
  votes: number;
  created: string;
};

export function PollCard({ id, title, description, votes, created }: PollCardProps) {
  return (
    <Link href={`/polls/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Created on {created}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">{votes} votes</p>
        </CardFooter>
      </Card>
    </Link>
  );
}