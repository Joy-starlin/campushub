'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Users,
  Calendar,
  Briefcase,
  MapPin,
  Building,
  GraduationCap,
  UserPlus,
  CheckCircle
} from 'lucide-react'
import { Alumni, AlumniFilter, Industry } from '../types/alumni'
import { ResponsiveButton } from './ResponsiveForm'

interface AlumniDirectoryProps {
  alumni: Alumni[]
  onAlumniSelect: (alumni: Alumni) => void
  onConnectRequest: (alumniId: string) => void
}

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

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Morocco',
  'Ethiopia', 'Democratic Republic of Congo', 'Cameroon',
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Netherlands', 'Sweden', 'Denmark'
]

const getCountryFlag = (country: string) => {
  const flags: Record<string, string> = {
    'Uganda': '🇺🇬',
    'Kenya': '🇰🇪',
    'Tanzania': '🇹🇿',
    'Rwanda': '🇷🇼',
    'Burundi': '🇧🇮',
    'Nigeria': '🇳🇬',
    'Ghana': '🇬🇭',
    'South Africa': '🇿🇦',
    'Egypt': '🇪🇬',
    'Morocco': '🇲🇦',
    'Ethiopia': '🇪🇹',
    'Democratic Republic of Congo': '🇨🇩',
    'Cameroon': '🇨🇲',
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Netherlands': '🇳🇱',
    'Sweden': '🇸🇪',
    'Denmark': '🇩🇰'
  }
  return flags[country] || '🌍'
}

const getIndustryColor = (industry: Industry) => {
  const colors = {
    'tech': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'finance': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'education': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'ngo': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'consulting': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'marketing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'sales': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'engineering': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return colors[industry] || colors.other
}

export default function AlumniDirectory({
  alumni,
  onAlumniSelect,
  onConnectRequest
}: AlumniDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<AlumniFilter>({
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter alumni
  const filteredAlumni = alumni.filter(alumnus => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      if (!alumnus.name.toLowerCase().includes(searchLower) &&
          !alumnus.currentCompany?.toLowerCase().includes(searchLower) &&
          !alumnus.currentJobTitle?.toLowerCase().includes(searchLower) &&
          !alumnus.university.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Graduation year filter
    if (filter.graduationYear) {
      if (filter.graduationYear.min && alumnus.graduationYear < filter.graduationYear.min) {
        return false
      }
      if (filter.graduationYear.max && alumnus.graduationYear > filter.graduationYear.max) {
        return false
      }
    }

    // Industry filter
    if (filter.industry && alumnus.industry !== filter.industry) {
      return false
    }

    // Country filter
    if (filter.country && alumnus.country !== filter.country) {
      return false
    }

    // Available to mentor filter
    if (filter.isAvailableToMentor !== undefined && alumnus.isAvailableToMentor !== filter.isAvailableToMentor) {
      return false
    }

    return true
  })

  // Sort alumni
  const sortedAlumni = [...filteredAlumni].sort((a, b) => {
    const { sortBy = 'name', sortOrder = 'asc' } = filter
    
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'graduationYear':
        comparison = a.graduationYear - b.graduationYear
        break
      case 'joinedAt':
        comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
        break
      case 'lastActive':
        comparison = new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime()
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'desc' ? -comparison : comparison
  })

  const handleFilterChange = (newFilter: Partial<AlumniFilter>) => {
    setFilter({ ...filter, ...newFilter })
  }

  const clearFilters = () => {
    setFilter({
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  const hasActiveFilters = Object.keys(filter).some(key => {
    const value = filter[key as keyof AlumniFilter]
    return value !== undefined && value !== '' && key !== 'sortBy' && key !== 'sortOrder'
  })

  const getYearsSinceGraduation = (year: number) => {
    return new Date().getFullYear() - year
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Alumni Network
            </h1>
            <p className="text-xl text-green-100">
              Connect with Bugema University graduates worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alumni by name, company, or university..."
                  className="flex-1 px-3 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent focus:outline-none"
                />
                <ResponsiveButton
                  variant="primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="min-h-12 px-6"
                >
                  <Filter className="w-5 h-5 mr-2" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Graduation Year Range */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Graduation Year</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filter.graduationYear?.min || ''}
                    onChange={(e) => handleFilterChange({
                      graduationYear: {
                        ...filter.graduationYear,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filter.graduationYear?.max || ''}
                    onChange={(e) => handleFilterChange({
                      graduationYear: {
                        ...filter.graduationYear,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Industry Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Industry</h4>
                <select
                  value={filter.industry || ''}
                  onChange={(e) => handleFilterChange({ industry: e.target.value as Industry || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Country</h4>
                <select
                  value={filter.country || ''}
                  onChange={(e) => handleFilterChange({ country: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {getCountryFlag(country)} {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
                <div className="space-y-2">
                  <select
                    value={filter.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="graduationYear">Graduation Year</option>
                    <option value="joinedAt">Joined Date</option>
                    <option value="lastActive">Last Active</option>
                  </select>
                  <select
                    value={filter.sortOrder}
                    onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Available to Mentor Toggle */}
            <div className="mt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.isAvailableToMentor || false}
                  onChange={(e) => handleFilterChange({ isAvailableToMentor: e.target.checked || undefined })}
                  className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Available to mentor students
                </span>
              </label>
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
              {sortedAlumni.length} Alumni Found
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Active filters applied
              </p>
            )}
          </div>
        </div>

        {/* Alumni Grid */}
        {sortedAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAlumni.map((alumnus, index) => (
              <motion.div
                key={alumnus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="p-6">
                  {/* Profile Photo and Basic Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {alumnus.avatar ? (
                        <img
                          src={alumnus.avatar}
                          alt={alumnus.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {alumnus.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <span>Class of {alumnus.graduationYear}</span>
                        <span>•</span>
                        <span>{getYearsSinceGraduation(alumnus.graduationYear)} years ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Position */}
                  {alumnus.currentJobTitle && alumnus.currentCompany && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span>Current Position</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alumnus.currentJobTitle}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {alumnus.currentCompany}
                      </p>
                    </div>
                  )}

                  {/* Industry and Location */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIndustryColor(alumnus.industry)}`}>
                      {alumnus.industry.replace('-', ' ')}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                      <span>{getCountryFlag(alumnus.country)}</span>
                      <span>{alumnus.country}</span>
                    </div>
                  </div>

                  {/* University */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <Building className="w-4 h-4" />
                    <span>{alumnus.university}</span>
                  </div>

                  {/* Mentorship Availability */}
                  {alumnus.isAvailableToMentor && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>Available to mentor</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <ResponsiveButton
                      variant="primary"
                      onClick={() => onAlumniSelect(alumnus)}
                      className="flex-1 min-h-9"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </ResponsiveButton>
                    {alumnus.linkedInProfile && (
                      <a
                        href={alumnus.linkedInProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Users className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No alumni found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters to find more alumni.
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
      </div>
    </div>
  )
}
