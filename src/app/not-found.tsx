'use client'

import { NotFound } from '../components/NotFound'
import { useRouter } from 'next/navigation'

export default function NotFoundPage() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] text-center">
      <NotFound onGoHome={handleGoHome} />
    </div>
  )
}