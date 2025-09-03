// app/layout.tsx
'use client'

import '../styles/globals.css'
import { AppProvider, useApp } from '../lib/contexts/AppContext'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Toaster } from '../components/ui/toaster'
import { Header } from '../components/Header' // Import Header

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useApp()

  // Determine current view from pathname
  const getCurrentView = () => {
    if (pathname === '/') return 'home'
    if (pathname === '/create') return 'create'
    if (pathname === '/my-polls') return 'mypolls'
    if (pathname === '/signin') return 'signin'
    if (pathname === '/signup') return 'signup'
    if (pathname.startsWith('/poll/')) return 'vote'
    return 'notfound'
  }

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'home': router.push('/'); break
      case 'create': router.push('/create'); break
      case 'mypolls': router.push('/my-polls'); break
      case 'signin': router.push('/signin'); break
      case 'signup': router.push('/signup'); break
    }
  }

  return (
    <>
      <Header
        currentView={getCurrentView() as any}
        onNavigate={handleNavigate as any}
        user={user}
        onSignOut={signOut}
      />
      <main>{children}</main>

      {pathname === '/' && (
        <footer className="bg-white border-t py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2025 Polling App. Ready for your next poll!</p>
          </div>
        </footer>
      )}
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
