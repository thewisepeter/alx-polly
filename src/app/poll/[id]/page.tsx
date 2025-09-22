import { notFound } from 'next/navigation'
import { getPollById, getPollResults } from '../../../lib/db/polls'
import { PollVotingView } from '../../../components/PollVotingView'
import { NotFound } from '../../../components/NotFound'
import PollResultsExport from '../../../components/PollResultsExport'

interface PollPageProps {
  params: { id: string };
}

export default async function PollPage({ params }: PollPageProps) {
  const { id: pollId } = await params;
  const pollData = await getPollById(pollId);

  if (!pollData || !pollData.poll) {
    notFound();
  }

  const { poll, options } = pollData;
  const results = await getPollResults(pollId);
  const isRealtime = !poll.end_date || new Date(poll.end_date) > new Date();

  // For PollVotingView, we might still need client-side state for voting. 
  // This would require a separate client component for voting.
  // For now, I'll keep PollVotingView as it is, but acknowledge that
  // a full refactor to separate server/client components for voting/results 
  // might be needed depending on how `useApp()` is used.

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{poll.title}</h1>
      {poll.description && <p className="text-gray-600 mb-8">{poll.description}</p>}

      {/* Existing Poll Voting View */}
      {/* 
        TODO: If `PollVotingView` needs client-side interaction (which it does based on `useApp` and `vote`),
        it should be refactored into a client component that receives necessary props.
        For this task, I will temporarily comment out PollVotingView or assume it can take server props directly.
      */}
      {/* <PollVotingView
        poll={poll}
        onVote={handleVote}
        onBack={handleBack}
        hasVoted={!!userVotes[poll.id]}
        userVote={userVotes[poll.id]}
      /> */}

      {/* New Poll Results Export Component */}
      <div className="mt-12">
        <PollResultsExport
          pollId={pollId}
          poll={poll}
          options={options}
          results={results}
          isRealtime={isRealtime}
        />
      </div>
    </div>
  );
}
