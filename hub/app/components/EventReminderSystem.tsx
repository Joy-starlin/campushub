'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Clock, 
  Mail, 
  Smartphone, 
  Calendar, 
  Video,
  CheckCircle,
  X,
  Settings
} from 'lucide-react'
import { EventReminder, ReminderType, VirtualEvent } from '../types/virtual-events'
import toast from 'react-hot-toast'

interface EventReminderSystemProps {
  event: VirtualEvent
  userReminders: EventReminder[]
  onToggleReminder: (eventId: string, type: ReminderType, enabled: boolean) => void
  onTestReminder: (eventId: string, type: ReminderType) => void
}

const reminderTypes: { type: ReminderType; label: string; icon: string; description: string; defaultEnabled: boolean }[] = [
  {
    type: 'email-24h',
    label: 'Email (24 hours before)',
    icon: 'mail',
    description: 'Receive an email reminder 24 hours before the event starts',
    defaultEnabled: true
  },
  {
    type: 'email-15m',
    label: 'Email (15 minutes before)',
    icon: 'mail',
    description: 'Receive an email reminder 15 minutes before the event starts',
    defaultEnabled: true
  },
  {
    type: 'in-app-30m',
    label: 'In-App (30 minutes before)',
    icon: 'bell',
    description: 'Receive an in-app notification 30 minutes before the event starts',
    defaultEnabled: true
  },
  {
    type: 'push-10m',
    label: 'Push (10 minutes before)',
    icon: 'smartphone',
    description: 'Receive a push notification 10 minutes before the event starts',
    defaultEnabled: false
  }
]

export default function EventReminderSystem({
  event,
  userReminders,
  onToggleReminder,
  onTestReminder
}: EventReminderSystemProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [enabledReminders, setEnabledReminders] = useState<Set<ReminderType>>(new Set())

  useEffect(() => {
    const enabled = new Set<ReminderType>()
    reminderTypes.forEach(reminder => {
      const userReminder = userReminders.find(r => r.type === reminder.type && r.eventId === event.id)
      if (userReminder && !userReminder.sent) {
        enabled.add(reminder.type)
      }
    })
    setEnabledReminders(enabled)
  }, [userReminders, event.id])

  const handleToggleReminder = (type: ReminderType) => {
    const newEnabled = new Set(enabledReminders)
    if (newEnabled.has(type)) {
      newEnabled.delete(type)
    } else {
      newEnabled.add(type)
    }
    setEnabledReminders(newEnabled)
    onToggleReminder(event.id, type, newEnabled.has(type))
  }

  const handleTestReminder = (type: ReminderType) => {
    onTestReminder(event.id, type)
    toast.success(`Test ${type} reminder sent!`)
  }

  const getReminderIcon = (icon: string) => {
    switch (icon) {
      case 'mail':
        return <Mail className="w-4 h-4" />
      case 'bell':
        return <Bell className="w-4 h-4" />
      case 'smartphone':
        return <Smartphone className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getReminderStatus = (type: ReminderType) => {
    const reminder = userReminders.find(r => r.type === type && r.eventId === event.id)
    if (!reminder) return 'not-set'
    if (reminder.sent) return 'sent'
    return 'scheduled'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 dark:text-green-400'
      case 'scheduled':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Sent'
      case 'scheduled':
        return 'Scheduled'
      default:
        return 'Not set'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Event Reminders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {enabledReminders.size} reminder{enabledReminders.size !== 1 ? 's' : ''} set
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Quick Status */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reminderTypes.map((reminder) => {
            const status = getReminderStatus(reminder.type)
            const isEnabled = enabledReminders.has(reminder.type)
            
            return (
              <div
                key={reminder.type}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isEnabled
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isEnabled
                      ? 'bg-blue-100 dark:bg-blue-900/50'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {getReminderIcon(reminder.icon)}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${
                      isEnabled
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {reminder.label}
                    </p>
                    <p className={`text-xs ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleReminder(reminder.type)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isEnabled
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Reminder Settings</h4>
            
            {reminderTypes.map((reminder) => (
              <div key={reminder.type} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getReminderIcon(reminder.icon)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {reminder.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {reminder.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTestReminder(reminder.type)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">About Event Reminders</h5>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      Reminders will be sent automatically based on your event's start time. 
                      You can enable or disable specific reminder types at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
