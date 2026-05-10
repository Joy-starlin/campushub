'use client'

import { Search } from 'lucide-react'

interface ClubFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { value: '', label: 'All Clubs' },
  { value: 'Academic', label: 'Academic' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Religious', label: 'Religious' },
  { value: 'Community', label: 'Community' },
  { value: 'International', label: 'International' }
]

export default function ClubFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: ClubFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search clubs..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}
