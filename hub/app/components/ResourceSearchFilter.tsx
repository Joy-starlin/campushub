'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  SortAsc, 
  Calendar,
  FileText,
  ChevronDown,
  X
} from 'lucide-react'
import { ResourceFilter, ResourceSort, ResourceCategory, FileType } from '../types/resources'

interface ResourceSearchFilterProps {
  filter: ResourceFilter
  sort: ResourceSort
  onFilterChange: (filter: ResourceFilter) => void
  onSortChange: (sort: ResourceSort) => void
  totalCount: number
  filteredCount: number
}

const categories: { value: ResourceCategory; label: string }[] = [
  { value: 'timetables', label: 'Timetables & Schedules' },
  { value: 'forms', label: 'Official University Forms' },
  { value: 'study-materials', label: 'Study Materials & Notes' },
  { value: 'exam-papers', label: 'Past Exam Papers' },
  { value: 'club-constitutions', label: 'Club Constitutions' },
  { value: 'event-programs', label: 'Event Programs' },
  { value: 'campus-maps', label: 'Campus Maps' },
  { value: 'student-handbooks', label: 'Student Handbooks' },
  { value: 'job-templates', label: 'Job Application Templates' },
  { value: 'scholarship-info', label: 'Scholarship Information' }
]

const fileTypes: { value: FileType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'DOC' },
  { value: 'docx', label: 'DOCX' },
  { value: 'xls', label: 'XLS' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'ppt', label: 'PPT' },
  { value: 'pptx', label: 'PPTX' }
]

const sortOptions: { value: ResourceSort['by']; label: string }[] = [
  { value: 'most-downloaded', label: 'Most Downloaded' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'title', label: 'Title (A-Z)' }
]

const universities = [
  'Bugema University',
  'Makerere University',
  'University of Nairobi',
  'Kenyatta University',
  'Uganda Christian University',
  'Daystar University'
]

export default function ResourceSearchFilter({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  totalCount,
  filteredCount
}: ResourceSearchFilterProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search })
  }

  const handleCategoryChange = (category: ResourceCategory | undefined) => {
    onFilterChange({ ...filter, category })
  }

  const handleUniversityChange = (university: string | undefined) => {
    onFilterChange({ ...filter, university })
  }

  const handleFileTypeChange = (fileType: FileType | undefined) => {
    onFilterChange({ ...filter, fileType })
  }

  const handleDateRangeChange = (start: string, end: string) => {
    onFilterChange({ 
      ...filter, 
      dateRange: start && end ? { start, end } : undefined 
    })
  }

  const handleSortByChange = (by: ResourceSort['by']) => {
    onSortChange({ by, order: by === 'title' ? 'asc' : 'desc' })
  }

  const clearFilters = () => {
    onFilterChange({})
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters = Object.values(filter).some(value => 
    value !== undefined && value !== ''
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={filter.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search resources by title or tags..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <select
            value={filter.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value as ResourceCategory | undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* University Filter */}
        <div className="flex-1">
          <select
            value={filter.university || ''}
            onChange={(e) => handleUniversityChange(e.target.value as string | undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Universities</option>
            {universities.map((university) => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex-1">
          <select
            value={sort.by}
            onChange={(e) => handleSortByChange(e.target.value as ResourceSort['by'])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
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

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {filteredCount} of {totalCount} resources
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <FileText className="w-4 h-4 inline mr-1" />
                File Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {fileTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleFileTypeChange(
                      filter.fileType === type.value ? undefined : type.value
                    )}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      filter.fileType === type.value
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />
                Upload Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filter.dateRange?.start || ''}
                    onChange={(e) => {
                      const start = e.target.value
                      const end = filter.dateRange?.end || ''
                      handleDateRangeChange(start, end)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filter.dateRange?.end || ''}
                    onChange={(e) => {
                      const end = e.target.value
                      const start = filter.dateRange?.start || ''
                      handleDateRangeChange(start, end)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filter.search && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm">
                      Search: "{filter.search}"
                    </span>
                  )}
                  {filter.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm">
                      Category: {categories.find(c => c.value === filter.category)?.label}
                    </span>
                  )}
                  {filter.university && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm">
                      University: {filter.university}
                    </span>
                  )}
                  {filter.fileType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm">
                      Type: {filter.fileType.toUpperCase()}
                    </span>
                  )}
                  {filter.dateRange && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm">
                      Date Range
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
