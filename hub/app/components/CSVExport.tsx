'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  TrendingUp, 
  Settings,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  X,
  Loader
} from 'lucide-react'
import Papa from 'papaparse'

interface ExportOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  fields: string[]
  data: any[]
  filename: string
}

interface CSVExportProps {
  className?: string
  onExportComplete?: (filename: string, recordCount: number) => void
}

export default function CSVExport({ className = '', onExportComplete }: CSVExportProps) {
  const [selectedOption, setSelectedOption] = useState<ExportOption | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - in production, this would come from API calls
  const mockData = {
    users: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@bugema.ac.ug',
        role: 'student',
        department: 'Computer Science',
        year: '3',
        gpa: '3.8',
        joinDate: '2022-09-01',
        lastActive: '2024-04-25',
        status: 'active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@bugema.ac.ug',
        role: 'student',
        department: 'Business',
        year: '2',
        gpa: '3.9',
        joinDate: '2023-09-01',
        lastActive: '2024-04-24',
        status: 'active'
      }
    ],
    events: [
      {
        id: '1',
        title: 'Career Fair 2024',
        description: 'Annual career fair with top companies',
        date: '2024-05-15',
        time: '10:00',
        location: 'Main Campus',
        organizer: 'Career Services',
        category: 'career',
        attendees: 250,
        status: 'upcoming',
        format: 'physical'
      },
      {
        id: '2',
        title: 'Tech Talk: AI in Education',
        description: 'Exploring the role of AI in modern education',
        date: '2024-05-20',
        time: '14:00',
        location: 'Lecture Hall A',
        organizer: 'CS Department',
        category: 'academic',
        attendees: 150,
        status: 'upcoming',
        format: 'physical'
      }
    ],
    clubs: [
      {
        id: '1',
        name: 'Computer Science Club',
        description: 'For students interested in technology and programming',
        category: 'academic',
        members: 45,
        founded: '2020',
        president: 'Alice Johnson',
        meetingDay: 'Wednesday',
        meetingTime: '18:00',
        status: 'active'
      },
      {
        id: '2',
        name: 'Sports Club',
        description: 'Promoting sports and physical fitness',
        category: 'sports',
        members: 80,
        founded: '2019',
        president: 'Bob Wilson',
        meetingDay: 'Friday',
        meetingTime: '17:00',
        status: 'active'
      }
    ],
    jobs: [
      {
        id: '1',
        title: 'Software Developer Intern',
        company: 'Tech Corp',
        type: 'internship',
        location: 'Kampala, Uganda',
        country: 'UG',
        description: 'Looking for motivated software developer interns',
        requirements: 'JavaScript, React, Node.js',
        salary: 'UGX 500,000',
        posted: '2024-04-01',
        deadline: '2024-05-01',
        status: 'active'
      },
      {
        id: '2',
        title: 'Marketing Assistant',
        company: 'Marketing Pro',
        type: 'full-time',
        location: 'Entebbe, Uganda',
        country: 'UG',
        description: 'Join our marketing team',
        requirements: 'Marketing, Communication, Social Media',
        salary: 'UGX 800,000',
        posted: '2024-04-05',
        deadline: '2024-05-15',
        status: 'active'
      }
    ],
    posts: [
      {
        id: '1',
        title: 'New Library Opening',
        content: 'We are excited to announce the opening of our new library facility...',
        category: 'news',
        author: 'Admin',
        date: '2024-04-10',
        likes: 45,
        comments: 12,
        views: 250,
        status: 'published'
      },
      {
        id: '2',
        title: 'Student Achievement Awards',
        content: 'Congratulations to our students who excelled in various competitions...',
        category: 'announcements',
        author: 'Dean',
        date: '2024-04-08',
        likes: 89,
        comments: 23,
        views: 450,
        status: 'published'
      }
    ]
  }

  const exportOptions: ExportOption[] = [
    {
      id: 'users',
      name: 'Users & Members',
      description: 'Export all user data including profiles and activity',
      icon: <Users className="w-5 h-5" />,
      fields: ['id', 'name', 'email', 'role', 'department', 'year', 'gpa', 'joinDate', 'lastActive', 'status'],
      data: mockData.users,
      filename: 'users_export'
    },
    {
      id: 'events',
      name: 'Events',
      description: 'Export all events with attendance and details',
      icon: <Calendar className="w-5 h-5" />,
      fields: ['id', 'title', 'description', 'date', 'time', 'location', 'organizer', 'category', 'attendees', 'status', 'format'],
      data: mockData.events,
      filename: 'events_export'
    },
    {
      id: 'clubs',
      name: 'Clubs & Organizations',
      description: 'Export club information and membership data',
      icon: <Settings className="w-5 h-5" />,
      fields: ['id', 'name', 'description', 'category', 'members', 'founded', 'president', 'meetingDay', 'meetingTime', 'status'],
      data: mockData.clubs,
      filename: 'clubs_export'
    },
    {
      id: 'jobs',
      name: 'Job Postings',
      description: 'Export all job postings and applications',
      icon: <TrendingUp className="w-5 h-5" />,
      fields: ['id', 'title', 'company', 'type', 'location', 'country', 'description', 'requirements', 'salary', 'posted', 'deadline', 'status'],
      data: mockData.jobs,
      filename: 'jobs_export'
    },
    {
      id: 'posts',
      name: 'Posts & Content',
      description: 'Export all posts, articles, and content',
      icon: <FileText className="w-5 h-5" />,
      fields: ['id', 'title', 'content', 'category', 'author', 'date', 'likes', 'comments', 'views', 'status'],
      data: mockData.posts,
      filename: 'posts_export'
    }
  ]

  const filterData = (data: any[], option: ExportOption) => {
    let filteredData = [...data]

    // Apply search filter
    if (searchQuery) {
      filteredData = filteredData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply specific filters
    if (option.id === 'users') {
      if (filters.role) {
        filteredData = filteredData.filter(user => user.role === filters.role)
      }
      if (filters.status) {
        filteredData = filteredData.filter(user => user.status === filters.status)
      }
      if (filters.department) {
        filteredData = filteredData.filter(user => user.department === filters.department)
      }
    }

    if (option.id === 'events') {
      if (filters.category) {
        filteredData = filteredData.filter(event => event.category === filters.category)
      }
      if (filters.status) {
        filteredData = filteredData.filter(event => event.status === filters.status)
      }
      if (filters.format) {
        filteredData = filteredData.filter(event => event.format === filters.format)
      }
    }

    if (option.id === 'clubs') {
      if (filters.category) {
        filteredData = filteredData.filter(club => club.category === filters.category)
      }
      if (filters.status) {
        filteredData = filteredData.filter(club => club.status === filters.status)
      }
    }

    if (option.id === 'jobs') {
      if (filters.type) {
        filteredData = filteredData.filter(job => job.type === filters.type)
      }
      if (filters.status) {
        filteredData = filteredData.filter(job => job.status === filters.status)
      }
      if (filters.country) {
        filteredData = filteredData.filter(job => job.country === filters.country)
      }
    }

    if (option.id === 'posts') {
      if (filters.category) {
        filteredData = filteredData.filter(post => post.category === filters.category)
      }
      if (filters.status) {
        filteredData = filteredData.filter(post => post.status === filters.status)
      }
    }

    return filteredData
  }

  const handleExport = async () => {
    if (!selectedOption) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Filter data based on current filters
      const filteredData = filterData(selectedOption.data, selectedOption)
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Create CSV
      const csv = Papa.unparse(filteredData, {
        header: true,
        columns: selectedOption.fields.map(field => ({
          title: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
          key: field
        })) as any
      })

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${selectedOption.filename}_${timestamp}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      onExportComplete?.(filename, filteredData.length)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const getFilterOptions = (option: ExportOption) => {
    switch (option.id) {
      case 'users':
        return [
          { key: 'role', label: 'Role', options: ['student', 'admin', 'moderator'] },
          { key: 'status', label: 'Status', options: ['active', 'inactive', 'suspended'] },
          { key: 'department', label: 'Department', options: ['Computer Science', 'Business', 'Engineering', 'Arts'] }
        ]
      case 'events':
        return [
          { key: 'category', label: 'Category', options: ['academic', 'career', 'sports', 'cultural', 'social'] },
          { key: 'status', label: 'Status', options: ['upcoming', 'ongoing', 'completed', 'cancelled'] },
          { key: 'format', label: 'Format', options: ['physical', 'online', 'hybrid'] }
        ]
      case 'clubs':
        return [
          { key: 'category', label: 'Category', options: ['academic', 'sports', 'cultural', 'social', 'religious'] },
          { key: 'status', label: 'Status', options: ['active', 'inactive', 'suspended'] }
        ]
      case 'jobs':
        return [
          { key: 'type', label: 'Type', options: ['internship', 'full-time', 'part-time', 'contract'] },
          { key: 'status', label: 'Status', options: ['active', 'closed', 'draft'] },
          { key: 'country', label: 'Country', options: ['UG', 'KE', 'TZ', 'RW'] }
        ]
      case 'posts':
        return [
          { key: 'category', label: 'Category', options: ['news', 'announcements', 'events', 'academic', 'social'] },
          { key: 'status', label: 'Status', options: ['published', 'draft', 'archived'] }
        ]
      default:
        return []
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                CSV Export
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Export data in CSV format for analysis
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {exportOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOption(option)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedOption?.id === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedOption?.id === option.id
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <div className={`${
                    selectedOption?.id === option.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {option.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {option.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.data.length} records
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Option Details */}
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Export Options: {selectedOption.name}
              </h4>
              <button
                onClick={() => setSelectedOption(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Filters
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`} />
                </button>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4"
                  >
                    {getFilterOptions(selectedOption).map((filter) => (
                      <div key={filter.key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {filter.label}
                        </label>
                        <select
                          value={filters[filter.key] || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All</option>
                          {filter.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Fields to Export */}
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                Fields to Export ({selectedOption.fields.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedOption.fields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Exporting...
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {exportProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Export Button */}
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedOption(null)
                  setFilters({})
                  setSearchQuery('')
                  setShowFilters(false)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Export history component
export function ExportHistory({ className = '' }: { className?: string }) {
  const [exports] = useState([
    {
      id: '1',
      filename: 'users_export_2024-04-25.csv',
      type: 'Users & Members',
      recordCount: 1250,
      exportedAt: '2024-04-25T10:30:00Z',
      exportedBy: 'Admin User'
    },
    {
      id: '2',
      filename: 'events_export_2024-04-24.csv',
      type: 'Events',
      recordCount: 45,
      exportedAt: '2024-04-24T15:45:00Z',
      exportedBy: 'Admin User'
    }
  ])

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Exports
      </h3>
      
      <div className="space-y-3">
        {exports.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {exp.filename}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {exp.type} • {exp.recordCount} records
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {new Date(exp.exportedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {exp.exportedBy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
