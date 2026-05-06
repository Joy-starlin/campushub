export interface User {
  id: string
  name: string
  avatar?: string
  isVerified: boolean
}

export interface Location {
  address: string
  lat?: number
  lng?: number
}

export type VehicleType = 'car' | 'boda' | 'matatu' | 'bus'
export type RecurringType = 'one-time' | 'daily' | 'weekly'

export interface Ride {
  id: string
  type: 'offering' | 'requesting'
  driver?: User
  passenger?: User
  from: Location
  to: Location
  date: string
  departureTime: string
  seatsAvailable: number
  seatsTaken: number
  pricePerSeat: {
    UGX: number
    USD?: number
  }
  vehicleType: VehicleType
  recurring?: RecurringType
  contactMethod: 'whatsapp' | 'in-app'
  contactNumber?: string
  notes?: string
  isFlexible?: boolean
  maxPrice?: {
    UGX: number
    USD?: number
  }
  createdAt: string
}

export interface RideFilter {
  route?: string
  date?: string
  seatsNeeded?: number
  vehicleType?: VehicleType
  priceRange?: {
    min: number
    max: number
  }
}

export interface PopularRoute {
  from: string
  to: string
  count: number
}
