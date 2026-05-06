'use client'

import { motion } from 'framer-motion'
import { TrendingUp, MapPin, ArrowRight } from 'lucide-react'
import { PopularRoute } from '../types/rides'

interface PopularRoutesProps {
  routes: PopularRoute[]
  onRouteSelect: (from: string, to: string) => void
}

export default function PopularRoutes({ routes, onRouteSelect }: PopularRoutesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Popular Routes
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {routes.map((route, index) => (
          <motion.button
            key={`${route.from}-${route.to}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => onRouteSelect(route.from, route.to)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group"
          >
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {route.from}
            </span>
            <ArrowRight className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {route.to}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({route.count})
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
