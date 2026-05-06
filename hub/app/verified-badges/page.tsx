'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Shield } from 'lucide-react'
import { ProfileBadgesSection, BadgeList, UserWithBadges } from '../components/VerificationBadge'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { BadgeType } from '../types/verification'

// Mock Data
const mockVerifiedBadges: Array<{ type: BadgeType; earnedAt?: string; expiresAt?: string }> = [
  { type: 'verified-student', earnedAt: '2024-01-15T00:00:00Z' },
  { type: 'top-contributor', earnedAt: '2024-03-20T00:00:00Z' },
  { type: 'premium-member', earnedAt: '2024-04-01T00:00:00Z', expiresAt: '2025-04-01T00:00:00Z' }
]

export default function VerifiedBadgesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verified Badges
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage your verification status and identity badges across the platform
                </p>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      <ResponsiveContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {/* Main Section */}
          <ProfileBadgesSection badges={mockVerifiedBadges} className="mb-8" />
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Verification Settings</h2>
            </div>
            
            <div className="text-gray-600 dark:text-gray-300 mb-6 font-medium flex items-center gap-1.5 flex-wrap">
              <span>You are currently verified as</span> <UserWithBadges userName="Alex Johnson" badges={['verified-student', 'top-contributor']} showAllBadges={true} />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-600 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Request Alumni Status</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Graduating soon? Claim your alumni badge.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Request
                </button>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-600 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Get Official Creator Status</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">For university clubs and staff members.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </ResponsiveContainer>
    </div>
  )
}
