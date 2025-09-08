'use client'

/**
 * @file app/signin/page.tsx
 * @description This file defines the SignInPage component, which serves as the entry point for user sign-in.
 * It orchestrates the sign-in flow by rendering the SignIn component and handling navigation based on authentication events.
 */

import { useRouter } from 'next/navigation'
import { SignIn } from '../../components/SignIn'

/**
 * @interface User
 * @description Defines the structure for user data, typically received after successful authentication.
 * @property {string} email - The user's email address.
 * @property {string} name - The user's name.
 */
interface User {
  email: string
  name: string
}

/**
 * @function SignInPage
 * @description React component for the sign-in page.
 * It manages navigation after sign-in, back actions, and switching to the sign-up page.
 * @returns {JSX.Element} The sign-in page UI.
 */
export default function SignInPage() {
  // Initialize the Next.js router for programmatic navigation.
  const router = useRouter()

  /**
   * @function handleSignIn
   * @description Callback function executed upon successful sign-in.
   * Redirects the user to the home page.
   */
  const handleSignIn = () => {
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
   * @function handleSwitchToSignUp
   * @description Callback function for switching to the sign-up page.
   * Redirects the user to the sign-up route.
   */
  const handleSwitchToSignUp = () => {
    router.push('/signup')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Render the SignIn component, passing the necessary handlers for authentication flow. */}
      <SignIn
        onSignIn={handleSignIn}
        onBack={handleBack}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
    </div>
  )
}