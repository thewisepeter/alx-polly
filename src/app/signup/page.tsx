import { useRouter } from 'next/navigation'
import { SignUp } from '../../components/SignUp'

interface User {
  email: string
  name: string
}

export default function SignUpPage() {
  const router = useRouter()

  const handleSignUp = (userData: User) => {
    router.push('/')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleSwitchToSignIn = () => {
    router.push('/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SignUp
        onSignUp={handleSignUp}
        onBack={handleBack}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </div>
  )
}