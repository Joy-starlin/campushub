'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Plus, 
  Search,
  Users,
  Building,
  GraduationCap,
  Star,
  Mail
} from 'lucide-react'
import { Job, User, JobApplicationForm, JobAlert } from '../types/jobs'
import JobBrowsePage from '../components/JobBrowsePage'
import JobDetailPage from '../components/JobDetailPage'
import PostJobForm from '../components/PostJobForm'
import ResponsiveContainer from '../components/ResponsiveContainer'
import toast from 'react-hot-toast'

// Mock data
const mockCurrentUser: User = {
  id: 'current-user',
  name: 'Alex Johnson',
  email: 'alex@bugema.edu',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  university: 'Bugema University',
  graduationYear: 2023,
  isAlumni: false,
  isVerifiedEmployer: false
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    companyId: '1',
    company: {
      id: '1',
      name: 'TechCorp Africa',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      website: 'https://techcorp.africa',
      industry: 'tech',
      size: 'medium',
      description: 'Leading technology company in East Africa',
      location: 'Nairobi, Kenya',
      isVerified: true
    },
    location: {
      city: 'Nairobi',
      country: 'Kenya',
      isRemote: false,
      workMode: 'hybrid'
    },
    type: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD',
      isHidden: false
    },
    description: '<p>We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing scalable web applications and mentoring junior developers.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Design and develop high-quality software solutions</li><li>Mentor junior team members</li><li>Collaborate with cross-functional teams</li></ul>',
    requirements: [
      '5+ years of experience in software development',
      'Strong proficiency in JavaScript/TypeScript',
      'Experience with React and Node.js',
      'Bachelor\'s degree in Computer Science or related field'
    ],
    benefits: [
      'Competitive salary and benefits package',
      'Flexible work arrangements',
      'Professional development opportunities',
      'Health insurance coverage'
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'MongoDB'],
    postedAt: '2024-04-20T10:00:00Z',
    applicationDeadline: '2024-05-15T23:59:59Z',
    applicationMethod: 'in-platform',
    targetUniversities: [],
    isUniversityExclusive: false,
    isFeatured: true,
    isActive: true,
    viewCount: 245,
    applicationCount: 18,
    savedBy: []
  },
  {
    id: '2',
    title: 'Marketing Intern',
    companyId: '2',
    company: {
      id: '2',
      name: 'Bugema Alumni Network',
      logo: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=100&h=100&fit=crop',
      website: 'https://bugemaalumni.org',
      industry: 'education',
      size: 'small',
      description: 'Connecting Bugema University graduates worldwide',
      location: 'Kampala, Uganda',
      isVerified: true
    },
    location: {
      city: 'Kampala',
      country: 'Uganda',
      isRemote: true,
      workMode: 'remote'
    },
    type: 'internship',
    experienceLevel: 'entry',
    salary: {
      currency: 'UGX',
      isHidden: true
    },
    description: '<p>Join our team as a Marketing Intern and help us grow the Bugema Alumni Network. This is a great opportunity to gain hands-on experience in digital marketing and community building.</p>',
    requirements: [
      'Currently enrolled in or recent graduate of a university',
      'Strong communication skills',
      'Experience with social media platforms',
      'Creative thinking and problem-solving skills'
    ],
    benefits: [
      'Flexible working hours',
      'Certificate of completion',
      'Networking opportunities',
      'Potential for full-time employment'
    ],
    skills: ['Social Media', 'Content Creation', 'Email Marketing', 'Analytics'],
    postedAt: '2024-04-22T09:00:00Z',
    applicationDeadline: '2024-04-30T23:59:59Z',
    applicationMethod: 'in-platform',
    targetUniversities: ['Bugema University'],
    isUniversityExclusive: true,
    isFeatured: false,
    isActive: true,
    viewCount: 89,
    applicationCount: 12,
    savedBy: []
  },
  {
    id: '3',
    title: 'Financial Analyst',
    companyId: '3',
    company: {
      id: '3',
      name: 'East Africa Finance Ltd',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      website: 'https://eafinance.com',
      industry: 'finance',
      size: 'large',
      description: 'Leading financial services provider in East Africa',
      location: 'Dar es Salaam, Tanzania',
      isVerified: true
    },
    location: {
      city: 'Dar es Salaam',
      country: 'Tanzania',
      isRemote: false,
      workMode: 'onsite'
    },
    type: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 50000,
      max: 70000,
      currency: 'USD',
      isHidden: false
    },
    description: '<p>We are seeking a detail-oriented Financial Analyst to join our finance team. You will be responsible for financial planning, analysis, and reporting.</p>',
    requirements: [
      '3+ years of experience in financial analysis',
      'Strong analytical and problem-solving skills',
      'Proficiency in financial modeling and Excel',
      'Bachelor\'s degree in Finance, Accounting, or related field'
    ],
    benefits: [
      'Competitive compensation package',
      'Performance bonuses',
      'Health and life insurance',
      'Retirement savings plan'
    ],
    skills: ['Financial Analysis', 'Excel', 'Financial Modeling', 'Reporting', 'Accounting'],
    postedAt: '2024-04-18T14:00:00Z',
    applicationDeadline: '2024-05-10T23:59:59Z',
    applicationMethod: 'external',
    externalApplicationUrl: 'https://eafinance.com/careers/financial-analyst',
    targetUniversities: [],
    isUniversityExclusive: false,
    isFeatured: false,
    isActive: true,
    viewCount: 156,
    applicationCount: 23,
    savedBy: []
  }
]

