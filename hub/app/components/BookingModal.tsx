'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Smartphone, CheckCircle, Download, Calendar, MapPin, QrCode } from 'lucide-react'
import { Event } from './EventCard'
import toast from 'react-hot-toast'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
}

type Step = 'summary' | 'payment' | 'confirmation'

export default function BookingModal({ isOpen, onClose, event }: BookingModalProps) {
  const [step, setStep] = useState<Step>('summary')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen || !event) return null

  const handleNext = () => {
    if (step === 'summary') setStep('payment')
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep('confirmation')
    toast.success('Payment successful!')
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BOOKING-${event.id}-${Date.now()}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {step === 'confirmation' ? 'Booking Confirmed!' : 'Event Booking'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {step === 'summary' && (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.isOnline ? 'Online' : event.location}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center text-sm mb-2 text-gray-600">
                      <span>Ticket Price</span>
                      <span>UGX {event.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2 text-gray-600">
                      <span>Service Fee</span>
                      <span>UGX 2,500</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center font-bold text-gray-900">
                      <span>Total</span>
                      <span>UGX {( (event.price || 0) + 2500).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-500 text-sm">Amount to Pay</p>
                    <p className="text-3xl font-black text-gray-900">
                      UGX {( (event.price || 0) + 2500).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod('momo')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'momo'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                          <Smartphone className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Mobile Money</p>
                          <p className="text-xs text-gray-500">MTN / Airtel</p>
                        </div>
                      </div>
                      {paymentMethod === 'momo' && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </button>

                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <CreditCard className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Credit / Debit Card</p>
                          <p className="text-xs text-gray-500">Visa / Mastercard</p>
                        </div>
                      </div>
                      {paymentMethod === 'card' && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !paymentMethod}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      `Pay UGX ${( (event.price || 0) + 2500).toLocaleString()}`
                    )}
                  </button>
                </div>
              )}

              {step === 'confirmation' && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">You're going!</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      A confirmation email with your ticket has been sent.
                    </p>
                  </div>

                  <div className="bg-white p-6 border-2 border-dashed border-gray-100 rounded-3xl inline-block mx-auto shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt="Booking QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Booking ID: BBU-{event.id.slice(0, 4)}-{Date.now().toString().slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-all">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button 
                      onClick={onClose}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/10"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
