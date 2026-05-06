'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

/**
 * Protected Route component that handles authentication and role checking
 * Redirects to login if not authenticated
 * Redirects away from admin routes if not admin
 */
export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If not authenticated, redirect to login
    if (!user) {
      router.push(redirectTo)
      return
    }

    // If admin route and user is not admin, redirect to dashboard
    if (requireAdmin && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    // If first-time Google user, redirect to complete profile
    if (user.isProfileComplete === false) {
      router.push('/auth/complete-profile')
      return
    }
  }, [user, loading, router, requireAdmin, redirectTo])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!user || (requireAdmin && user.role !== 'admin') || user.isProfileComplete === false) {
    return null
  }

  return <>{children}</>
}

/**
 * Higher-order component for protecting admin routes
 */
export function withAdminProtection<P extends object>(Component: React.ComponentType<P>) {
  return function AdminProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Higher-order component for protecting regular routes
 */
export function withAuthProtection<P extends object>(Component: React.ComponentType<P>) {
  return function AuthProtectedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
