'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreatePollForm } from '../../components/CreatePollForm'
import { useApp } from '../../lib/contexts/AppContext'
import { AppLayout } from '../app-layout'
import { Poll } from '../../lib/mockData'

export default function CreatePage() {
  const { user, addPoll } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  const handleCreatePoll = (poll: Poll) => {
    addPoll(poll)
    router.push('/')
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <CreatePollForm
          onCreatePoll={handleCreatePoll}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  )
}