'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Library,
  TrendingUp
} from 'lucide-react'
import { Resource, ResourceFilter, ResourceSort, ResourceCategory, User, UploadFormData } from '../types/resources'
import ResourceCategories from '../components/ResourceCategories'
import ResourceCard from '../components/ResourceCard'
import ResourceSearchFilter from '../components/ResourceSearchFilter'
import UploadResourceForm from '../components/UploadResourceForm'
import ResponsiveContainer from '../components/ResponsiveContainer'
import ResponsiveGrid from '../components/ResponsiveGrid'
import { ResponsiveButton } from '../components/ResponsiveForm'
import toast from 'react-hot-toast'

// Mock data
const mockCurrentUser: User = {
  id: 'current-user',
  name: 'Alex Johnson',
  email: 'alex@bugema.edu',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  university: 'Bugema University',
  role: 'student',
  isVerified: true
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Fall 2026 Academic Calendar',
    description: 'Complete academic calendar for the Fall 2026 semester including important dates, holidays, and examination periods.',
    category: 'timetables',
    university: 'Bugema University',
    fileType: 'pdf',
    fileSize: 2048576,
    fileUrl: '/files/academic-calendar-fall-2026.pdf',
    cloudinaryPublicId: 'resources/academic-calendar-fall-2026',
    uploader: {
      id: 'admin-1',
      name: 'Admin Office',
      email: 'admin@bugema.edu',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      university: 'Bugema University',
      role: 'admin',
      isVerified: true
    },
    uploadDate: '2026-04-20T10:00:00Z',
    visibility: 'public',
    tags: ['academic', 'calendar', 'fall-2026', 'holidays'],
    downloadCount: 342,
    averageRating: 4.5,
    ratingCount: 28,
    version: '1.0',
    isPopular: true,
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Student Registration Form 2026',
    description: 'Official student registration form for the 2026 academic year. Please fill out all required fields.',
    category: 'forms',
    university: 'Bugema University',
    fileType: 'pdf',
    fileSize: 1024000,
    fileUrl: '/files/registration-form-2026.pdf',
    cloudinaryPublicId: 'resources/registration-form-2026',
    uploader: {
      id: 'admin-1',
      name: 'Admin Office',
      email: 'admin@bugema.edu',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      university: 'Bugema University',
      role: 'admin',
      isVerified: true
    },
    uploadDate: '2026-04-18T14:30:00Z',
    visibility: 'public',
    tags: ['registration', 'form', '2026', 'student'],
    downloadCount: 567,
    averageRating: 4.2,
    ratingCount: 45,
    version: '2.1',
    isPopular: true,
    isBookmarked: true
  },
  {
    id: '3',
    title: 'Introduction to Computer Science Notes',
    description: 'Comprehensive lecture notes for CSC 101 Introduction to Computer Science course. Includes all topics covered in the first semester.',
    category: 'study-materials',
    university: 'Bugema University',
    fileType: 'pdf',
    fileSize: 5120000,
    fileUrl: '/files/csc101-notes.pdf',
    cloudinaryPublicId: 'resources/csc101-notes',
    uploader: {
      id: 'prof-1',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@bugema.edu',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      university: 'Bugema University',
      role: 'club-leader',
      isVerified: true
    },
    uploadDate: '2026-04-15T09:15:00Z',
    visibility: 'public',
    tags: ['computer-science', 'csc101', 'lecture-notes', 'programming'],
    downloadCount: 189,
    averageRating: 4.8,
    ratingCount: 12,
    version: '3.0',
    isPopular: false,
    isBookmarked: false
  },
  {
    id: '4',
    title: 'Past Exam Papers - Mathematics 201',
    description: 'Collection of past examination papers for MATH 201 course with solutions and marking schemes.',
    category: 'exam-papers',
    university: 'Makerere University',
    fileType: 'pdf',
    fileSize: 3072000,
    fileUrl: '/files/math201-past-papers.pdf',
    cloudinaryPublicId: 'resources/math201-past-papers',
    uploader: {
      id: 'dept-1',
      name: 'Mathematics Department',
      email: 'math@makerere.ac.ug',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      university: 'Makerere University',
      role: 'admin',
      isVerified: true
    },
    uploadDate: '2026-04-12T16:45:00Z',
    visibility: 'public',
    tags: ['mathematics', 'exam-papers', 'past-papers', 'solutions'],
    downloadCount: 423,
    averageRating: 4.6,
    ratingCount: 34,
    version: '1.5',
    isPopular: true,
    isBookmarked: false
  },
  {
    id: '5',
    title: 'Computer Science Club Constitution',
    description: 'Official constitution and bylaws of the Bugema University Computer Science Club.',
    category: 'club-constitutions',
    university: 'Bugema University',
    fileType: 'docx',
    fileSize: 512000,
    fileUrl: '/files/cs-club-constitution.docx',
    cloudinaryPublicId: 'resources/cs-club-constitution',
    uploader: {
      id: 'club-1',
      name: 'CS Club President',
      email: 'csclub@bugema.edu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      university: 'Bugema University',
      role: 'club-leader',
      isVerified: true
    },
    uploadDate: '2026-04-10T11:20:00Z',
    visibility: 'university-only',
    tags: ['club', 'constitution', 'computer-science', 'bylaws'],
    downloadCount: 87,
    averageRating: 4.0,
    ratingCount: 8,
    version: '2.0',
    isPopular: false,
    isBookmarked: false
  }
]

