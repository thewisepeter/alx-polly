'use client'

/**
 * @file app/signup/page.tsx
 * @description This file defines the SignUpPage component, which serves as the entry point for user sign-up.
 * It orchestrates the sign-up flow by rendering the SignUp component and handling navigation based on authentication events.
 */

import { useRouter } from 'next/navigation'
import { SignUp } from '../../components/SignUp'
import { useApp } from '../../lib/contexts/AppContext'
import { AppLayout } from '../app-layout'

/**
 * @interface User
 * @description Defines the structure for user data, typically used when signing up a new user.
 * @property {string} email - The user's email address.
 * @property {string} name - The user's name.
 */
interface User {
  email: string
  name: string
}

/**
 * @function SignUpPage
 * @description React component for the sign-up page.
 * It manages navigation after sign-up, back actions, and switching to the sign-in page.
 * @returns {JSX.Element} The sign-up page UI.
 */
export default function SignUpPage() {
  // Destructure the signUp function from the AppContext for handling user registration.
  const { signUp } = useApp()
  // Initialize the Next.js router for programmatic navigation.
  const router = useRouter()

  /**
   * @function handleSignUp
   * @description Callback function executed upon successful sign-up.
   * Calls the signUp function from AppContext and then redirects the user to the home page.
   * @param {User} userData - The user data (email and name) to be used for sign-up.
   */
  const handleSignUp = (userData: User) => {
    signUp(userData)
    router.push('/')
  }

  /**
   * @function handleBack
   * @description Callback function for navigating back.
   * Redirects the user to the home page.
   */
  const handleBack = () => {
    router.push('/')
  }

  /**
   * @function handleSwitchToSignIn
   * @description Callback function for switching to the sign-in page.
   * Redirects the user to the sign-in route.
   */
  const handleSwitchToSignIn = () => {
    router.push('/signin')
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Render the SignUp component, passing the necessary handlers for authentication flow. */}
        <SignUp
          onSignUp={handleSignUp}
          onBack={handleBack}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      </div>
    </AppLayout>
  )
}