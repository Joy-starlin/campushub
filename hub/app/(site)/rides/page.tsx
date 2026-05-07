'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Car, Users } from 'lucide-react'
import { Ride, RideFilter, PopularRoute } from '../../types/rides'
import RideCard from '../../components/RideCard'
import PostRideForm from '../../components/PostRideForm'
import RideFilterBar from '../../components/RideFilterBar'
import PopularRoutes from '../../components/PopularRoutes'
import SafetyNotice from '../../components/SafetyNotice'
import ResponsiveContainer from '../../components/ResponsiveContainer'
import ResponsiveGrid from '../../components/ResponsiveGrid'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import SignupModal from '../../components/SignupModal'

// Mock data
const mockRides: Ride[] = [
  {
    id: '1',
    type: 'offering',
    driver: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      isVerified: true
    },
    from: { address: 'Bugema University Main Gate' },
    to: { address: 'Kampala City Center' },
    date: '2026-04-25',
    departureTime: '08:00',
    seatsAvailable: 3,
    seatsTaken: 1,
    pricePerSeat: { UGX: 15000, USD: 4 },
    vehicleType: 'car',
    recurring: 'daily',
    contactMethod: 'whatsapp',
    contactNumber: '+256 700 123456',
    notes: 'Meet at main gate, no smoking, air conditioning available',
    createdAt: '2026-04-23T10:00:00Z'
  },
  {
    id: '2',
    type: 'requesting',
    passenger: {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      isVerified: true
    },
    from: { address: 'Kampala - Nakawa' },
    to: { address: 'Bugema University' },
    date: '2026-04-25',
    departureTime: '17:30',
    seatsAvailable: 0,
    seatsTaken: 0,
    pricePerSeat: { UGX: 0 },
    vehicleType: 'car',
    contactMethod: 'whatsapp',
    isFlexible: true,
    notes: 'Need space for one small bag, flexible with time',
    createdAt: '2026-04-23T11:00:00Z'
  },
  {
    id: '3',
    type: 'offering',
    driver: {
      id: '3',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isVerified: false
    },
    from: { address: 'Bugema University' },
    to: { address: 'Entebbe Airport' },
    date: '2026-04-26',
    departureTime: '06:00',
    seatsAvailable: 2,
    seatsTaken: 2,
    pricePerSeat: { UGX: 25000, USD: 7 },
    vehicleType: 'boda',
    contactMethod: 'in-app',
    notes: 'Early morning ride, experienced rider, helmet provided',
    createdAt: '2026-04-23T12:00:00Z'
  }
]

const mockPopularRoutes: PopularRoute[] = [
  { from: 'Bugema', to: 'Kampala', count: 45 },
  { from: 'Kampala', to: 'Bugema', count: 38 },
  { from: 'Bugema', to: 'Entebbe', count: 22 },
  { from: 'Bugema', to: 'Mukono', count: 18 }
]

