'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react'
import { PublicResponse, FeedbackCategory, CategoryInfo } from '../types/feedback'
import { ResponsiveButton } from './ResponsiveForm'

interface PublicResponsesProps {
  responses: PublicResponse[]
  onUpvote: (responseId: string) => void
}

const categories: CategoryInfo[] = [
  {
    id: 'campus-facilities',
    name: 'Campus Facilities',
    description: 'Issues with buildings, classrooms, dorms, cafeteria',
    icon: <div className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200'
  },
  {
    id: 'academic-issues',
    name: 'Academic Issues',
    description: 'Problems with courses, professors, exams, schedules',
    icon: <div className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    darkColor: 'dark:bg-green-900 dark:text-green-200'
  },
  {
    id: 'safety-concern',
    name: 'Safety Concern',
    description: 'Security issues, emergencies, safety hazards',
    icon: <div className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    darkColor: 'dark:bg-red-900 dark:text-red-200'
  },
  {
    id: 'club-event',
    name: 'Club or Event',
    description: 'Issues with student clubs, events, activities',
    icon: <div className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    darkColor: 'dark:bg-purple-900 dark:text-purple-200'
  },
  {
    id: 'website-bug',
    name: 'Website/App Bug',
    description: 'Technical issues, bugs, feature requests',
    icon: <div className="w-4 h-4" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    darkColor: 'dark:bg-yellow-900 dark:text-yellow-200'
  },
  {
    id: 'general-suggestion',
    name: 'General Suggestion',
    description: 'Ideas for improvement, general feedback',
    icon: <div className="w-4 h-4" />,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    darkColor: 'dark:bg-indigo-900 dark:text-indigo-200'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Anything else not covered above',
    icon: <div className="w-4 h-4" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    darkColor: 'dark:bg-gray-700 dark:text-gray-200'
  }
]

export default function PublicResponses({ responses, onUpvote }: PublicResponsesProps) {
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes'>('recent')

  const filteredResponses = responses.filter(response => 
    filterCategory === 'all' || response.category === filterCategory
  ).sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes
    } else {
      return new Date(b.respondedAt).getTime() - new Date(a.respondedAt).getTime()
    }
  })

  const getCategoryInfo = (categoryId: FeedbackCategory) => {
    return categories.find(c => c.id === categoryId) || categories[6]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleUpvote = (responseId: string) => {
    onUpvote(responseId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Public Responses
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            See how administrators are addressing community feedback
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FeedbackCategory | 'all')}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'upvotes')}
            className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="upvotes">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* Responses */}
      {filteredResponses.length > 0 ? (
        <div className="space-y-4">
          {filteredResponses.map((response, index) => {
            const categoryInfo = getCategoryInfo(response.category)
            
            return (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color} ${categoryInfo.darkColor}`}>
                      {categoryInfo.name}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(response.respondedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Resolved
                    </span>
                  </div>
                </div>

                {/* Response Content */}
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {response.response}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Response from {response.respondedBy}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(response.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                        response.isUpvoted
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{response.upvotes}</span>
                    </button>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {response.upvotes} people had this concern
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Public Responses Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Administrators haven't posted any public responses yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}
