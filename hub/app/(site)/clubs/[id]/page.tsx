'use client'

import ClubDetailPage from '../../../components/ClubDetailPage'

// Mock club data - in a real app, this would come from an API
const mockClub = {
  id: '1',
  name: 'Computer Science Club',
  category: 'Technology' as const,
  description: 'Explore the latest in tech, coding workshops, hackathons, and networking with industry professionals.',
  fullDescription: `Welcome to the Computer Science Club! We are a vibrant community of tech enthusiasts, developers, and innovators passionate about exploring the cutting edge of technology.

What we offer:
🚀 Weekly coding workshops and tutorials
💻 Hackathons and coding competitions
� Guest lectures from industry professionals
🤝 Networking opportunities with tech companies
📚 Study groups for challenging CS courses
🛠️ Hands-on project development
🌱 Mentorship programs for junior members

Our mission is to foster a collaborative environment where students can enhance their technical skills, build impressive portfolios, and prepare for successful careers in technology. Whether you're a beginner just starting your coding journey or an experienced developer looking to tackle advanced challenges, there's a place for you in our club.

Join us to be part of the next generation of tech innovators!`,
  rules: `1. Respect all members and their ideas
2. Actively participate in club activities
3. Help fellow members learn and grow
4. Follow academic integrity in all projects
5. Maintain professional conduct in all club communications
6. Contribute positively to the club's reputation`,
  memberCount: 145,
  eventCount: 12,
  postCount: 48,
  coverImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1200&h=400&fit=crop',
  logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
  isPrivate: false,
  isMember: true,
  leadership: {
    president: { 
      name: 'Sarah Johnson', 
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      role: 'President' 
    },
    vicePresident: { 
      name: 'Mike Chen', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'Vice President' 
    },
    secretary: { 
      name: 'Emily Davis', 
      role: 'Secretary' 
    }
  },
  upcomingEvents: [
    {
      id: '1',
      title: 'Web Development Workshop',
      date: 'March 20, 2026',
      time: '6:00 PM'
    },
    {
      id: '2',
      title: 'Hackathon 2026',
      date: 'April 5-7, 2026',
      time: 'All Day'
    },
    {
      id: '3',
      title: 'Tech Talk: AI in Industry',
      date: 'March 25, 2026',
      time: '7:00 PM'
    }
  ],
  posts: [
    {
      id: '1',
      author: 'Sarah Johnson',
      content: 'Excited to announce our annual hackathon is coming up next month! Start forming your teams and get ready to build something amazing. 🚀',
      createdAt: '2 hours ago',
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      author: 'Mike Chen',
      content: 'Great turnout at yesterday\'s React workshop! Thanks to everyone who participated. Next week we\'ll dive into advanced state management.',
      createdAt: '1 day ago',
      likes: 18,
      comments: 5
    },
    {
      id: '3',
      author: 'Emily Davis',
      content: 'Don\'t forget to sign up for our mentorship program! Senior students are available to help with courses and career advice.',
      createdAt: '3 days ago',
      likes: 32,
      comments: 12
    }
  ]
}

export default function ClubDetail() {
  const handleJoin = (clubId: string) => {
    console.log('Join club:', clubId)
  }

  const handleLeave = (clubId: string) => {
    console.log('Leave club:', clubId)
  }

  return (
    <ClubDetailPage
      club={mockClub}
      onJoin={handleJoin}
      onLeave={handleLeave}
    />
  )
}
