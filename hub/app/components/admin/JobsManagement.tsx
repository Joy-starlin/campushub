'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ExternalLink,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../lib/api'
import { useEffect } from 'react'


interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Remote'
  status: 'active' | 'closed' | 'expired'
  applications: number
  postedDate: string
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'Bugema Tech Solutions',
    location: 'Kampala / Remote',
    type: 'Internship',
    status: 'active',
    applications: 12,
    postedDate: '2026-04-22'
  },
  {
    id: '2',
    title: 'Customer Success Associate',
    company: 'Hub Logistics',
    location: 'Bugema Campus',
    type: 'Part-time',
    status: 'active',
    applications: 8,
    postedDate: '2026-04-23'
  }
]

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<Job[]>('/api/v1/jobs')
      setJobs(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    status: 'active'
  })

  const types = ['All', 'Full-time', 'Part-time', 'Internship', 'Remote']
  const statuses = ['All', 'active', 'closed', 'expired']

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'All' || job.type === selectedType
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const openCreateModal = () => {
    setEditingJob(null)
    setFormData({ title: '', company: '', location: '', type: 'Full-time', status: 'active' })
    setIsModalOpen(true)
  }

  const openEditModal = (job: Job) => {
    setEditingJob(job)
    setFormData(job)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.company) {
      toast.error('Title and Company are required')
      return
    }

    const token = localStorage.getItem('accessToken') || ''

    try {
      if (editingJob) {
        await apiRequest(`/api/v1/jobs/${editingJob.id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('Job updated successfully')
      } else {
        await apiRequest('/api/v1/jobs', {
          method: 'POST',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('Job posted successfully')
      }
      setIsModalOpen(false)
      fetchJobs()
    } catch (error: any) {
      toast.error(error.message || 'Action failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/jobs/${id}`, {
        method: 'DELETE',
        token
      })
      toast.success('Job removed successfully')
      setIsDeleting(null)
      fetchJobs()
    } catch (error: any) {
      toast.error('Failed to remove job')
    }
  }


  const getStatusStyle = (status: Job['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'expired': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6">
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Briefcase className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Job Board Admin</h1>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4" /> POST JOB
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search jobs or companies..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>{types.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-center w-12"><input type="checkbox" className="rounded" /></th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Position</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Platform Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Applicants</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 group-hover:text-bugema-blue transition-colors text-sm">{job.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{job.company}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>{job.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-gray-700">{job.applications}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openEditModal(job)} className="p-1.5 text-gray-400 hover:text-bugema-blue hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                       <button onClick={() => setIsDeleting(job.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-black text-gray-900 uppercase">{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Title</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Company</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Location</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Type</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>{types.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Status</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>{statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-gray-500 hover:bg-gray-200 uppercase">CANCEL</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest bg-bugema-blue text-white hover:bg-blue-700 shadow-md uppercase">{editingJob ? 'SAVE CHANGES' : 'POST JOB'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-8 h-8" /></div>
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase">Confirm Removal</h3>
              <p className="text-gray-500 text-sm mb-8">This job posting will be removed and applicants will no longer be able to see it.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleting(null)} className="flex-1 px-6 py-2.5 rounded-lg font-bold text-[11px] tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors uppercase">CANCEL</button>
                <button onClick={() => handleDelete(isDeleting)} className="flex-1 px-6 py-2.5 rounded-lg font-bold text-[11px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-md transition-all active:scale-95 uppercase">DELETE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
