'use client'

import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Event {
  id: string
  title: string
  date: Date
  category: 'Academic' | 'Social' | 'Sports' | 'Cultural' | 'Career'
}

interface CalendarViewProps {
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

const categoryColors = {
  Academic: 'bg-blue-500',
  Social: 'bg-green-500',
  Sports: 'bg-orange-500',
  Cultural: 'bg-purple-500',
  Career: 'bg-red-500'
}

export default function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = useMemo(() => {
    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [startDate, endDate])

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, dayIndex) => {
          const eventsForDate = getEventsForDate(day)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={dayIndex}
              onClick={() => onDateClick(day)}
              className={`min-h-20 p-2 border rounded-lg cursor-pointer transition-colors ${
                !isCurrentMonth
                  ? 'bg-gray-50 text-gray-400 border-gray-200'
                  : isCurrentDay
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentDay ? 'text-blue-600' : ''
              }`}>
                {format(day, 'd')}
              </div>
              
              {/* Event Dots */}
              <div className="space-y-1">
                {eventsForDate.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full ${categoryColors[event.category]}`} />
                    <span className="truncate text-gray-700 hover:text-blue-600">
                      {event.title}
                    </span>
                  </div>
                ))}
                {eventsForDate.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{eventsForDate.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-gray-600">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
