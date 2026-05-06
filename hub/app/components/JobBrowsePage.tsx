'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  X,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react'
import { Job, JobFilter, JobType, WorkMode, Industry, ExperienceLevel } from '../types/jobs'
import JobCard from './JobCard'
import { ResponsiveButton } from './ResponsiveForm'

interface JobBrowsePageProps {
  jobs: Job[]
  onJobSave: (jobId: string) => void
  onJobApply: (job: Job) => void
  onJobView: (job: Job) => void
  savedJobs: string[]
}

const jobTypes: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'contract', label: 'Contract' }
]

const workModes: { value: WorkMode; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' }
]

const industries: { value: Industry; label: string }[] = [
  { value: 'tech', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'ngo', label: 'NGO/Non-profit' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'other', label: 'Other' }
]

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'no-experience', label: 'No Experience' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' }
]

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Morocco',
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Netherlands', 'Sweden', 'Denmark'
]

export default function JobBrowsePage({
  jobs,
  onJobSave,
  onJobApply,
  onJobView,
  savedJobs
}: JobBrowsePageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [filter, setFilter] = useState<JobFilter>({
    jobTypes: [],
    workModes: [],
    industries: [],
    experienceLevels: [],
    datePosted: 'any',
    universityExclusive: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'deadline' | 'applications'>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  const jobsPerPage = 12

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      if (!job.title.toLowerCase().includes(searchLower) &&
          !job.company.name.toLowerCase().includes(searchLower) &&
          !job.description.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Location filter
    if (locationQuery) {
      const locationLower = locationQuery.toLowerCase()
      if (!job.location.city.toLowerCase().includes(locationLower) &&
          !job.location.country.toLowerCase().includes(locationLower)) {
        return false
      }
    }

    // Job type filter
    if (filter.jobTypes.length > 0 && !filter.jobTypes.includes(job.type)) {
      return false
    }

    // Work mode filter
    if (filter.workModes.length > 0 && !filter.workModes.includes(job.location.workMode)) {
      return false
    }

    // Industry filter
    if (filter.industries.length > 0 && !filter.industries.includes(job.company.industry)) {
      return false
    }

    // Experience level filter
    if (filter.experienceLevels.length > 0 && !filter.experienceLevels.includes(job.experienceLevel)) {
      return false
    }

    // University exclusive filter
    if (filter.universityExclusive && !job.isUniversityExclusive) {
      return false
    }

    // Date posted filter
    if (filter.datePosted !== 'any') {
      const now = new Date()
      const postedDate = new Date(job.postedAt)
      const diffDays = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (filter.datePosted === 'week' && diffDays > 7) {
        return false
      } else if (filter.datePosted === 'month' && diffDays > 30) {
        return false
      }
    }

    return true
  })

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      case 'deadline':
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime()
      case 'applications':
        return b.applicationCount - a.applicationCount
      default:
        return 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const paginatedJobs = sortedJobs.slice(startIndex, startIndex + jobsPerPage)

  const handleFilterChange = (newFilter: Partial<JobFilter>) => {
    setFilter({ ...filter, ...newFilter })
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilter({
      jobTypes: [],
      workModes: [],
      industries: [],
      experienceLevels: [],
      datePosted: 'any',
      universityExclusive: false
    })
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filter).some(value => 
    Array.isArray(value) ? value.length > 0 : value === true
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-blue-100">
              Discover opportunities from top companies worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, keywords, or company"
                    className="w-full pl-10 pr-3 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent focus:outline-none"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="City or country"
                    className="w-full pl-10 pr-3 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent focus:outline-none"
                  />
                </div>
                <ResponsiveButton
                  variant="primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="min-h-12 px-6"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-2 h-2 bg-white rounded-full"></span>
                  )}
                </ResponsiveButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Job Types */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Job Type</h4>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filter.jobTypes.includes(type.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange({ jobTypes: [...filter.jobTypes, type.value] })
                          } else {
                            handleFilterChange({ jobTypes: filter.jobTypes.filter(t => t !== type.value) })
                          }
                        }}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Mode */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Work Mode</h4>
                <div className="space-y-2">
                  {workModes.map((mode) => (
                    <label key={mode.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filter.workModes.includes(mode.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange({ workModes: [...filter.workModes, mode.value] })
                          } else {
                            handleFilterChange({ workModes: filter.workModes.filter(m => m !== mode.value) })
                          }
                        }}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Experience Level</h4>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filter.experienceLevels.includes(level.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange({ experienceLevels: [...filter.experienceLevels, level.value] })
                          } else {
                            handleFilterChange({ experienceLevels: filter.experienceLevels.filter(l => l !== level.value) })
                          }
                        }}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Industry</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {industries.map((industry) => (
                    <label key={industry.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filter.industries.includes(industry.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange({ industries: [...filter.industries, industry.value] })
                          } else {
                            handleFilterChange({ industries: filter.industries.filter(i => i !== industry.value) })
                          }
                        }}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{industry.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Posted */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Date Posted</h4>
                <div className="space-y-2">
                  {[
                    { value: 'any', label: 'Any time' },
                    { value: 'week', label: 'Past week' },
                    { value: 'month', label: 'Past month' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="datePosted"
                        checked={filter.datePosted === option.value}
                        onChange={() => handleFilterChange({ datePosted: option.value as any })}
                        className="mr-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* University Exclusive */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Special Filters</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.universityExclusive}
                    onChange={(e) => handleFilterChange({ universityExclusive: e.target.checked })}
                    className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bugema University exclusive</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sortedJobs.length} Jobs Found
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Active filters applied
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="deadline">Closing Soon</option>
              <option value="applications">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        {paginatedJobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {paginatedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={onJobSave}
                onApply={onJobApply}
                onView={onJobView}
                isSaved={savedJobs.includes(job.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters to find more opportunities.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <ResponsiveButton
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="min-h-10"
            >
              Previous
            </ResponsiveButton>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <ResponsiveButton
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="min-h-10"
            >
              Next
            </ResponsiveButton>
          </div>
        )}
      </div>
    </div>
  )
}
