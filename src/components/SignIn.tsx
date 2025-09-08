'use client'

/**
 * @file components/SignIn.tsx
 * @description This file defines the SignIn component, a reusable UI component for user authentication (sign-in).
 * It handles form input, client-side validation, and interaction with the authentication context.
 */

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/contexts/AuthContext";

/**
 * @interface SignInProps
 * @description Props for the SignIn component.
 * @property {function} onSignIn - Callback function to be called upon successful sign-in, typically to handle navigation or state updates.
 * @property {function} onBack - Callback function for navigating back, usually to the previous page or home.
 * @property {function} onSwitchToSignUp - Callback function to navigate to the sign-up page.
 */
interface SignInProps {
  onSignIn: (user: { email: string; name: string }) => void;
  onBack: () => void;
  onSwitchToSignUp: () => void;
}

/**
 * @function SignIn
 * @description React functional component for user sign-in.
 * Provides an email and password input form, handles validation, and interacts with the authentication service.
 * @param {SignInProps} props - The properties passed to the component.
 * @returns {JSX.Element} The sign-in form UI.
 */
export function SignIn({ onSignIn, onBack, onSwitchToSignUp }: SignInProps) {
  // State for email input.
  const [email, setEmail] = useState("");
  // State for password input.
  const [password, setPassword] = useState("");
  // State to toggle password visibility.
  const [showPassword, setShowPassword] = useState(false);
  // State to store validation errors.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // State to manage loading status during sign-in.
  const [isLoading, setIsLoading] = useState(false);
  // Access the authentication context for sign-in functionality.
  const { signIn } = useAuth();

  /**
   * @function validateForm
   * @description Validates the email and password fields.
   * Sets error messages in the `errors` state if validation fails.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation logic.
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation logic.
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * @function handleSubmit
   * @description Handles the form submission for sign-in.
   * Performs validation, calls the `signIn` function from `AuthContext`, and handles success or error states.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields before proceeding.
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors.
    
    try {
      // Attempt to sign in using the AuthContext's signIn function.
      const { error, data } = await signIn(email.trim(), password);
      
      if (error) {
        // If there's an authentication error, set it to the form errors.
        setErrors({ form: error.message });
      } else if (data?.user) {
        // If sign-in is successful and user data is available.
        // Supabase session is managed by AuthContext, AppContext will update.
        console.log('Sign-in successful, session:', data.session);
        // Call the onSignIn callback with user details.
        onSignIn({
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || ''
        });
      }
    } catch (err: any) {
      // Catch any unexpected errors during the sign-in process.
      setErrors({ form: err.message || 'An error occurred during sign in' });
    } finally {
      // Always set loading to false after the sign-in attempt.
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Back button for navigation. */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">
            Welcome back! Please sign in to your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input Field */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input Field */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                {/* Button to toggle password visibility. */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {/* Display form-level errors. */}
            {errors.form && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {errors.form}
              </div>
            )}

          {/* Submit button for the sign-in form. */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Link to switch to the sign-up page. */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}