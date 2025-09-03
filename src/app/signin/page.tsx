'use client'

import { useRouter } from 'next/navigation'
import { SignIn } from '../../components/SignIn'

interface User {
  email: string
  name: string
}

export default function SignInPage() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleSwitchToSignUp = () => {
    router.push('/signup')
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <SignIn
          onSignIn={handleSignIn}
          onBack={handleBack}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      </div>
  )
}