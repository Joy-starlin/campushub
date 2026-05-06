'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  SortAsc, 
  Calendar,
  MapPin,
  Globe,
  Users,
  Briefcase,
  X,
  ChevronDown
} from 'lucide-react'
import { StudyGroup, GroupFilter, SortOption } from '../types/studyGroups'
import StudyGroupCard from './StudyGroupCard'
import ResponsiveContainer from './ResponsiveContainer'
import ResponsiveGrid from './ResponsiveGrid'

interface StudyGroupBrowseProps {
  groups: StudyGroup[]
  joinedGroups: string[]
  onJoinGroup: (groupId: string) => void
  onFilterChange: (filter: GroupFilter) => void
  onSortChange: (sort: SortOption) => void
}

const departments = [
  'Computer Science',
  'Business Administration',
  'Education',
  'Nursing',
  'Engineering',
  'Agriculture',
  'Theology'
]

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
const languages = ['English', 'Luganda', 'Swahili']
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'most-members', label: 'Most Members' },
  { value: 'meeting-soonest', label: 'Meeting Soonest' }
]

export default function StudyGroupBrowse({
  groups,
  joinedGroups,
  onJoinGroup,
  onFilterChange,
  onSortChange
}: StudyGroupBrowseProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-groups'>('browse')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<GroupFilter>({})
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const handleFilterChange = (key: keyof GroupFilter, value: any) => {
    const newFilter = { ...filter, [key]: value }
    setFilter(newFilter)
    onFilterChange(newFilter)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    onSortChange(sort)
  }

  const clearFilters = () => {
    setFilter({})
    setSearchTerm('')
    onFilterChange({})
  }

  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '')

  // Filter groups based on search and filters
  const filteredGroups = groups.filter(group => {
    // Tab filter
    if (activeTab === 'my-groups') {
      return joinedGroups.includes(group.id)
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        group.name.toLowerCase().includes(searchLower) ||
        group.courseName.toLowerCase().includes(searchLower) ||
        group.courseCode.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower)
      )
    }

    // Department filter
    if (filter.department && group.department !== filter.department) {
      return false
    }

    // Year filter
    if (filter.year && group.year !== filter.year) {
      return false
    }

    // Meeting type filter
    if (filter.meetingType && group.location.type !== filter.meetingType) {
      return false
    }

    // Language filter
    if (filter.language && group.language !== filter.language) {
      return false
    }

    // Day filter
    if (filter.day && !group.schedule.days.includes(filter.day)) {
      return false
    }

    return true
  })

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Browse Groups
            </button>
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-groups'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Groups ({joinedGroups.length})
            </button>
          </nav>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course name or code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Department
                    </label>
                    <select
                      value={filter.department || ''}
                      onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Users className="w-4 h-4 inline mr-1" />
                      Year of Study
                    </label>
                    <select
                      value={filter.year || ''}
                      onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Years</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Meeting Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Meeting Type
                    </label>
                    <select
                      value={filter.meetingType || ''}
                      onChange={(e) => handleFilterChange('meetingType', e.target.value as 'physical' | 'online' | undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="physical">Physical</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Language
                    </label>
                    <select
                      value={filter.language || ''}
                      onChange={(e) => handleFilterChange('language', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Languages</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Day Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Day of Week
                    </label>
                    <select
                      value={filter.day || ''}
                      onChange={(e) => handleFilterChange('day', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Days</option>
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {filteredGroups.length} {activeTab === 'my-groups' ? 'Joined' : 'Available'} Groups
          </h2>

          {filteredGroups.length > 0 ? (
            <ResponsiveGrid 
              cols={{ base: 1, lg: 2, xl: 3 }}
              gap={{ base: 4, lg: 6 }}
            >
              {filteredGroups.map((group) => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  onJoinGroup={onJoinGroup}
                  isJoined={joinedGroups.includes(group.id)}
                />
              ))}
            </ResponsiveGrid>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No study groups found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {activeTab === 'browse' 
                  ? 'Try adjusting your filters or create a new study group.'
                  : 'You haven\'t joined any study groups yet.'
                }
              </p>
              {activeTab === 'browse' && (
                <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <span>Create Study Group</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  )
}