// Add more mock jobs for demonstration
const additionalJobs = Array.from({ length: 12 }, (_, i) => ({
  id: `job-${i + 4}`,
  title: `Job Position ${i + 4}`,
  companyId: `company-${i + 4}`,
  company: {
    id: `company-${i + 4}`,
    name: `Company ${i + 4}`,
    industry: ['tech', 'finance', 'healthcare', 'education', 'ngo'][i % 5] as any,
    size: ['startup', 'small', 'medium', 'large'][i % 4] as any,
    location: ['Kampala, Uganda', 'Nairobi, Kenya', 'Dar es Salaam, Tanzania'][i % 3],
    isVerified: Math.random() > 0.3
  },
  location: {
    city: ['Kampala', 'Nairobi', 'Dar es Salaam', 'Remote'][i % 4],
    country: ['Uganda', 'Kenya', 'Tanzania'][i % 3],
    isRemote: i % 4 === 3,
    workMode: ['remote', 'hybrid', 'onsite'][i % 3] as any
  },
  type: ['full-time', 'part-time', 'internship', 'contract'][i % 4] as any,
  experienceLevel: ['entry', 'mid', 'senior', 'no-experience'][i % 4] as any,
  salary: Math.random() > 0.5 ? {
    min: Math.floor(Math.random() * 50000) + 30000,
    max: Math.floor(Math.random() * 50000) + 80000,
    currency: 'USD',
    isHidden: false
  } : {
    currency: 'USD',
    isHidden: true
  },
  description: `<p>Job description for position ${i + 4}</p>`,
  requirements: [`Requirement ${i + 4}-1`, `Requirement ${i + 4}-2`],
  benefits: [`Benefit ${i + 4}-1`, `Benefit ${i + 4}-2`],
  skills: [`Skill ${i + 4}-1`, `Skill ${i + 4}-2`],
  postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  applicationDeadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  applicationMethod: Math.random() > 0.5 ? 'in-platform' : 'external' as any,
  targetUniversities: Math.random() > 0.7 ? ['Bugema University'] : [],
  isUniversityExclusive: Math.random() > 0.8,
  isFeatured: Math.random() > 0.9,
  isActive: true,
  viewCount: Math.floor(Math.random() * 500) + 50,
  applicationCount: Math.floor(Math.random() * 50) + 5,
  savedBy: []
} as Job))

const allJobs = [...mockJobs, ...additionalJobs]

export default function JobsPage() {
  const [currentView, setCurrentView] = useState<'browse' | 'detail' | 'post'>('browse')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [showPostForm, setShowPostForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get similar jobs for detail view
  const getSimilarJobs = (job: Job): Job[] => {
    return allJobs
      .filter(j => j.id !== job.id && (
        j.company.industry === job.company.industry ||
        j.type === job.type ||
        j.location.workMode === job.location.workMode
      ))
      .slice(0, 3)
  }

  const handleJobSave = (jobId: string) => {
    setSavedJobs(prev => {
      if (prev.includes(jobId)) {
        toast.success('Job removed from saved jobs')
        return prev.filter(id => id !== jobId)
      } else {
        toast.success('Job saved successfully')
        return [...prev, jobId]
      }
    })
  }

  const handleJobApply = (job: Job) => {
    if (job.applicationMethod === 'external' && job.externalApplicationUrl) {
      window.open(job.externalApplicationUrl, '_blank')
    } else {
      setSelectedJob(job)
      setCurrentView('detail')
    }
  }

  const handleJobView = (job: Job) => {
    setSelectedJob(job)
    setCurrentView('detail')
  }

  const handleJobShare = (job: Job) => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this opportunity at ${job.company.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Job link copied to clipboard!')
    }
  }

  const handleApplicationSubmit = async (applicationData: JobApplicationForm) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Application submitted successfully!')
      setCurrentView('browse')
    } catch (error) {
      toast.error('Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePostJob = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Job posted successfully!')
      setShowPostForm(false)
      setCurrentView('browse')
    } catch (error) {
      toast.error('Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canPostJob = mockCurrentUser.isAlumni || mockCurrentUser.isVerifiedEmployer

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Jobs & Internships
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Find opportunities from top companies
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {canPostJob && (
                <button
                  type="button"
                  onClick={() => setShowPostForm(true)}
                  className="inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </button>
              )}
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Content */}
      {currentView === 'browse' && (
        <JobBrowsePage
          jobs={allJobs}
          onJobSave={handleJobSave}
          onJobApply={handleJobApply}
          onJobView={handleJobView}
          savedJobs={savedJobs}
        />
      )}

      {currentView === 'detail' && selectedJob && (
        <JobDetailPage
          job={selectedJob}
          similarJobs={getSimilarJobs(selectedJob)}
          onSave={handleJobSave}
          onApply={handleApplicationSubmit}
          onShare={handleJobShare}
          isSaved={savedJobs.includes(selectedJob.id)}
        />
      )}

      {/* Post Job Modal */}
      {showPostForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowPostForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PostJobForm
              onSubmit={handlePostJob}
              onCancel={() => setShowPostForm(false)}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Alumni Spotlight Sidebar */}
      {currentView === 'browse' && (
        <div className="fixed right-4 top-24 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hidden xl:block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Alumni Spotlight
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                  alt="Alumni"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Sarah Chen</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">CEO at TechCorp</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Class of 2018</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop"
                  alt="Alumni"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Michael Okonkwo</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">CTO at StartupHub</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Class of 2019</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                  alt="Alumni"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Emily Rodriguez</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Director at NGO Africa</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Class of 2017</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              Are you a Bugema graduate hiring?
            </p>
            <button
              type="button"
              onClick={() => setShowPostForm(true)}
              className="w-full min-h-9 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Post Opportunities
            </button>
          </div>
        </div>
      )}

      {/* Job Alert Banner */}
      {currentView === 'browse' && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Get Job Alerts
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Receive matching jobs in your inbox
                </p>
              </div>
            </div>
            <button
              type="button"
              className="min-h-8 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Set Up
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
