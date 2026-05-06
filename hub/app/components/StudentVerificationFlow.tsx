'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Upload, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Clock, 
  Shield, 
  FileText,
  Camera,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { VerificationRequest, VerificationMethod, VerificationStatus } from '../types/verification'
import toast from 'react-hot-toast'

interface StudentVerificationFlowProps {
  userId: string
  currentVerification?: VerificationRequest
  onEmailVerification: (email: string) => Promise<{ success: boolean; message?: string }>
  onIDUpload: (file: File) => Promise<{ success: boolean; message?: string; documentId?: string }>
  onOTPSubmit: (otp: string) => Promise<{ success: boolean; message?: string }>
  onResendOTP: () => Promise<{ success: boolean; message?: string }>
}

export default function StudentVerificationFlow({
  userId,
  currentVerification,
  onEmailVerification,
  onIDUpload,
  onOTPSubmit,
  onResendOTP
}: StudentVerificationFlowProps) {
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'id-upload' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResendOTP, setCanResendOTP] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<{ email: string }>()

  const watchedEmail = watch('email')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setUploadedFile(file)
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setFilePreview(reader.result as string)
          }
          reader.readAsDataURL(file)
        } else {
          setFilePreview(null)
        }
      }
    }
  })

  useEffect(() => {
    if (showOTPInput && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (otpTimer === 0 && showOTPInput) {
      setCanResendOTP(true)
    }
  }, [otpTimer, showOTPInput])

  const handleEmailVerification = async (data: { email: string }) => {
    setIsSubmitting(true)
    try {
      const result = await onEmailVerification(data.email)
      if (result.success) {
        setShowOTPInput(true)
        setOtpTimer(600) // 10 minutes
        setCanResendOTP(false)
        toast.success('Verification code sent to your email!')
      } else {
        toast.error(result.message || 'Failed to send verification code')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIDUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onIDUpload(uploadedFile)
      if (result.success) {
        toast.success('ID document uploaded successfully! You will be notified within 24-48 hours.')
        setVerificationMethod(null)
        setUploadedFile(null)
        setFilePreview(null)
      } else {
        toast.error(result.message || 'Failed to upload document')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOTPSubmit = async () => {
    const otp = otpCode.join('')
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onOTPSubmit(otp)
      if (result.success) {
        toast.success('Email verified successfully!')
        setShowOTPInput(false)
        setOtpCode(['', '', '', '', '', ''])
      } else {
        toast.error(result.message || 'Invalid verification code')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    setIsSubmitting(true)
    try {
      const result = await onResendOTP()
      if (result.success) {
        setOtpTimer(600)
        setCanResendOTP(false)
        toast.success('New verification code sent!')
      } else {
        toast.error(result.message || 'Failed to resend code')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otpCode]
      newOtp[index] = value
      setOtpCode(newOtp)
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
        nextInput?.focus()
      }
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    setFilePreview(null)
  }

  const isValidUniversityEmail = (email: string) => {
    const validDomains = ['bugema.ac.ug', 'bugema.edu', 'bugema university']
    return validDomains.some(domain => email.toLowerCase().includes(domain))
  }

  if (currentVerification?.status === 'pending') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verification Pending</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your verification is being reviewed
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200">
                {currentVerification.method === 'email' 
                  ? 'Your email verification is in progress. You will receive a confirmation once approved.'
                  : 'Your ID document is being reviewed by our team. This typically takes 24-48 hours.'}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-2">
                Submitted: {new Date(currentVerification.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentVerification?.status === 'rejected') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verification Rejected</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your verification request was not approved
            </p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="text-red-800 dark:text-red-200">
                Reason: {currentVerification.data.rejectionReason || 'Invalid information provided'}
              </p>
              <button
                onClick={() => setVerificationMethod(null)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!verificationMethod) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Verification</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Verify your student status to get exclusive benefits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setVerificationMethod('email')}
            className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Email Verification</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Instant verification using your university email address
            </p>
            <ul className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>• Enter your @bugema.ac.ug email</li>
              <li>• Receive 6-digit verification code</li>
              <li>• Instant verification upon confirmation</li>
            </ul>
          </button>

          <button
            onClick={() => setVerificationMethod('id-upload')}
            className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">ID Document Upload</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload your student ID for manual verification
            </p>
            <ul className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>• Upload photo of student ID</li>
              <li>• Reviewed within 24-48 hours</li>
              <li>• Manual verification by admin team</li>
            </ul>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            {verificationMethod === 'email' ? (
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {verificationMethod === 'email' ? 'Email Verification' : 'ID Document Upload'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {verificationMethod === 'email' 
                ? 'Verify using your university email address'
                : 'Upload your student ID for verification'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setVerificationMethod(null)
            setUploadedFile(null)
            setFilePreview(null)
            setShowOTPInput(false)
            setOtpCode(['', '', '', '', '', ''])
            reset()
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {verificationMethod === 'email' && !showOTPInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <form onSubmit={handleSubmit(handleEmailVerification)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  University Email Address *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    validate: (value) => isValidUniversityEmail(value) || 'Please enter a valid university email address'
                  })}
                  placeholder="name@bugema.ac.ug"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be a valid Bugema University email address
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      We'll send a 6-digit verification code to this email address.
                      The code will expire in 10 minutes for security reasons.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          </motion.div>
        )}

        {verificationMethod === 'email' && showOTPInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Enter Verification Code
                </label>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We sent a 6-digit code to {watchedEmail}
                </p>
                
                <div className="flex justify-center space-x-2 mb-6">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type={showPassword ? 'text' : 'password'}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                      maxLength={1}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
                    {showPassword ? 'Hide' : 'Show'} code
                  </button>
                  
                  {canResendOTP ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isSubmitting}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-1" />
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Resend in {formatTime(otpTimer)}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleOTPSubmit}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </motion.div>
        )}

        {verificationMethod === 'id-upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Student ID
                </label>
                
                {uploadedFile ? (
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeUploadedFile}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {filePreview && (
                      <div className="mb-4">
                        <img
                          src={filePreview}
                          alt="ID preview"
                          className="w-full max-h-64 object-contain rounded-lg"
                        />
                      </div>
                    )}

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        ✅ Document ready for upload
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isDragActive ? 'Drop the file here' : 'Drag & drop your student ID here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Supported formats: PNG, JPG, PDF (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      Your ID will be reviewed by our admin team within 24-48 hours.
                      Make sure the document is clear and shows your name, photo, and university details.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleIDUpload}
                disabled={!uploadedFile || isSubmitting}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : 'Upload for Verification'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
