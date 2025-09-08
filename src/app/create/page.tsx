'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreatePollForm } from '../../components/CreatePollForm'
import { useApp } from '../../lib/contexts/AppContext'
import { Poll } from '../../lib/mockData'

export default function CreatePage() {
  const { user } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  // handleCreatePoll is no longer needed here as form submission is handled by CreatePollForm directly
  // const handleCreatePoll = () => {
  //   router.push('/')
  // }

  const handleCancel = () => {
    router.push('/')
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <CreatePollForm
          onCancel={handleCancel}
        />
      </div>
  )
}