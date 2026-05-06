'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  Crown, 
  CheckCircle, 
  X, 
  CreditCard, 
  Calendar, 
  Zap, 
  Shield, 
  Gift,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  Download,
  Settings,
  Sparkles,
  Gem
} from 'lucide-react'
import { PremiumMembership, BadgeType } from '../types/verification'
import { DEFAULT_VERIFICATION_SETTINGS } from '../types/verification'
import toast from 'react-hot-toast'

interface PremiumMembershipSystemProps {
  currentMembership?: PremiumMembership
  availablePlans?: typeof DEFAULT_VERIFICATION_SETTINGS.premiumPlans
  onSubscribe: (planId: string, paymentMethod: string) => Promise<void>
  onCancel: () => Promise<void>
  onUpdatePlan: (newPlanId: string) => Promise<void>
  onToggleAutoRenew: (enabled: boolean) => Promise<void>
}

export default function PremiumMembershipSystem({
  currentMembership,
  availablePlans = DEFAULT_VERIFICATION_SETTINGS.premiumPlans,
  onSubscribe,
  onCancel,
  onUpdatePlan,
  onToggleAutoRenew
}: PremiumMembershipSystemProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleSubscribe = async () => {
    if (!selectedPlan || !paymentMethod) {
      toast.error('Please select a plan and payment method')
      return
    }

    setIsProcessing(true)
    try {
      await onSubscribe(selectedPlan, paymentMethod)
      toast.success('Premium subscription activated!')
      setShowPaymentModal(false)
      setSelectedPlan(null)
    } catch (error) {
      toast.error('Failed to process subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    setIsProcessing(true)
    try {
      await onCancel()
      toast.success('Subscription cancelled')
      setShowCancelConfirm(false)
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlanUpdate = async (newPlanId: string) => {
    setIsProcessing(true)
    try {
      await onUpdatePlan(newPlanId)
      toast.success('Plan updated successfully!')
    } catch (error) {
      toast.error('Failed to update plan')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAutoRenewToggle = async (enabled: boolean) => {
    setIsProcessing(true)
    try {
      await onToggleAutoRenew(enabled)
      toast.success(`Auto-renew ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update auto-renew settings')
    } finally {
      setIsProcessing(false)
    }
  }

  const getDaysRemaining = () => {
    if (!currentMembership) return 0
    const now = new Date()
    const expiry = new Date(currentMembership.expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive'
  }

  const premiumFeatures = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Ad-Free Experience',
      description: 'Enjoy Bugema Hub without any advertisements'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Custom Profile Themes',
      description: 'Personalize your profile with premium themes and colors'
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Priority Support',
      description: 'Get faster response times from our support team'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Advanced Analytics',
      description: 'Access detailed analytics for your posts and engagement'
    },
    {
      icon: <Gem className="w-5 h-5" />,
      title: 'Exclusive Content',
      description: 'Unlock premium articles, resources, and tutorials'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Early Access',
      description: 'Be the first to try new features and updates'
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'Unlimited Downloads',
      description: 'Download resources without any restrictions'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Enhanced Privacy',
      description: 'Additional privacy controls and data protection'
    }
  ]

  if (currentMembership?.isActive) {
    return (
      <div className="space-y-6">
        {/* Current Membership Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Membership</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentMembership.planName} • {getStatusText(currentMembership.isActive)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={`text-sm font-medium ${getStatusColor(currentMembership.isActive)}`}>
                {getStatusText(currentMembership.isActive)}
              </span>
            </div>
          </div>

          {/* Membership Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Plan</div>
              <div className="font-medium text-gray-900 dark:text-white">{currentMembership.planName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Monthly Price</div>
              <div className="font-medium text-gray-900 dark:text-white">
                ${availablePlans.find(p => p.id === currentMembership.planId)?.price || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Days Remaining</div>
              <div className="font-medium text-gray-900 dark:text-white">{getDaysRemaining()} days</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Auto-Renew</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {currentMembership.autoRenew ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          {/* Auto-Renew Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Auto-Renew</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatically renew your subscription to avoid interruptions
              </p>
            </div>
            <button
              onClick={() => handleAutoRenewToggle(!currentMembership.autoRenew)}
              disabled={isProcessing}
              className={`w-12 h-6 rounded-full transition-colors ${
                currentMembership.autoRenew ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
              } disabled:opacity-50`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  currentMembership.autoRenew ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedPlan(currentMembership.planId)}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Change Plan
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Premium Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-orange-600 dark:text-orange-400">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Change Modal */}
        {selectedPlan && selectedPlan !== currentMembership.planId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Premium Plan
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {availablePlans.find(p => p.id === selectedPlan)?.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ${availablePlans.find(p => p.id === selectedPlan)?.price}/month
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePlanUpdate(selectedPlan)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Updating...' : 'Update Plan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cancel Premium Subscription?
              </h3>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to cancel your Premium subscription? You'll continue to have access until {new Date(currentMembership.expiresAt).toLocaleDateString()}.
                </p>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    You can always reactivate your subscription later.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Premium Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Unlock exclusive features and support Bugema Hub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                {plan.id === 'pro' && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
                    POPULAR
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-300">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Premium Features Showcase */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Premium Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="text-orange-600 dark:text-orange-400">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe Button */}
        <button
          onClick={() => setShowPaymentModal(true)}
          disabled={!selectedPlan}
          className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Subscription</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {availablePlans.find(p => p.id === selectedPlan)?.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Monthly price</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${availablePlans.find(p => p.id === selectedPlan)?.price}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500"
                    />
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-gray-900 dark:text-white">PayPal</span>
                  </label>
                </div>
              </div>

              {/* Terms */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  By subscribing, you agree to our Terms of Service and Privacy Policy. 
                  Your subscription will automatically renew each month unless cancelled.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
