'use client'

import { Calendar, Users, TrendingUp, Star } from 'lucide-react'

interface RightSidebarProps {
  trendingTopics: string[]
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
  }>
  suggestedClubs: Array<{
    id: string
    name: string
    members: number
  }>
  activeMembersCount: number
}

export default function RightSidebar({
  trendingTopics,
  upcomingEvents,
  suggestedClubs,
  activeMembersCount
}: RightSidebarProps) {
  return (
    <div className="hidden lg:block w-80 space-y-6">
      {/* Active Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Community</h3>
        </div>
        <div className="text-2xl font-bold text-blue-600">{activeMembersCount}</div>
        <div className="text-sm text-gray-500">Active members</div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Trending Topics</h3>
        </div>
        <div className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              <span className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                {topic}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="border-l-2 border-blue-500 pl-3">
              <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                {event.title}
              </h4>
              <p className="text-xs text-gray-500">{event.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Clubs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Suggested Clubs</h3>
        </div>
        <div className="space-y-3">
          {suggestedClubs.map((club) => (
            <div key={club.id} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                  {club.name}
                </h4>
                <p className="text-xs text-gray-500">{club.members} members</p>
              </div>
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
