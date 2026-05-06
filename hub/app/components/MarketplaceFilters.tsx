'use client'

import { useState } from 'react'

interface MarketplaceFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  selectedConditions: string[]
  onConditionsChange: (conditions: string[]) => void
  sortBy: string
  onSortByChange: (sort: string) => void
  currency: 'UGX' | 'USD'
  exchangeRate?: number
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Textbooks', label: 'Textbooks' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Food', label: 'Food' },
  { value: 'Services', label: 'Services' },
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Transport', label: 'Transport' }
]

const conditions = ['New', 'Good', 'Fair']
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
]

export default function MarketplaceFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedConditions,
  onConditionsChange,
  sortBy,
  onSortByChange,
  currency,
  exchangeRate = 3800
}: MarketplaceFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange)

  const handlePriceChange = (index: number, value: string) => {
    const newRange = [...localPriceRange] as [number, number]
    newRange[index] = parseInt(value) || 0
    setLocalPriceRange(newRange)
    onPriceRangeChange(newRange)
  }

  const handleConditionToggle = (condition: string) => {
    const newConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter(c => c !== condition)
      : [...selectedConditions, condition]
    onConditionsChange(newConditions)
  }

  const formatPriceLabel = (price: number) => {
    return currency === 'UGX' 
      ? `UGX ${price.toLocaleString()}`
      : `$${(price / exchangeRate).toFixed(0)}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              value={localPriceRange[0]}
              onChange={(e) => handlePriceChange(0, e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <span className="text-xs text-gray-500">
              {formatPriceLabel(localPriceRange[0])}
            </span>
          </div>
          <div>
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              value={localPriceRange[1]}
              onChange={(e) => handlePriceChange(1, e.target.value)}
              placeholder="1000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <span className="text-xs text-gray-500">
              {formatPriceLabel(localPriceRange[1])}
            </span>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition
        </label>
        <div className="space-y-2">
          {conditions.map(condition => (
            <label key={condition} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition)}
                onChange={() => handleConditionToggle(condition)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Currency Toggle */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Currency
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => {/* Handle currency change */}}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              currency === 'UGX'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            UGX
          </button>
          <button
            onClick={() => {/* Handle currency change */}}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              currency === 'USD'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            USD
          </button>
        </div>
      </div>
    </div>
  )
}
