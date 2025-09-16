'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MyPolls } from '../../components/MyPolls'
import { useApp } from '../../lib/contexts/AppContext'
import { Poll } from '../../lib/mockData'

export default function MyPollsPage() {
  const { user, polls, updatePoll } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  const handleViewPoll = (poll: Poll) => {
    router.push(`/poll/${poll.id}`)
  }

  const handleCreatePoll = () => {
    router.push('/create')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleTogglePollStatus = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId)
    if (poll) {
      updatePoll(pollId, { isActive: !poll.isActive })
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MyPolls
        polls={polls}
        userEmail={user.email}
        onViewPoll={handleViewPoll}
        onCreatePoll={handleCreatePoll}
        onBack={handleBack}
        onTogglePollStatus={handleTogglePollStatus}
      />
    </div>
  )
}