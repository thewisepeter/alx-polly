'use client'

/**
 * @file components/SignUp.tsx
 * @description This file defines the SignUp component, a reusable UI component for user registration (sign-up).
 * It handles form input, client-side validation, password strength, and interaction with the authentication context.
 */

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "../lib/contexts/AuthContext";

/**
 * @interface SignUpProps
 * @description Props for the SignUp component.
 * @property {function} onSignUp - Callback function to be called upon successful sign-up, typically to handle navigation or state updates.
 * @property {function} onBack - Callback function for navigating back, usually to the previous page or home.
 * @property {function} onSwitchToSignIn - Callback function to navigate to the sign-in page.
 */
interface SignUpProps {
  onSignUp: (user: { email: string; name: string }) => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
}

/**
 * @function SignUp
 * @description React functional component for user sign-up.
 * Provides a form for name, email, password, and confirm password, handles validation, password strength, and interacts with the authentication service.
 * @param {SignUpProps} props - The properties passed to the component.
 * @returns {JSX.Element} The sign-up form UI.
 */
export function SignUp({ onSignUp, onBack, onSwitchToSignIn }: SignUpProps) {
  // State for form data including name, email, password, and confirm password.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  // State to toggle password visibility for the password field.
  const [showPassword, setShowPassword] = useState(false);
  // State to toggle password visibility for the confirm password field.
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // State to store validation errors.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // State to manage loading status during sign-up.
  const [isLoading, setIsLoading] = useState(false);
  // Access the authentication context for sign-up functionality.
  const { signUp } = useAuth();

  /**
   * @function updateField
   * @description Generic handler to update form data fields.
   * @param {string} field - The name of the form field to update.
   * @param {string} value - The new value for the field.
   */
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * @function validateForm
   * @description Validates all form fields (name, email, password, confirm password).
   * Sets error messages in the `errors` state if validation fails.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation logic.
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation logic.
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation logic.
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation logic.
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * @function handleSubmit
   * @description Handles the form submission for sign-up.
   * Performs validation, calls the `signUp` function from `AuthContext`, and handles success or error states.
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
      // Attempt to sign up using the AuthContext's signUp function.
      const { error, data } = await signUp(
        formData.email.trim(), 
        formData.password,
        formData.name.trim()
      );
      
      if (error) {
        // If there's an authentication error, set it to the form errors.
        setErrors({ form: error.message });
      } else if (data?.user) {
        // If sign-up is successful and user data is available.
        // Supabase session is managed by AuthContext, AppContext will update.
        onSignUp({
          email: formData.email.trim(),
          name: formData.name.trim()
        });
      } else {
        // If no user data but no error, it might mean email confirmation is required.
        setErrors({ form: 'Please check your email to confirm your account' });
      }
    } catch (err: any) {
      // Catch any unexpected errors during the sign-up process.
      setErrors({ form: err.message || 'An error occurred during sign up' });
    } finally {
      // Always set loading to false after the sign-up attempt.
      setIsLoading(false);
    }
  };

  /**
   * @function getPasswordStrength
   * @description Calculates the strength of the entered password.
   * @returns {{ strength: number, label: string, color: string }} An object containing the strength score, a descriptive label, and a color for visual feedback.
   */
  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    
    let score = 0;
    // Criteria for password strength.
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++; // Special character.
    
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    
    return {
      strength: score,
      label: strengthLabels[score - 1] || "",
      color: strengthColors[score - 1] || "bg-gray-300"
    };
  };

  // Calculate password strength dynamically.
  const passwordStrength = getPasswordStrength();

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
          <CardTitle>Create Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Join us to create and share polls with your community.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input Field */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Input Field */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                {/* Button to toggle password visibility for the password field. */}
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.strength 
                            ? passwordStrength.color 
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-1 mt-1">
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Passwords match</span>
                </div>
              )}
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Form Error */}
            {errors.form && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {errors.form}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            {/* Switch to Sign In */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}