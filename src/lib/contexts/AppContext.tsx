'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Poll, mockPolls } from '../mockData'
import { useAuth } from './AuthContext'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  email: string
  name: string
}

interface AppContextType {
  polls: Poll[]
  setPolls: (polls: Poll[]) => void
  user: User | null
  setUser: (user: User | null) => void
  userVotes: { [pollId: string]: string }
  setUserVotes: (votes: { [pollId: string]: string }) => void
  addPoll: (poll: Poll) => void
  updatePoll: (pollId: string, updates: Partial<Poll>) => void
  deletePoll: (pollId: string) => void
  vote: (pollId: string, optionId: string) => void
  signOut: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: supabaseUser, signOut: authSignOut } = useAuth()
  const [polls, setPolls] = useState<Poll[]>(mockPolls)
  const [user, setUser] = useState<User | null>(null)
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: string }>({})

  // Update user when Supabase auth changes
  useEffect(() => {
    if (supabaseUser) {
      setUser({
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || ''
      })
    } else {
      setUser(null)
    }
  }, [supabaseUser])

  // Initialize from localStorage on client
  useEffect(() => {
    const savedUser = localStorage.getItem('polling-user')
    const savedVotes = localStorage.getItem('polling-votes')
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse saved user:', e)
      }
    }
    
    if (savedVotes) {
      try {
        setUserVotes(JSON.parse(savedVotes))
      } catch (e) {
        console.error('Failed to parse saved votes:', e)
      }
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('polling-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('polling-user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('polling-votes', JSON.stringify(userVotes))
  }, [userVotes])

  const addPoll = (poll: Poll) => {
    const pollWithUser = {
      ...poll,
      createdBy: user?.email || 'anonymous@example.com',
      isActive: true
    }
    setPolls(prev => [pollWithUser, ...prev])
  }

  const updatePoll = (pollId: string, updates: Partial<Poll>) => {
    setPolls(prev => 
      prev.map(poll => 
        poll.id === pollId ? { ...poll, ...updates } : poll
      )
    )
  }

  const deletePoll = (pollId: string) => {
    setPolls(prev => prev.filter(poll => poll.id !== pollId))
    setUserVotes(prev => {
      const newVotes = { ...prev }
      delete newVotes[pollId]
      return newVotes
    })
  }

  const vote = (pollId: string, optionId: string) => {
    // Update user votes tracking
    setUserVotes(prev => ({ ...prev, [pollId]: optionId }))
    
    // Update poll data
    setPolls(prev => 
      prev.map(poll => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map(option => {
            if (option.id === optionId) {
              return { ...option, votes: option.votes + 1 }
            }
            return option
          })
          return {
            ...poll,
            options: updatedOptions,
            totalVotes: poll.totalVotes + 1
          }
        }
        return poll
      })
    )
  }

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null) // Explicitly set user to null
      localStorage.removeItem('polling-user') // Clear user from localStorage
      setUserVotes({})
      localStorage.removeItem('polling-votes') // Clear votes from localStorage
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    polls,
    setPolls,
    user,
    setUser,
    userVotes,
    setUserVotes,
    addPoll,
    updatePoll,
    deletePoll,
    vote,
    signOut
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}