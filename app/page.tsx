import { Button } from "@/components/ui/button";
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">Welcome to Polly</h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        Create, share, and vote on polls with ease. Get instant feedback from your audience.
      </p>
      <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        <Link href="/create-poll" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          Create a Poll
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      
      <div className="flex gap-4 mt-8">
        <Link href="/polls">
          <Button size="lg">View Polls</Button>
        </Link>
        <Link href="/create-poll">
          <Button size="lg" variant="outline">Create Poll</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <div className="border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:scale-105 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </div>
          <h2 className="text-xl font-bold">Create Polls</h2>
          <p className="text-muted-foreground mt-2">Easily create polls with multiple options and customizable settings</p>
        </div>
        <div className="border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:scale-105 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </div>
          <h2 className="text-xl font-bold">Share</h2>
          <p className="text-muted-foreground mt-2">Share polls with friends, colleagues, or the public with a simple link</p>
        </div>
        <div className="border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:scale-105 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
          </div>
          <h2 className="text-xl font-bold">Get Results</h2>
          <p className="text-muted-foreground mt-2">View results in real-time with beautiful charts and detailed analytics</p>
        </div>
      </div>
    </div>
  );
}
