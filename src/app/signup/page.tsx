'use client'

import { useRouter } from 'next/navigation'
import { SignUp } from '../../components/SignUp'
import { useApp } from '../../lib/contexts/AppContext'
import { AppLayout } from '../app-layout'

interface User {
  email: string
  name: string
}

export default function SignUpPage() {
  const { signUp } = useApp()
  const router = useRouter()

  const handleSignUp = (userData: User) => {
    signUp(userData)
    router.push('/')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleSwitchToSignIn = () => {
    router.push('/signin')
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <SignUp
          onSignUp={handleSignUp}
          onBack={handleBack}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      </div>
    </AppLayout>
  )
}