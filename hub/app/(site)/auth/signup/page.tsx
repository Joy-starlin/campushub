'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { UserPlus, ArrowRight } from 'lucide-react'
import ResponsiveContainer from '../../../components/ResponsiveContainer'
import SignupModal from '../../../components/SignupModal'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const { signInWithGoogle, user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialStep, setInitialStep] = useState<1 | 2 | 3 | 4>(1)

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle()
      // The user state will be updated by AuthContext.
      // We check if the user needs to complete their profile or pay.
    } catch (error) {
      toast.error('Google signup failed')
    }
  }

  // Effect to handle modal opening after Google login
  useEffect(() => {
    if (user && !user.isVerified) {
      setInitialStep(2)
      setIsModalOpen(true)
    } else if (user && user.isVerified) {
      router.push('/feed')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <ResponsiveContainer maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <img 
                  src="/logo.png" 
                  alt="Bugema Hub Logo" 
                  className="h-16 w-auto mx-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Bugema Hub</h1>
              <p className="text-gray-600">Connect with your campus community</p>
              <p className="mt-2 text-xs font-bold text-bugema-blue uppercase tracking-wider">
                Mandatory semester membership fee applies to all new accounts
              </p>
            </div>

            {/* Signup Options */}
            <div className="max-w-xs mx-auto space-y-3">
              {/* Email Signup */}
              <button
                onClick={() => {
                  setInitialStep(1)
                  setIsModalOpen(true)
                }}
                className="w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors min-h-[40px] flex items-center justify-center"
              >
                Sign up with Email
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

              {/* Google Signup */}
              <button 
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center space-x-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors min-h-[40px] text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-sm">Continue with Google</span>
              </button>

              <SignupModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialStep={initialStep}
              />
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Connect</h3>
                <p className="text-sm text-gray-600">Join clubs and meet students</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Events</h3>
                <p className="text-sm text-gray-600">Discover campus activities</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Marketplace</h3>
                <p className="text-sm text-gray-600">Buy and sell with peers</p>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </ResponsiveContainer>
    </div>
  )
}



