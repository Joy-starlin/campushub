'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Flag, CheckCircle, AlertTriangle, MessageSquare, User, FileText } from 'lucide-react'

interface Report {
  id: string
  reportedContent: {
    type: 'post' | 'profile' | 'comment'
    id: string
    title: string
    author: string
  }
  reporter: {
    id: string
    name: string
    email: string
  }
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'action_taken'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}

const mockReports: Report[] = [
  {
    id: '1',
    reportedContent: {
      type: 'post',
      id: 'post123',
      title: 'Looking for study partners',
      author: 'John Doe'
    },
    reporter: {
      id: 'user456',
      name: 'Jane Smith',
      email: 'jane.s@bugema.edu'
    },
    reason: 'Inappropriate content',
    description: 'This post contains spam links and inappropriate language that violates community guidelines.',
    status: 'pending',
    createdAt: '2024-04-23T10:30:00Z'
  },
  {
    id: '2',
    reportedContent: {
      type: 'profile',
      id: 'profile789',
      title: 'Mike Chen Profile',
      author: 'Mike Chen'
    },
    reporter: {
      id: 'user012',
      name: 'Sarah Johnson',
      email: 'sarah.j@bugema.edu'
    },
    reason: 'Fake profile',
    description: 'This profile appears to be fake and using someone else\'s photos.',
    status: 'pending',
    createdAt: '2024-04-23T09:15:00Z'
  },
  {
    id: '3',
    reportedContent: {
      type: 'comment',
      id: 'comment345',
      title: 'Comment on React Workshop post',
      author: 'Alex Kim'
    },
    reporter: {
      id: 'user678',
      name: 'Emily Davis',
      email: 'emily.d@bugema.edu'
    },
    reason: 'Harassment',
    description: 'This comment contains harassing language and personal attacks.',
    status: 'resolved',
    createdAt: '2024-04-22T14:20:00Z',
    resolvedAt: '2024-04-22T16:45:00Z',
    resolvedBy: 'Admin User'
  }
]

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const reportStatuses = ['All', 'pending', 'resolved', 'action_taken']
  const contentTypes = ['All', 'post', 'profile', 'comment']

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportedContent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'All' || report.status === selectedStatus
    const matchesType = selectedType === 'All' || report.reportedContent.type === selectedType

    return matchesSearch && matchesStatus && matchesType
  })

  const handleMarkResolved = async (reportId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Admin User'
            }
          : report
      ))
      
      console.log('Report marked as resolved:', reportId)
    } catch (error) {
      console.error('Failed to resolve report:', error)
    }
  }

  const handleTakeAction = async (reportId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'action_taken' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Admin User'
            }
          : report
      ))
      
      console.log('Action taken on report:', reportId)
    } catch (error) {
      console.error('Failed to take action on report:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'action_taken': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4" />
      case 'profile':
        return <User className="w-4 h-4" />
      case 'comment':
        return <MessageSquare className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
        <p className="text-gray-600">Review and manage user reports and content moderation</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {reportStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {contentTypes.map(type => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Reports ({filteredReports.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        {getTypeIcon(report.reportedContent.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {report.reportedContent.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.reportedContent.type.charAt(0).toUpperCase() + report.reportedContent.type.slice(1)} by {report.reportedContent.author}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          ID: {report.reportedContent.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report.reporter.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.reporter.email}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {report.reason}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {report.description}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                    </span>
                    {report.resolvedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {report.resolvedBy}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(report.createdAt)}</div>
                    {report.resolvedAt && (
                      <div className="text-xs text-green-600">
                        Resolved {formatDate(report.resolvedAt)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleMarkResolved(report.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleTakeAction(report.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Take action"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
