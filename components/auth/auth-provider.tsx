'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // These functions would connect to your actual authentication service
  const signIn = async (email: string, password: string) => {
    // This is a placeholder. In a real app, you would call your auth API
    console.log('Sign in with', email, password);
    // Simulate successful login
    setUser({
      id: '1',
      name: 'Demo User',
      email: email,
    });
  };

  const signUp = async (name: string, email: string, password: string) => {
    // This is a placeholder. In a real app, you would call your auth API
    console.log('Sign up with', name, email, password);
    // Simulate successful registration
    setUser({
      id: '1',
      name: name,
      email: email,
    });
  };

  const signOut = () => {
    // This is a placeholder. In a real app, you would call your auth API
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}