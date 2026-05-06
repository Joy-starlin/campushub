'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Calendar, Heart, MessageCircle, ShoppingBag, Users, CreditCard, Megaphone, Mail, Phone, Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'

interface NotificationSettings {
  // Notification types
  eventNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  likeNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  commentNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  marketplaceNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  clubRequestNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  paymentNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  announcementNotifications: {
    inApp: boolean
    email: boolean
    sms: boolean
  }
  
  // Do not disturb
  doNotDisturb: boolean
  doNotDisturbStart: string
  doNotDisturbEnd: string
  
  // Contact info
  phoneNumber: string
}

const notificationTypes = [
  {
    key: 'eventNotifications',
    label: 'Club Events',
    description: 'New events in your clubs',
    icon: Calendar,
    color: 'text-blue-600'
  },
  {
    key: 'likeNotifications',
    label: 'Post Likes',
    description: 'When someone likes your posts',
    icon: Heart,
    color: 'text-red-600'
  },
  {
    key: 'commentNotifications',
    label: 'Post Comments',
    description: 'New comments on your posts',
    icon: MessageCircle,
    color: 'text-purple-600'
  },
  {
    key: 'marketplaceNotifications',
    label: 'Marketplace',
    description: 'Messages about your listings',
    icon: ShoppingBag,
    color: 'text-orange-600'
  },
  {
    key: 'clubRequestNotifications',
    label: 'Club Requests',
    description: 'Join request approvals',
    icon: Users,
    color: 'text-green-600'
  },
  {
    key: 'paymentNotifications',
    label: 'Payments',
    description: 'Payment confirmations',
    icon: CreditCard,
    color: 'text-green-600'
  },
  {
    key: 'announcementNotifications',
    label: 'Announcements',
    description: 'Admin announcements',
    icon: Megaphone,
    color: 'text-blue-600'
  }
]

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<NotificationSettings>({
    defaultValues: {
      eventNotifications: { inApp: true, email: true, sms: false },
      likeNotifications: { inApp: true, email: false, sms: false },
      commentNotifications: { inApp: true, email: true, sms: false },
      marketplaceNotifications: { inApp: true, email: true, sms: true },
      clubRequestNotifications: { inApp: true, email: true, sms: false },
      paymentNotifications: { inApp: true, email: true, sms: true },
      announcementNotifications: { inApp: true, email: true, sms: false },
      doNotDisturb: false,
      doNotDisturbStart: '22:00',
      doNotDisturbEnd: '07:00',
      phoneNumber: '+256 700 000 000'
    }
  })

  const watchedDoNotDisturb = watch('doNotDisturb')
  const watchedPhoneNumber = watch('phoneNumber')

  const onSubmit = async (data: NotificationSettings) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving notification settings:', data)
      toast.success('Notification settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const ToggleSwitch = ({ checked, onChange, disabled = false }: {
    checked: boolean
    onChange: (checked: any) => void
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? 'bg-gray-300 cursor-not-allowed' : checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Notification Types */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Types</h2>
            
            <div className="space-y-6">
              {notificationTypes.map((type) => {
                const Icon = type.icon
                const settingsKey = type.key as keyof NotificationSettings
                
                return (
                  <div key={type.key} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${type.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{type.label}</h3>
                            <p className="text-sm text-gray-500">{type.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <span className="text-sm text-gray-700">In-App</span>
                            </div>
                            <ToggleSwitch
                              checked={watch(`${settingsKey}.inApp` as any)}
                              onChange={(checked) => setValue(`${settingsKey}.inApp` as any, checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">Email</span>
                            </div>
                            <ToggleSwitch
                              checked={watch(`${settingsKey}.email` as any)}
                              onChange={(checked) => setValue(`${settingsKey}.email` as any, checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">SMS</span>
                            </div>
                            <ToggleSwitch
                              checked={watch(`${settingsKey}.sms` as any)}
                              onChange={(checked) => setValue(`${settingsKey}.sms` as any, checked)}
                              disabled={!watchedPhoneNumber}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Do Not Disturb */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Do Not Disturb</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Quiet Hours</h3>
                  <p className="text-sm text-gray-500">Pause notifications during specific times</p>
                </div>
                <ToggleSwitch
                  checked={watchedDoNotDisturb}
                  onChange={(checked) => setValue('doNotDisturb', checked)}
                />
              </div>
              
              {watchedDoNotDisturb && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center space-x-4 pt-4"
                >
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      {...register('doNotDisturbStart')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <span className="text-gray-500">to</span>
                  
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      {...register('doNotDisturbEnd')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (for SMS notifications)
              </label>
              <input
                type="tel"
                {...register('phoneNumber')}
                placeholder="+256 700 000 000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                Required for SMS notifications
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}
