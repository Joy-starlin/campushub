'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3, Calendar, Plus } from 'lucide-react'
import EventCard from './EventCard'
import CalendarView from './CalendarView'
import EventFilters from './EventFilters'
import AddEventModal from './AddEventModal'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  time: string
  location: string
  isOnline: boolean
  category: 'Academic' | 'Social' | 'Sports' | 'Cultural' | 'Career'
  bannerImage?: string
  maxAttendees?: number
  currentAttendees: number
  attendees: Array<{
    id: string
    name: string
    avatar?: string
  }>
  organizer: {
    name: string
    role: string
  }
}

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Bugema University Open Day',
    description: 'Explore our campus, meet faculty, and discover your future career path at Bugema University.',
    date: new Date('2026-05-15'),
    time: '09:00',
    location: 'Main Campus Quad',
    isOnline: false,
    category: 'Academic',
    bannerImage: '/assets/events/event-main.png',
    maxAttendees: 500,
    currentAttendees: 342,
    attendees: [
      { id: '1', name: 'Sarah Johnson' },
      { id: '2', name: 'Mike Chen' },
      { id: '3', name: 'Emily Davis' }
    ],
    organizer: {
      name: 'Admissions Office',
      role: 'Campus Organization'
    }
  },
  {
    id: '2',
    title: 'Cultural Night: Pearl of Africa',
    description: 'Experience the rich heritage of Uganda through traditional music, dance, and authentic cuisine.',
    date: new Date('2026-05-20'),
    time: '18:00',
    location: 'Auditorium',
    isOnline: false,
    category: 'Cultural',
    bannerImage: '/assets/events/event-1.png',
    maxAttendees: 300,
    currentAttendees: 189,
    attendees: [
      { id: '4', name: 'Alex Kim' },
      { id: '5', name: 'Jordan Lee' }
    ],
    organizer: {
      name: 'Cultural Society',
      role: 'Academic Club'
    }
  },
  {
    id: '3',
    title: 'Grand Alumni Reunion 2026',
    description: 'Welcoming back all Bugema graduates for a weekend of networking and celebration.',
    date: new Date('2026-06-12'),
    time: '10:00',
    location: 'Main Hall',
    isOnline: false,
    category: 'Social',
    bannerImage: '/assets/events/event-2.png',
    maxAttendees: 1000,
    currentAttendees: 756,
    attendees: [
      { id: '6', name: 'Chris Taylor' },
      { id: '7', name: 'Pat Morgan' }
    ],
    organizer: {
      name: 'Alumni Association',
      role: 'Sports Organization'
    }
  },
  {
    id: '4',
    title: 'Tech & Career Expo',
    description: 'Connect with top industry leaders and discover the latest trends in technology and innovation.',
    date: new Date('2026-05-25'),
    time: '10:00',
    location: 'Convention Center',
    isOnline: false,
    category: 'Career',
    bannerImage: '/assets/events/event-3.png',
    maxAttendees: 800,
    currentAttendees: 423,
    attendees: [
      { id: '8', name: 'Taylor Swift' },
      { id: '9', name: 'Sam Wilson' }
    ],
    organizer: {
      name: 'Career Services',
      role: 'Campus Department'
    }
  },
  {
    id: '5',
    title: 'Inter-University Sports Gala',
    description: 'Cheer for your team at the annual athletics competition featuring students from across the region.',
    date: new Date('2026-05-28'),
    time: '14:30',
    location: 'Sports Complex',
    isOnline: false,
    category: 'Sports',
    bannerImage: '/assets/events/event-4.png',
    maxAttendees: 2000,
    currentAttendees: 1250,
    attendees: [
      { id: '10', name: 'Maria Garcia' },
      { id: '11', name: 'Li Wei' }
    ],
    organizer: {
      name: 'Sports Department',
      role: 'Cultural Club'
    }
  }
]

type ViewMode = 'grid' | 'calendar'

export default function EventsPage({ defaultIsOnline = null }: { defaultIsOnline?: boolean | null } = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isOnline, setIsOnline] = useState<boolean | null>(defaultIsOnline)

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategory && event.category !== selectedCategory) {
        return false
      }

      // Date range filter
      if (startDate && new Date(event.date) < new Date(startDate)) {
        return false
      }
      if (endDate && new Date(event.date) > new Date(endDate)) {
        return false
      }

      // Online/In-person filter
      if (isOnline !== null && event.isOnline !== isOnline) {
        return false
      }

      return true
    })
  }, [events, searchQuery, selectedCategory, startDate, endDate, isOnline])

  const handleEventClick = (event: Event) => {
    // Navigate to event detail page
    console.log('Navigate to event:', event.id)
  }

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date)
  }

  const handleCalendarEventClick = (event: any) => {
    console.log('Calendar event clicked:', event)
  }

  const handleRSVP = (eventId: string) => {
    console.log('RSVP to event:', eventId)
  }

  const handleCreateEvent = async (data: any) => {
    console.log('Creating event:', data)
    // Here you would normally send the data to your API
  }

  const calendarEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    category: event.category
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <EventFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          isOnline={isOnline}
          onOnlineChange={setIsOnline}
        />

        {/* Content */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={handleEventClick}
                onRSVP={handleRSVP}
              />
            ))}
          </div>
        ) : (
          /* Calendar View */
          <CalendarView
            events={calendarEvents}
            onDateClick={handleDateClick}
            onEventClick={handleCalendarEventClick}
          />
        )}

        {/* No Events Found */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No events found</div>
            <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
          </div>
        )}
      </div>

      {/* Floating Add Button (for admins/club leaders) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  )
}
