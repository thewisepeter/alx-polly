'use client'

import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Share2, 
  Eye, 
  Edit,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Poll } from "../lib/mockData";
import { PollShare } from "./PollShare";

interface MyPollsProps {
  polls: Poll[];
  userEmail: string;
  onViewPoll: (poll: Poll) => void;
  onCreatePoll: () => void;
  onBack: () => void;
  onEditPoll?: (poll: Poll) => void;
  onDeletePoll?: (pollId: string) => void;
  onTogglePollStatus?: (pollId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'mostVotes' | 'leastVotes';
type FilterOption = 'all' | 'active' | 'inactive';

export function MyPolls({ 
  polls, 
  userEmail, 
  onViewPoll, 
  onCreatePoll, 
  onBack,
  onEditPoll,
  onDeletePoll,
  onTogglePollStatus
}: MyPollsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedPollForShare, setSelectedPollForShare] = useState<Poll | null>(null);

  // Filter user's polls
  const userPolls = polls.filter(poll => poll.createdBy === userEmail);

  // Apply search, filter, and sort
  const filteredAndSortedPolls = useMemo(() => {
    let filtered = userPolls;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(poll =>
        poll.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(poll => 
        filterBy === 'active' ? poll.isActive : !poll.isActive
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostVotes':
          return b.totalVotes - a.totalVotes;
        case 'leastVotes':
          return a.totalVotes - b.totalVotes;
        default:
          return 0;
      }
    });

    return filtered;
  }, [userPolls, searchQuery, filterBy, sortBy]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPollStats = () => {
    const totalPolls = userPolls.length;
    const activePolls = userPolls.filter(p => p.isActive).length;
    const totalVotes = userPolls.reduce((sum, poll) => sum + poll.totalVotes, 0);
    const avgVotesPerPoll = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

    return { totalPolls, activePolls, totalVotes, avgVotesPerPoll };
  };

  const stats = getPollStats();

  const PollCardActions = ({ poll }: { poll: Poll }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewPoll(poll)}>
          <Eye className="h-4 w-4 mr-2" />
          View Poll
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedPollForShare(poll)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        {onEditPoll && (
          <DropdownMenuItem onClick={() => onEditPoll(poll)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {onTogglePollStatus && (
          <DropdownMenuItem onClick={() => onTogglePollStatus(poll.id)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {poll.isActive ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onDeletePoll && (
          <DropdownMenuItem 
            onClick={() => onDeletePoll(poll.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (userPolls.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No polls yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first poll to start gathering opinions and feedback.
              </p>
              <Button onClick={onCreatePoll}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Poll
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">My Polls</h1>
            <p className="text-muted-foreground">
              Manage and track your created polls
            </p>
          </div>
        </div>
        <Button onClick={onCreatePoll}>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Polls</p>
                <p className="text-xl font-semibold">{stats.totalPolls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-semibold">{stats.activePolls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-xl font-semibold">{stats.totalVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Votes</p>
                <p className="text-xl font-semibold">{stats.avgVotesPerPoll}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Polls</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="mostVotes">Most Votes</SelectItem>
                <SelectItem value="leastVotes">Least Votes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Polls List */}
      <div className="space-y-4">
        {filteredAndSortedPolls.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No polls match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedPolls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{poll.question}</h3>
                      <Badge variant={poll.isActive ? "default" : "secondary"}>
                        {poll.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {poll.totalVotes} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(poll.createdAt)}
                      </span>
                      <span>{poll.options.length} options</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Most popular: <span className="text-foreground">
                        {poll.options.reduce((prev, current) => 
                          prev.votes > current.votes ? prev : current, poll.options[0]
                        ).text}
                      </span> ({poll.options.reduce((prev, current) => 
                        prev.votes > current.votes ? prev : current, poll.options[0]
                      ).votes} votes)
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewPoll(poll)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <PollCardActions poll={poll} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Share Modal */}
      {selectedPollForShare && (
        <PollShare 
          poll={selectedPollForShare} 
          onClose={() => setSelectedPollForShare(null)} 
        />
      )}
    </div>
  );
}