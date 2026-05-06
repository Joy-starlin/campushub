'use client'

import { motion } from 'framer-motion'
import { 
  Calendar, 
  FileText, 
  BookOpen, 
  ClipboardList,
  Users,
  Ticket,
  Map,
  Library,
  Briefcase,
  GraduationCap
} from 'lucide-react'
import { ResourceCategory, CategoryInfo } from '../types/resources'

interface ResourceCategoriesProps {
  selectedCategory: ResourceCategory | null
  onCategorySelect: (category: ResourceCategory | null) => void
  resourceCounts?: Record<ResourceCategory, number>
}

const categories: CategoryInfo[] = [
  {
    id: 'timetables',
    name: 'Timetables & Schedules',
    description: 'Class schedules, exam timetables, academic calendars',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800'
  },
  {
    id: 'forms',
    name: 'Official University Forms',
    description: 'Application forms, registration forms, official documents',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-800'
  },
  {
    id: 'study-materials',
    name: 'Study Materials & Notes',
    description: 'Lecture notes, study guides, course materials',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-800'
  },
  {
    id: 'exam-papers',
    name: 'Past Exam Papers',
    description: 'Previous exam papers, practice tests, solutions',
    icon: <ClipboardList className="w-6 h-6" />,
    color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    darkColor: 'dark:bg-red-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-800'
  },
  {
    id: 'club-constitutions',
    name: 'Club Constitutions',
    description: 'Club bylaws, constitutions, governance documents',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    darkColor: 'dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-800'
  },
  {
    id: 'event-programs',
    name: 'Event Programs',
    description: 'Event schedules, programs, itineraries',
    icon: <Ticket className="w-6 h-6" />,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    darkColor: 'dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700 dark:hover:bg-indigo-800'
  },
  {
    id: 'campus-maps',
    name: 'Campus Maps',
    description: 'Campus layouts, building maps, navigation guides',
    icon: <Map className="w-6 h-6" />,
    color: 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
    darkColor: 'dark:bg-teal-900 dark:text-teal-200 dark:border-teal-700 dark:hover:bg-teal-800'
  },
  {
    id: 'student-handbooks',
    name: 'Student Handbooks',
    description: 'Student guides, handbooks, policy documents',
    icon: <Library className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    darkColor: 'dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700 dark:hover:bg-orange-800'
  },
  {
    id: 'job-templates',
    name: 'Job Application Templates',
    description: 'Resume templates, cover letters, job application guides',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
    darkColor: 'dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700 dark:hover:bg-pink-800'
  },
  {
    id: 'scholarship-info',
    name: 'Scholarship Information',
    description: 'Scholarship applications, financial aid information',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
    darkColor: 'dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700 dark:hover:bg-cyan-800'
  }
]

export default function ResourceCategories({ 
  selectedCategory, 
  onCategorySelect, 
  resourceCounts = {} as Record<ResourceCategory, number>
}: ResourceCategoriesProps) {
  const totalCount = Object.values(resourceCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Browse resources by category
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total Resources
          </div>
        </div>
      </div>

      {/* All Categories Button */}
      <div className="mb-4">
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full md:w-auto px-6 py-3 rounded-lg border-2 font-medium transition-all ${
            selectedCategory === null
              ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All Categories ({totalCount})
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category, index) => {
          const count = resourceCounts[category.id] || 0
          const isSelected = selectedCategory === category.id
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategorySelect(isSelected ? null : category.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? `${category.color} ${category.darkColor} border-opacity-100 shadow-lg`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {category.name}
                  </h3>
                  <p className={`text-xs mb-2 line-clamp-2 ${
                    isSelected ? 'opacity-90' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {category.description}
                  </p>
                  <div className={`text-xs font-medium ${
                    isSelected ? 'opacity-90' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {count} resource{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Category Info */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              {categories.find(c => c.id === selectedCategory)?.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {resourceCounts[selectedCategory] || 0} resources available
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
