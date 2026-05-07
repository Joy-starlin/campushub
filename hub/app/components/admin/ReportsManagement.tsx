'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  FileText,
  X,
  Eye,
  Trash2,
  Filter,
  ShieldAlert
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../lib/api'
import { useEffect } from 'react'


interface Report {
  id: string
  reportedContent: {
    type: 'post' | 'profile' | 'comment'
    id: string
    title: string
    author: string
  }
  reporter: { name: string; email: string }
  reason: string
  status: 'pending' | 'resolved' | 'action_taken'
  createdAt: string
}

const mockReports: Report[] = [
  {
    id: '1',
    reportedContent: { type: 'post', id: 'post1', title: 'Study Partner Search', author: 'John Doe' },
    reporter: { name: 'Jane Smith', email: 'jane@bugema.edu' },
    reason: 'Spam',
    status: 'pending',
    createdAt: '2026-04-23T10:30:00Z'
  }
]

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<Report[]>('/api/v1/reports')
      setReports(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const updateReportStatus = async (id: string, status: Report['status']) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/reports/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status })
      })
      toast.success(`Report ${status.replace('_', ' ')}`)
      fetchReports()
    } catch (error) {
      toast.error('Failed to update report')
    }
  }

  const deleteReport = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/reports/${id}`, {
        method: 'DELETE',
        token
      })
      toast.success('Report removed')
      fetchReports()
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }


  const filteredReports = reports.filter(r => {
    const matchesSearch = r.reportedContent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusStyle = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      case 'action_taken': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6">
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Select Reports to Moderate</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
           ACTIVE REPORTS: <span className="text-red-600">{reports.filter(r => r.status === 'pending').length}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search reason or reported item..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="pending">PENDING</option>
          <option value="resolved">RESOLVED</option>
          <option value="action_taken">ACTION TAKEN</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-center w-12"><input type="checkbox" className="rounded" /></th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Item Reported</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredReports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{r.reason}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">BY {r.reporter.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 line-clamp-1">{r.reportedContent.title}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{r.reportedContent.type}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toast.success('Viewing...')} className="p-1.5 text-gray-400 hover:text-bugema-blue transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                       <button onClick={() => updateReportStatus(r.id, 'resolved')} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                       <button onClick={() => deleteReport(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
