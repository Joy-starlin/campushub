import PersonalDashboard from '../../components/PersonalDashboard'

// Mock dashboard data - in a real app, this would come from an API
const mockDashboardData = {
  user: {
    name: 'Sarah Johnson',
    username: 'sarahjohnson',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
  },
  stats: {
    postsThisMonth: 8,
    eventsRsvpd: 5,
    clubMemberships: 3,
    unreadMessages: 2
  },
  upcomingEvents: [
    {
      id: '1',
      title: 'React Workshop',
      date: 'March 25, 2026',
      time: '3:00 PM',
      club: 'Computer Science Club'
    },
    {
      id: '2',
      title: 'Spring Festival',
      date: 'March 30, 2026',
      time: '6:00 PM',
      club: 'Student Council'
    },
    {
      id: '3',
      title: 'Hackathon 2026',
      date: 'April 5, 2026',
      time: '9:00 AM',
      club: 'Computer Science Club'
    }
  ],
  clubs: [
    {
      id: '1',
      name: 'Computer Science Club',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      memberCount: 145,
      latestActivity: 'New event posted: React Workshop'
    },
    {
      id: '2',
      name: 'Photography Club',
      memberCount: 38,
      latestActivity: 'Photo walk this Saturday'
    },
    {
      id: '3',
      name: 'Student Council',
      memberCount: 89,
      latestActivity: 'Spring Festival planning meeting'
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'post' as const,
      message: 'Posted about the upcoming React workshop',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'event_rsvp' as const,
      message: 'RSVP\'d to Spring Festival',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      type: 'club_join' as const,
      message: 'Joined Photography Club',
      timestamp: '2 days ago'
    },
    {
      id: '4',
      type: 'marketplace_post' as const,
      message: 'Listed textbook for sale',
      timestamp: '3 days ago'
    }
  ]
}

export default function Dashboard() {
  const handleNewPost = () => {
    console.log('New post')
  }

  const handleBrowseEvents = () => {
    console.log('Browse events')
  }

  const handleFindClub = () => {
    console.log('Find club')
  }

  const handlePostListing = () => {
    console.log('Post listing')
  }

  return (
    <PersonalDashboard
      data={mockDashboardData}
      onNewPost={handleNewPost}
      onBrowseEvents={handleBrowseEvents}
      onFindClub={handleFindClub}
      onPostListing={handlePostListing}
    />
  )
}



