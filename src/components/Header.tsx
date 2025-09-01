'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { User, LogOut, Settings, FileText, Plus } from "lucide-react";

interface User {
  email: string;
  name: string;
}

interface HeaderProps {
  currentView: 'home' | 'create' | 'vote' | 'signin' | 'signup' | 'notfound' | 'mypolls';
  onNavigate: (view: 'home' | 'create' | 'vote' | 'signin' | 'signup' | 'mypolls') => void;
  user: User | null;
  onSignOut: () => void;
}

export function Header({ currentView, onNavigate, user, onSignOut }: HeaderProps) {
  const router = useRouter()
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-medium">ALX Polly</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/"
              className={`transition-colors ${
                currentView === 'home' 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  href="/my-polls"
                  className={`transition-colors ${
                    currentView === 'mypolls' 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Polls
                </Link>
                <Link 
                  href="/create"
                  className={`transition-colors ${
                    currentView === 'create' 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create Poll
                </Link>
              </>
            ) : (
              <button 
                onClick={() => {
                  const pollsSection = document.querySelector('#featured-polls');
                  pollsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                View Polls
              </button>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => router.push('/my-polls')}
                  >
                    <FileText className="h-4 w-4" />
                    My Polls
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => router.push('/create')}
                  >
                    <Plus className="h-4 w-4" />
                    Create Poll
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive"
                    onClick={() => {
                      onSignOut()
                      router.push('/')
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}