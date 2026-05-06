'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Calendar, 
  Users, 
  Car, 
  Bike, 
  Bus, 
  Truck,
  DollarSign,
  Filter,
  X
} from 'lucide-react'
import { RideFilter, VehicleType } from '../types/rides'

interface RideFilterBarProps {
  filter: RideFilter
  onFilterChange: (filter: RideFilter) => void
}

export default function RideFilterBar({ filter, onFilterChange }: RideFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const vehicleTypes: { value: VehicleType; label: string; icon: React.ReactNode }[] = [
    { value: 'car', label: 'Car', icon: <Car className="w-4 h-4" /> },
    { value: 'boda', label: 'Boda', icon: <Bike className="w-4 h-4" /> },
    { value: 'matatu', label: 'Matatu', icon: <Truck className="w-4 h-4" /> },
    { value: 'bus', label: 'Bus', icon: <Bus className="w-4 h-4" /> }
  ]

  const handleFilterChange = (key: keyof RideFilter, value: any) => {
    onFilterChange({
      ...filter,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFilterChange({})
  }

  const hasActiveFilters = Object.values(filter).some(value => 
    value !== undefined && value !== ''
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      {/* Main filter bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Route search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={filter.route || ''}
              onChange={(e) => handleFilterChange('route', e.target.value)}
              placeholder="Search destination (e.g., Kampala, Entebbe)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date picker */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="date"
            value={filter.date || ''}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Seats needed */}
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <select
            value={filter.seatsNeeded || ''}
            onChange={(e) => handleFilterChange('seatsNeeded', e.target.value ? parseInt(e.target.value) : undefined)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="">Seats</option>
            <option value="1">1 seat</option>
            <option value="2">2 seats</option>
            <option value="3">3 seats</option>
            <option value="4">4+ seats</option>
          </select>
        </div>

        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>More Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </button>

        {/* Clear filters */}
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

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Vehicle Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vehicleTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleFilterChange('vehicleType', 
                          filter.vehicleType === type.value ? undefined : type.value
                        )}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                          filter.vehicleType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type.icon}
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price Range (UGX)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filter.priceRange?.min || ''}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filter.priceRange,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filter.priceRange?.max || ''}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filter.priceRange,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
