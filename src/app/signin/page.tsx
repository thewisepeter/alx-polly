'use client'

import { useRouter } from 'next/navigation'
import { SignIn } from '../../components/SignIn'
import { useApp } from '../../lib/contexts/AppContext'
import { AppLayout } from '../app-layout'

interface User {
  email: string
  name: string
}

export default function SignInPage() {
  const { signIn } = useApp()
  const router = useRouter()

  const handleSignIn = (userData: User) => {
    signIn(userData)
    router.push('/')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleSwitchToSignUp = () => {
    router.push('/signup')
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <SignIn
          onSignIn={handleSignIn}
          onBack={handleBack}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      </div>
    </AppLayout>
  )
}