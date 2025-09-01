'use client'

import { NotFound } from '../components/NotFound'
import { AppLayout } from './app-layout'
import { useRouter } from 'next/navigation'

export default function NotFoundPage() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <AppLayout>
      <NotFound onGoHome={handleGoHome} />
    </AppLayout>
  )
}