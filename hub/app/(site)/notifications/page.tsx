'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Check } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import NotificationItem from '../../components/NotificationItem'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    markAllAsRead()
    setIsMarkingAll(false)
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isMarkingAll ? 'Marking...' : 'Mark all read'}</span>
                </button>
              )}
              <button
                onClick={() => router.push('/settings/notifications')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <NotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">You have no notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}