// Add more mock resources for demonstration
const additionalResources = Array.from({ length: 15 }, (_, i) => ({
  id: `resource-${i + 6}`,
  title: `Resource ${i + 6}`,
  description: `Description for resource ${i + 6}`,
  category: ['timetables', 'forms', 'study-materials', 'exam-papers', 'club-constitutions', 'event-programs', 'campus-maps', 'student-handbooks', 'job-templates', 'scholarship-info'][i % 10] as ResourceCategory,
  university: ['Bugema University', 'Makerere University', 'University of Nairobi'][i % 3],
  fileType: ['pdf', 'docx', 'xlsx'][i % 3] as 'pdf' | 'docx' | 'xlsx',
  fileSize: Math.floor(Math.random() * 5000000) + 500000,
  fileUrl: `/files/resource-${i + 6}.pdf`,
  cloudinaryPublicId: `resources/resource-${i + 6}`,
  uploader: mockCurrentUser,
  uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  visibility: 'public' as const,
  tags: [`tag${i}`, `category${i % 5}`],
  downloadCount: Math.floor(Math.random() * 500) + 10,
  averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
  ratingCount: Math.floor(Math.random() * 50) + 1,
  version: '1.0',
  isPopular: Math.random() > 0.8,
  isBookmarked: Math.random() > 0.7
}))

