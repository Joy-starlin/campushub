'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Globe, 
  Users,
  Calendar,
  CheckCircle,
  MapPin,
  Building,
  Star,
  ExternalLink
} from 'lucide-react'
import { University, UniversityFilter, UniversityType, Region } from '../types/universities'
import { ResponsiveButton } from './ResponsiveForm'

interface UniversityDirectoryProps {
  universities: University[]
  onUniversitySelect: (university: University) => void
}

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Morocco',
  'Ethiopia', 'Democratic Republic of Congo', 'Cameroon',
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Netherlands', 'Sweden', 'Denmark'
]

const regions: { value: Region; label: string }[] = [
  { value: 'east-africa', label: 'East Africa' },
  { value: 'west-africa', label: 'West Africa' },
  { value: 'north-africa', label: 'North Africa' },
  { value: 'southern-africa', label: 'Southern Africa' },
  { value: 'central-africa', label: 'Central Africa' },
  { value: 'other', label: 'Other' }
]

const universityTypes: { value: UniversityType; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' }
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

export default function UniversityDirectory({
  universities,
  onUniversitySelect
}: UniversityDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<UniversityFilter>({
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

  // Filter universities
  const filteredUniversities = universities.filter(university => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      if (!university.name.toLowerCase().includes(searchLower) &&
          !university.shortName.toLowerCase().includes(searchLower) &&
          !university.country.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Country filter
    if (filter.country && university.country !== filter.country) {
      return false
    }

    // Region filter
    if (filter.region && university.region !== filter.region) {
      return false
    }

    // Type filter
    if (filter.type && university.type !== filter.type) {
      return false
    }

    // Official partner filter
    if (filter.isOfficialPartner !== undefined && university.isOfficialPartner !== filter.isOfficialPartner) {
      return false
    }

    return true
  })

  // Sort universities
  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    const { sortBy = 'name', sortOrder = 'asc' } = filter
    
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'members':
        comparison = a.stats.memberCount - b.stats.memberCount
        break
      case 'activeSince':
        comparison = new Date(a.activeSince).getTime() - new Date(b.activeSince).getTime()
        break
      case 'country':
        comparison = a.country.localeCompare(b.country)
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'desc' ? -comparison : comparison
  })

  const handleFilterChange = (newFilter: Partial<UniversityFilter>) => {
    setFilter({ ...filter, ...newFilter })
  }

  const clearFilters = () => {
    setFilter({
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  const hasActiveFilters = Object.keys(filter).some(key => {
    const value = filter[key as keyof UniversityFilter]
    return value !== undefined && value !== '' && key !== 'sortBy' && key !== 'sortOrder'
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-linear-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              University Partners
            </h1>
            <p className="text-xl text-blue-100">
              Connect with universities across Africa and beyond
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
                  placeholder="Search universities..."
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

              {/* Region Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Region</h4>
                <select
                  value={filter.region || ''}
                  onChange={(e) => handleFilterChange({ region: e.target.value as Region || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Type</h4>
                <select
                  value={filter.type || ''}
                  onChange={(e) => handleFilterChange({ type: e.target.value as UniversityType || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {universityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                    <option value="members">Student Count</option>
                    <option value="activeSince">Active Since</option>
                    <option value="country">Country</option>
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

            {/* Official Partner Toggle */}
            <div className="mt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.isOfficialPartner || false}
                  onChange={(e) => handleFilterChange({ isOfficialPartner: e.target.checked || undefined })}
                  className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show official partners only
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
              {sortedUniversities.length} Universities Found
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Active filters applied
              </p>
            )}
          </div>
        </div>

        {/* University Grid */}
        {sortedUniversities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedUniversities.map((university, index) => (
              <motion.div
                key={university.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => onUniversitySelect(university)}
              >
                <div className="p-6">
                  {/* University Logo */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {university.logo ? (
                        <img
                          src={university.logo}
                          alt={university.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* University Info */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {university.name}
                      </h3>
                      {university.isOfficialPartner && (
                        <CheckCircle className="w-4 h-4 text-blue-500" title="Official Partner" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {university.shortName}
                    </p>
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{getCountryFlag(university.country)}</span>
                      <span>{university.country}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>Students</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {university.stats.memberCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Active Since</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(university.activeSince)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <ResponsiveButton
                    variant="primary"
                    className="w-full min-h-10"
                    onClick={() => {
                      onUniversitySelect(university)
                    }}
                  >
                    Visit Hub
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </ResponsiveButton>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No universities found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters to find more universities.
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
