'use client'

import { HeroSection } from '../components/HeroSection'
import { FeaturedPolls } from '../components/FeaturedPolls'
import { Button } from '../components/ui/button'
import { useApp } from '../lib/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { AppLayout } from './app-layout'

export default function HomePage() {
  const { user, polls } = useApp()
  const router = useRouter()

  const handleViewPoll = (poll: any) => {
    router.push(`/poll/${poll.id}`)
  }

  const handleCreatePoll = () => {
    if (user) {
      router.push('/create')
    } else {
      router.push('/signin')
    }
  }

  const handleViewPolls = () => {
    const pollsSection = document.querySelector('#featured-polls')
    pollsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AppLayout>
      <HeroSection
        onCreatePoll={handleCreatePoll}
        onViewPolls={handleViewPolls}
        isAuthenticated={!!user}
      />
      <div id="featured-polls">
        <FeaturedPolls onViewPoll={handleViewPoll} polls={polls} />
      </div>
      
      {/* Quick access section for authenticated users */}
      {user && (
        <section className="container mx-auto px-4 py-12 bg-white mt-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Your Polling Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Manage your polls, check statistics, and engage with your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/my-polls')} 
                variant="outline" 
                size="lg"
              >
                View My Polls
              </Button>
              <Button onClick={() => router.push('/create')} size="lg">
                Create New Poll
              </Button>
            </div>
          </div>
        </section>
      )}
    </AppLayout>
  )
}