'use client'

import AdminLayout from '../../components/admin/AdminLayout'
import FeedbackAdminDashboard from '../../components/FeedbackAdminDashboard'
import { useState, useEffect } from 'react'
import { apiRequest } from '../../lib/api'
import { FeedbackSubmission, FeedbackStatus } from '../../types/feedback'
import toast from 'react-hot-toast'

export default function FeedbackAdminPage() {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = async () => {
    try {
      const res = await apiRequest<FeedbackSubmission[]>('/api/v1/feedback')
      setSubmissions(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      // Fallback to empty if unauthorized/fails
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  const handleUpdateStatus = async (id: string, status: FeedbackStatus, adminNotes?: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await apiRequest(`/api/v1/feedback/${id}/status`, {
        method: 'PATCH',
        token: token || undefined,
        body: JSON.stringify({ status, adminNotes })
      })
      toast.success('Status updated')
      fetchFeedback()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleRespondPublicly = async (id: string, response: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await apiRequest(`/api/v1/feedback/${id}/respond`, {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({ response })
      })
      toast.success('Response posted')
      fetchFeedback()
    } catch (err) {
      toast.error('Failed to post response')
    }
  }

  const handleEscalate = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await apiRequest(`/api/v1/feedback/${id}/escalate`, {
        method: 'POST',
        token: token || undefined
      })
      toast.success('Feedback escalated')
      fetchFeedback()
    } catch (err) {
      toast.error('Failed to escalate')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <FeedbackAdminDashboard 
            submissions={submissions}
            onUpdateStatus={handleUpdateStatus}
            onRespondPublicly={handleRespondPublicly}
            onEscalate={handleEscalate}
          />
        )}
      </div>
    </AdminLayout>
  )
}

