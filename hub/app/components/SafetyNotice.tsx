'use client'

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Users, MapPin, Share2 } from 'lucide-react'

export default function SafetyNotice() {
  const safetyTips = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Verify Identity",
      description: "Always verify the driver/passenger identity before traveling"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Meet Publicly",
      description: "Meet in public areas for pickup and drop-off"
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Share Trip Details",
      description: "Share your trip details with a friend or family member"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-6"
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Safety First
          </h3>
          
          <p className="text-amber-800 dark:text-amber-200 mb-4">
            Always verify the driver/passenger before travel. Meet in public areas. Share your trip with a friend.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safetyTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                  {tip.icon}
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 text-sm">
                    {tip.title}
                  </h4>
                  <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                    {tip.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Emergency:</strong> If you feel unsafe at any point, trust your instincts and remove yourself from the situation. Contact campus security if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