export default function RidesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'offering' | 'requesting'>('offering')
  const [showPostForm, setShowPostForm] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [initialStep, setInitialStep] = useState<1 | 2 | 3 | 4>(2)
  const [rides, setRides] = useState<Ride[]>(mockRides)
  const [filter, setFilter] = useState<RideFilter>({})

  // Filter rides based on active tab and filters
  const filteredRides = rides.filter(ride => {
    // Filter by tab
    if (ride.type !== activeTab) return false

    // Filter by route
    if (filter.route) {
      const routeLower = filter.route.toLowerCase()
      if (!ride.from.address.toLowerCase().includes(routeLower) && 
          !ride.to.address.toLowerCase().includes(routeLower)) {
        return false
      }
    }

    // Filter by date
    if (filter.date && ride.date !== filter.date) {
      return false
    }

    // Filter by seats
    if (filter.seatsNeeded && ride.type === 'offering') {
      if (ride.seatsAvailable < filter.seatsNeeded) {
        return false
      }
    }

    // Filter by vehicle type
    if (filter.vehicleType && ride.vehicleType !== filter.vehicleType) {
      return false
    }

    // Filter by price range
    if (filter.priceRange) {
      const price = ride.type === 'offering' ? ride.pricePerSeat.UGX : ride.maxPrice?.UGX
      if (price) {
        if (filter.priceRange.min && price < filter.priceRange.min) {
          return false
        }
        if (filter.priceRange.max && price > filter.priceRange.max) {
          return false
        }
      }
    }

    return true
  })

  const handleRequestSeat = (rideId: string) => {
    toast.success('Seat request sent! The driver will contact you soon.')
    // In a real app, this would send a request to the backend
  }

  const handlePostButtonClick = () => {
    if (!user) {
      toast.error('Please sign in to post a ride')
      return
    }
    if (!user.isVerified) {
      toast.error('Membership payment required to post rides')
      setInitialStep(2)
      setShowSignupModal(true)
      return
    }
    setShowPostForm(true)
  }

  const handlePostRide = (data: any) => {
    // In a real app, this would save to the backend
    const newRide: Ride = {
      id: Date.now().toString(),
      type: activeTab,
      from: { address: data.from },
      to: { address: data.to },
      date: data.date,
      departureTime: data.departureTime,
      seatsAvailable: activeTab === 'offering' ? data.seatsAvailable : 0,
      seatsTaken: 0,
      pricePerSeat: activeTab === 'offering' ? { UGX: data.pricePerSeatUGX } : { UGX: 0 },
      maxPrice: activeTab === 'requesting' ? { UGX: data.maxPriceUGX } : undefined,
      vehicleType: activeTab === 'offering' ? data.vehicleType : 'car',
      recurring: activeTab === 'offering' ? data.recurring : undefined,
      contactMethod: activeTab === 'offering' ? data.contactMethod : 'in-app',
      contactNumber: activeTab === 'offering' ? data.contactNumber : undefined,
      notes: data.notes,
      isFlexible: activeTab === 'requesting' ? data.isFlexible : false,
      createdAt: new Date().toISOString()
    }

    if (activeTab === 'requesting') {
      newRide.passenger = {
        id: 'current-user',
        name: 'You',
        isVerified: true
      }
    } else {
      newRide.driver = {
        id: 'current-user',
        name: 'You',
        isVerified: true
      }
    }

    setRides([newRide, ...rides])
    setShowPostForm(false)
    toast.success(`${activeTab === 'offering' ? 'Ride' : 'Request'} posted successfully!`)
  }

  const handleRouteSelect = (from: string, to: string) => {
    setFilter({ route: to })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ResponsiveContainer>
        <div className="py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Ride Sharing
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Share rides with fellow students and save on transportation costs
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('offering')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'offering'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4" />
                    <span>Offering a Ride</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('requesting')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'requesting'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Need a Ride</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Post Ride Button */}
          <div className="mb-6">
            <button
              onClick={handlePostButtonClick}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Post {activeTab === 'offering' ? 'Ride' : 'Request'}</span>
            </button>
          </div>

          {/* Safety Notice */}
          <SafetyNotice />

          {/* Popular Routes */}
          <PopularRoutes 
            routes={mockPopularRoutes}
            onRouteSelect={handleRouteSelect}
          />

          {/* Filter Bar */}
          <RideFilterBar 
            filter={filter}
            onFilterChange={setFilter}
          />

          {/* Post Form Modal */}
          <AnimatePresence>
            {showPostForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowPostForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PostRideForm
                    mode={activeTab}
                    onSubmit={handlePostRide}
                    onCancel={() => setShowPostForm(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signup/Payment Modal for Unverified Users */}
          <SignupModal 
            isOpen={showSignupModal} 
            onClose={() => setShowSignupModal(false)} 
            initialStep={initialStep}
          />

          {/* Results Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {filteredRides.length} {activeTab === 'offering' ? 'Rides Available' : 'Ride Requests'}
            </h2>
          </div>

          {/* Ride Cards */}
          {filteredRides.length > 0 ? (
            <ResponsiveGrid 
              cols={{ base: 1, lg: 2 }}
              gap={{ base: 4, lg: 6 }}
            >
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onRequestSeat={handleRequestSeat}
                />
              ))}
            </ResponsiveGrid>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'offering' ? (
                  <Car className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {activeTab === 'offering' ? 'rides' : 'requests'} found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your filters or be the first to {activeTab === 'offering' ? 'offer a ride' : 'request a ride'}.
              </p>
              <button
                onClick={handlePostButtonClick}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Post {activeTab === 'offering' ? 'Ride' : 'Request'}</span>
              </button>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  )
}



