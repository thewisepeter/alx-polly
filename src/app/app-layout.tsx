'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Header } from '../components/Header'
import { AppProvider, useApp } from '../lib/contexts/AppContext'

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
      case 'home':
        router.push('/')
        break
      case 'create':
        router.push('/create')
        break
      case 'mypolls':
        router.push('/my-polls')
        break
      case 'signin':
        router.push('/signin')
        break
      case 'signup':
        router.push('/signup')
        break
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
      
    </>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AppProvider>
  )
}