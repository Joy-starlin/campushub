'use client'

import EventDetailPage from '../../../components/EventDetailPage'

// Mock event data - in a real app, this would come from an API
const mockEvent = {
  id: '1',
  title: 'Spring Festival 2026',
  description: 'Join us for the biggest celebration of the year with live music, food, and fun activities!',
  fullDescription: `Get ready for the most exciting event of the year! The Spring Festival 2026 promises to be an unforgettable celebration of our campus community.

What to expect:
🎵 Live music performances from student bands and special guests
🍔 Food trucks featuring diverse cuisines from around the world
🎮 Interactive games and activities for all ages
🎨 Art exhibitions showcasing student talent
🏆 Awards ceremony for outstanding student achievements
📸 Photo booths and memorable moments

Schedule:
5:00 PM - Gates open
6:00 PM - Welcome ceremony
6:30 PM - Live music begins
7:30 PM - Dinner and networking
8:30 PM - Awards ceremony
9:30 PM - Closing performance

This is a family-friendly event open to all students, faculty, staff, and their families. Don't miss this opportunity to connect with your campus community and create lasting memories!

Tickets are limited, so make sure to RSVP early. See you there!`,
  date: new Date('2026-03-15'),
  time: '18:00',
  location: 'Main Campus Quad',
  isOnline: false,
  category: 'Social' as const,
  bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop',
  maxAttendees: 500,
  currentAttendees: 342,
  attendees: [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Mike Chen' },
    { id: '3', name: 'Emily Davis' },
    { id: '4', name: 'Alex Kim' },
    { id: '5', name: 'Jordan Lee' },
    { id: '6', name: 'Chris Taylor' },
    { id: '7', name: 'Pat Morgan' },
    { id: '8', name: 'Taylor Swift' },
    { id: '9', name: 'Sam Wilson' },
    { id: '10', name: 'Maria Garcia' }
  ],
  organizer: {
    name: 'Student Council',
    role: 'Campus Organization'
  },
  timezone: 'America/New_York'
}

export default function EventDetail() {
  const handleRSVP = (eventId: string) => {
    console.log('RSVP to event:', eventId)
  }

  const handleShare = (eventId: string) => {
    console.log('Share event:', eventId)
  }

  return (
    <EventDetailPage
      event={mockEvent}
      onRSVP={handleRSVP}
      onShare={handleShare}
    />
  )
}