const allResources = [...mockResources, ...additionalResources]

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(allResources)
  const [filteredResources, setFilteredResources] = useState<Resource[]>(allResources)
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [filter, setFilter] = useState<ResourceFilter>({})
  const [sort, setSort] = useState<ResourceSort>({ by: 'most-downloaded', order: 'desc' })

  // Calculate resource counts by category
  const resourceCounts = resources.reduce((acc, resource) => {
    acc[resource.category] = (acc[resource.category] || 0) + 1
    return acc
  }, {} as Record<ResourceCategory, number>)

  // Filter and sort resources
  useEffect(() => {
    let filtered = resources

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category === selectedCategory)
    }

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply other filters
    if (filter.category) {
      filtered = filtered.filter(resource => resource.category === filter.category)
    }

    if (filter.university) {
      filtered = filtered.filter(resource => resource.university === filter.university)
    }

    if (filter.fileType) {
      filtered = filtered.filter(resource => resource.fileType === filter.fileType)
    }

    if (filter.dateRange) {
      const startDate = new Date(filter.dateRange.start)
      const endDate = new Date(filter.dateRange.end)
      filtered = filtered.filter(resource => {
        const uploadDate = new Date(resource.uploadDate)
        return uploadDate >= startDate && uploadDate <= endDate
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort.by) {
        case 'most-downloaded':
          return b.downloadCount - a.downloadCount
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        case 'highest-rated':
          return b.averageRating - a.averageRating
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredResources(filtered)
  }, [resources, selectedCategory, filter, sort])

  const handleCategorySelect = (category: ResourceCategory | null) => {
    setSelectedCategory(category)
    setFilter({ ...filter, category: category || undefined })
  }

  const handleFilterChange = (newFilter: ResourceFilter) => {
    setFilter(newFilter)
  }

  const handleSortChange = (newSort: ResourceSort) => {
    setSort(newSort)
  }

  const handleDownload = async (resourceId: string) => {
    // Simulate download
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      // Update download count
      setResources(resources.map(r =>
        r.id === resourceId
          ? { ...r, downloadCount: r.downloadCount + 1 }
          : r
      ))
      
      // In a real app, this would trigger actual file download
      console.log('Downloading:', resource.title)
    }
  }

  const handlePreview = (resource: Resource) => {
    // Open PDF in new tab
    if (resource.fileType === 'pdf') {
      window.open(resource.fileUrl, '_blank')
    } else {
      toast.error('Preview is only available for PDF files')
    }
  }

  const handleBookmark = (resourceId: string) => {
    setResources(resources.map(r =>
      r.id === resourceId
        ? { ...r, isBookmarked: !r.isBookmarked }
        : r
    ))
  }

  const handleRate = (resourceId: string, rating: number) => {
    // In a real app, this would save to backend
    console.log('Rating:', resourceId, rating)
    toast.success('Thank you for rating!')
  }

  const handleUpload = async (data: UploadFormData) => {
    setIsUploading(true)
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would upload to Cloudinary
      const newResource: Resource = {
        id: `resource-${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        university: data.university,
        fileType: data.file.name.endsWith('.pdf') ? 'pdf' : 'docx',
        fileSize: data.file.size,
        fileUrl: `/files/${data.file.name}`,
        cloudinaryPublicId: `resources/${data.file.name}`,
        uploader: mockCurrentUser,
        uploadDate: new Date().toISOString(),
        visibility: data.visibility,
        tags: data.tags,
        downloadCount: 0,
        averageRating: 0,
        ratingCount: 0,
        version: data.version,
        isPopular: false,
        isBookmarked: false
      }
      
      setResources([newResource, ...resources])
      setShowUploadForm(false)
      toast.success('Resource uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload resource')
    } finally {
      setIsUploading(false)
    }
  }

  const canUpload = mockCurrentUser.role === 'admin' || mockCurrentUser.role === 'club-leader'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ResponsiveContainer>
        <div className="py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Resource Library
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Access university resources, study materials, and more
                </p>
              </div>
            </div>
            
            {canUpload && (
              <ResponsiveButton
                variant="primary"
                onClick={() => setShowUploadForm(true)}
                className="min-h-11"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Resource
              </ResponsiveButton>
            )}
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <ResourceCategories
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              resourceCounts={resourceCounts}
            />
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <ResourceSearchFilter
              filter={filter}
              sort={sort}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              totalCount={resources.length}
              filteredCount={filteredResources.length}
            />
          </motion.div>

          {/* Resources Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {filteredResources.length > 0 ? (
              <ResponsiveGrid 
                cols={{ base: 1, lg: 2, xl: 3 }}
                gap={{ base: 6, lg: 8 }}
              >
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    currentUser={mockCurrentUser}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                    onBookmark={handleBookmark}
                    onRate={handleRate}
                  />
                ))}
              </ResponsiveGrid>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No resources found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                {canUpload && (
                  <ResponsiveButton
                    variant="primary"
                    onClick={() => setShowUploadForm(true)}
                    className="min-h-11"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Resource
                  </ResponsiveButton>
                )}
              </div>
            )}
          </motion.div>

          {/* Upload Form Modal */}
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => !isUploading && setShowUploadForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <UploadResourceForm
                  onSubmit={handleUpload}
                  onCancel={() => setShowUploadForm(false)}
                  isSubmitting={isUploading}
                />
              </motion.div>
            </motion.div>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  )
}
