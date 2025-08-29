import Link from "next/link";
import { Button } from "./button";
import { NavigationMenuDemo } from "./navigation-menu-demo";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">ALX Polly</span>
          </Link>
          <div className="hidden md:flex">
            <NavigationMenuDemo />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/create-poll">
              <Button>Create Poll</Button>
            </Link>
          </div>
          <Link href="/auth/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}