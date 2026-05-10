'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3, Calendar, Plus } from 'lucide-react'
import EventCard from './EventCard'
import CalendarView from './CalendarView'
import EventFilters from './EventFilters'
import AddEventModal from './AddEventModal'
import BookingModal from './BookingModal'
import { Event } from './EventCard'

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: '2026 Graduating Class General Elections',
    description: 'Vote for your graduating class leaders in the 2026 Bugema University general elections on May 4th.',
    date: new Date('2026-05-04'),
    time: '08:00',
    location: 'Main Campus Quad',
    isOnline: false,
    category: 'Social',
    bannerImage: '/assets/events/elections.jpeg',
    maxAttendees: 1000,
    currentAttendees: 642,
    attendees: [
      { id: '1', name: 'Sarah Johnson' },
      { id: '2', name: 'Mike Chen' }
    ],
    organizer: {
      name: 'Student Guild',
      role: 'Campus Organization'
    }
  },
  {
    id: '2',
    title: '2026 IT Study Trip',
    description: 'Join us for the 2026 IT study trip featuring educational visits to technology centers and a social outing to White Sand Beach.',
    date: new Date('2026-05-15'),
    time: '07:00',
    location: 'Off-campus',
    isOnline: false,
    category: 'Academic',
    bannerImage: '/assets/events/it-trip.png',
    maxAttendees: 150,
    currentAttendees: 89,
    requiresBooking: true,
    price: 45000,
    attendees: [
      { id: '3', name: 'Emily Davis' },
      { id: '4', name: 'Alex Kim' }
    ],
    organizer: {
      name: 'IT Department',
      role: 'Academic Club'
    }
  },

  {
    id: '4',
    title: 'GitHub Copilot Dev Days',
    description: 'Discover AI-powered developer tools at the GitHub Copilot Dev Days hosted at Bugema University.',
    date: new Date('2026-05-01'),
    time: '09:00',
    location: 'Convention Center',
    isOnline: false,
    category: 'Career',
    bannerImage: '/assets/events/github-dev-days.png',
    maxAttendees: 500,
    currentAttendees: 423,
    requiresBooking: true,
    price: 5000,
    attendees: [
      { id: '7', name: 'Pat Morgan' },
      { id: '8', name: 'Taylor Swift' }
    ],
    organizer: {
      name: 'Developer Student Circle',
      role: 'Campus Department'
    }
  },
  {
    id: '5',
    title: 'Student Orientation 2026',
    description: 'Welcome to Bugema University! Join the Student Orientation to transition smoothly into university life.',
    date: new Date('2026-02-24'),
    time: '10:00',
    location: 'Auditorium',
    isOnline: false,
    category: 'Social',
    bannerImage: '/assets/events/orientation.png',
    maxAttendees: 800,
    currentAttendees: 750,
    attendees: [
      { id: '9', name: 'Sam Wilson' },
      { id: '10', name: 'Maria Garcia' }
    ],
    organizer: {
      name: 'Admissions Office',
      role: 'Campus Organization'
    }
  },
  {
    id: '6',
    title: 'BUCU Fellowship Worship Evening',
    description: 'Join multiple religious student groups for an inspiring Worship Evening organized by the BUCU Fellowship.',
    date: new Date('2026-05-01'),
    time: '18:00',
    location: 'Main Hall',
    isOnline: false,
    category: 'Cultural',
    bannerImage: '/assets/events/worship-evening.png',
    maxAttendees: 600,
    currentAttendees: 450,
    attendees: [
      { id: '11', name: 'Li Wei' },
      { id: '12', name: 'James Doe' }
    ],
    organizer: {
      name: 'BUCU Fellowship',
      role: 'Cultural Organization'
    }
  }
]

type ViewMode = 'grid' | 'calendar'

interface EventsPageProps {
  defaultIsOnline?: boolean
}

export default function EventsPage({ defaultIsOnline = false }: EventsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<Event | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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



      // Online filter
      if (defaultIsOnline && !event.isOnline) {
        return false
      }

      return true
    })
  }, [events, searchQuery, selectedCategory, startDate, endDate, defaultIsOnline])

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

  const handleBook = (event: Event) => {
    setSelectedEventForBooking(event)
    setIsBookingModalOpen(true)
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
                onBook={handleBook}
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

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        event={selectedEventForBooking}
      />
    </div>
  )
}
