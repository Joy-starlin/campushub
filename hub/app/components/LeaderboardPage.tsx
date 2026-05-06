'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Crown, 
  Medal, 
  Users, 
  Globe,
  Calendar,
  ChevronDown,
  Star,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { LeaderboardEntry, LeaderboardFilter, Badge, User } from '../types/gamification'
import ResponsiveContainer from './ResponsiveContainer'
import { ResponsiveButton } from './ResponsiveForm'

interface LeaderboardPageProps {
  currentUser: User
  leaderboardData: LeaderboardEntry[]
  onFilterChange: (filter: LeaderboardFilter) => void
}

const getCountryFlag = (countryCode: string) => {
  const flags: { [key: string]: string } = {
    'UG': '🇺🇬',
    'KE': '🇰🇪',
    'TZ': '🇹🇿',
    'RW': '🇷🇼',
    'BI': '🇧🇮',
    'SS': '🇸🇸',
    'CD': '🇨🇩',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦'
  }
  return flags[countryCode] || '🌍'
}

const getRankChangeIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
  if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

const getPodiumColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'from-yellow-400 to-yellow-600 text-white'
    case 2:
      return 'from-gray-300 to-gray-500 text-white'
    case 3:
      return 'from-orange-400 to-orange-600 text-white'
    default:
      return 'from-gray-100 to-gray-200 text-gray-800'
  }
}

const getPodiumIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-8 h-8 text-yellow-300" />
    case 2:
      return <Medal className="w-8 h-8 text-gray-300" />
    case 3:
      return <Medal className="w-8 h-8 text-orange-300" />
    default:
      return <Trophy className="w-6 h-6 text-gray-400" />
  }
}

export default function LeaderboardPage({ 
  currentUser, 
  leaderboardData, 
  onFilterChange 
}: LeaderboardPageProps) {
  const [filter, setFilter] = useState<LeaderboardFilter>({
    timeFrame: 'all-time',
    scope: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  const handleFilterChange = (newFilter: Partial<LeaderboardFilter>) => {
    const updatedFilter = { ...filter, ...newFilter }
    setFilter(updatedFilter)
    onFilterChange(updatedFilter)
    setCurrentPage(1)
  }

  // Get top 3 for podium
  const topThree = leaderboardData.slice(0, 3)
  const remainingEntries = leaderboardData.slice(3)

  // Pagination
  const totalPages = Math.ceil(remainingEntries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEntries = remainingEntries.slice(startIndex, startIndex + itemsPerPage)

  // Find current user's entry
  const currentUserEntry = leaderboardData.find(entry => entry.user.id === currentUser.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ResponsiveContainer>
        <div className="py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Celebrating our most active and engaged community members
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Time Frame */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Time Period
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'all-time', label: 'All Time' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange({ timeFrame: option.value as any })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter.timeFrame === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Scope
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'university', label: 'My University' },
                    { value: 'all', label: 'All Universities' },
                    { value: 'country', label: 'My Country' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange({ scope: option.value as any })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter.scope === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Podium - Top 3 */}
          {topThree.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {topThree.map((entry, index) => {
                const rank = index + 1
                const isCurrentUser = entry.user.id === currentUser.id
                
                return (
                  <motion.div
                    key={entry.user.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`relative ${isCurrentUser ? 'ring-4 ring-blue-400 ring-opacity-50 rounded-2xl' : ''}`}
                  >
                    {/* Rank Number */}
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br ${getPodiumColor(rank)} rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                      {rank}
                    </div>

                    {/* Card */}
                    <div className={`bg-gradient-to-br ${getPodiumColor(rank)} rounded-2xl shadow-xl p-6 pt-8 text-center`}>
                      {/* Crown for 1st place */}
                      {rank === 1 && (
                        <div className="mb-4">
                          {getPodiumIcon(rank)}
                        </div>
                      )}

                      {/* Avatar */}
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden">
                          {entry.user.avatar ? (
                            <img
                              src={entry.user.avatar}
                              alt={entry.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/20 flex items-center justify-center">
                              <Users className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                        {rank === 1 && (
                          <div className="absolute -top-2 -right-2">
                            <Crown className="w-8 h-8 text-yellow-300" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <h3 className="text-xl font-bold mb-1">
                        {entry.user.name}
                      </h3>
                      <p className="text-sm opacity-90 mb-2">
                        {entry.user.university}
                      </p>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span>{getCountryFlag(entry.user.countryCode)}</span>
                        <span className="text-sm opacity-90">{entry.user.country}</span>
                      </div>

                      {/* Points */}
                      <div className="text-3xl font-bold mb-4">
                        {entry.points.toLocaleString()}
                      </div>
                      <div className="text-sm opacity-90">points</div>

                      {/* Top Badge */}
                      <div className="mt-4 p-2 bg-white/20 rounded-lg">
                        <div className="text-2xl mb-1">{entry.topBadge.icon}</div>
                        <div className="text-xs font-medium">{entry.topBadge.name}</div>
                      </div>

                      {/* Rank Change */}
                      {entry.weeklyChange !== 0 && (
                        <div className="mt-3 flex items-center justify-center space-x-1">
                          {getRankChangeIcon(entry.weeklyChange)}
                          <span className="text-sm font-medium">
                            {Math.abs(entry.weeklyChange)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Current User Card */}
          {currentUserEntry && currentUserEntry.rank > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    #{currentUserEntry.rank}
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-blue-300 dark:border-blue-600 overflow-hidden">
                    {currentUserEntry.user.avatar ? (
                      <img
                        src={currentUserEntry.user.avatar}
                        alt={currentUserEntry.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {currentUserEntry.user.name} (You)
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {currentUserEntry.points.toLocaleString()} points
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {getRankChangeIcon(currentUserEntry.weeklyChange)}
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {currentUserEntry.weeklyChange !== 0 && `${Math.abs(currentUserEntry.weeklyChange)} this week`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full Rankings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Top Badge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedEntries.map((entry, index) => {
                    const isCurrentUser = entry.user.id === currentUser.id
                    const actualRank = 4 + startIndex + index
                    
                    return (
                      <motion.tr
                        key={entry.user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.02 }}
                        className={isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${
                              actualRank <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 
                              isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 
                              'text-gray-900 dark:text-white'
                            }`}>
                              #{actualRank}
                            </span>
                            {actualRank <= 3 && (
                              <span className="ml-2">{getPodiumIcon(actualRank)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                              {entry.user.avatar ? (
                                <img
                                  src={entry.user.avatar}
                                  alt={entry.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${
                                isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                              }`}>
                                {entry.user.name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              {entry.user.isVerified && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Star className="w-3 h-3 mr-1" />
                                  Verified
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {entry.user.university}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span>{getCountryFlag(entry.user.countryCode)}</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {entry.user.country}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {entry.points.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{entry.topBadge.icon}</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {entry.topBadge.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {getRankChangeIcon(entry.weeklyChange)}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {entry.weeklyChange !== 0 ? Math.abs(entry.weeklyChange) : '-'}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 4} to {Math.min(startIndex + 3 + itemsPerPage, leaderboardData.length)} of {leaderboardData.length} results
                  </div>
                  <div className="flex space-x-2">
                    <ResponsiveButton
                      variant="secondary"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="min-h-9"
                    >
                      Previous
                    </ResponsiveButton>
                    <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <ResponsiveButton
                      variant="secondary"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="min-h-9"
                    >
                      Next
                    </ResponsiveButton>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
