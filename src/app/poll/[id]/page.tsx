'use client'

import { useRouter, useParams } from 'next/navigation'
import { PollVotingView } from '../../../components/PollVotingView'
import { NotFound } from '../../../components/NotFound'
import { useApp } from '../../../lib/contexts/AppContext'
import { AppLayout } from '../../app-layout'

export default function PollPage() {
  const { polls, vote, userVotes } = useApp()
  const router = useRouter()
  const params = useParams()  // <-- use hook to get route params

  const poll = polls.find(p => p.id === params?.id)

  const handleVote = (pollId: string, optionId: string) => {
    vote(pollId, optionId)
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (!poll) {
    return (
      <AppLayout>
        <NotFound onGoHome={handleGoHome} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <PollVotingView
          poll={poll}
          onVote={handleVote}
          onBack={handleBack}
          hasVoted={!!userVotes[poll.id]}
          userVote={userVotes[poll.id]}
        />
      </div>
    </AppLayout>
  )
}
