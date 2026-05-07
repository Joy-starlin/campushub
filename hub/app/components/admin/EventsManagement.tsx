'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  Users,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Upload,
  Globe,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../lib/api'
import { useEffect } from 'react'


interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  category: string
  image: string
  description: string
  attendees: number
  status: 'published' | 'draft' | 'cancelled'
  price?: string
  requiresBooking?: boolean
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Bugema Tech Expo 2026',
    date: '2026-05-15',
    time: '09:00 AM',
    location: 'Main Hall',
    category: 'Technology',
    image: '/assets/events/event1.jpg',
    description: 'A showcase of innovation and student projects in technology and engineering.',
    attendees: 450,
    status: 'published'
  },
  {
    id: '2',
    title: 'University Cultural Gala',
    date: '2026-06-02',
    time: '02:00 PM',
    location: 'Campus Sports Ground',
    category: 'Culture',
    image: '/assets/events/event2.jpg',
    description: 'Celebrating diversity through music, dance, and food from various cultures.',
    attendees: 1200,
    status: 'published'
  }
]

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<Event[]>('/api/v1/events')
      setEvents(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  
  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'Technology',
    date: '',
    time: '',
    location: '',
    description: '',
    status: 'draft',
    price: '',
    requiresBooking: false
  })

  const categories = ['All', 'Technology', 'Culture', 'Workshop', 'Sports', 'Academic']
  const statuses = ['All', 'published', 'draft', 'cancelled']

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || event.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // CRUD Handlers
  const openCreateModal = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      category: 'Technology',
      date: '',
      time: '',
      location: '',
      description: '',
      status: 'draft',
      price: '',
      requiresBooking: false
    })
    setIsModalOpen(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setFormData(event)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      toast.error('Title and Date are required')
      return
    }

    const token = localStorage.getItem('accessToken') || ''

    try {
      if (editingEvent) {
        // Update
        await apiRequest(`/api/v1/events/${editingEvent.id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('Event updated successfully')
      } else {
        // Create
        await apiRequest('/api/v1/events', {
          method: 'POST',
          token,
          body: JSON.stringify({
            ...formData,
            image: formData.image || '/assets/images/placeholder-event.jpg'
          })
        })
        toast.success('Event created successfully')
      }
      setIsModalOpen(false)
      fetchEvents()
    } catch (error: any) {
      toast.error(error.message || 'Action failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/events/${id}`, {
        method: 'DELETE',
        token
      })
      toast.success('Event deleted successfully')
      setIsDeleting(null)
      fetchEvents()
    } catch (error: any) {
      toast.error('Failed to delete event')
    }
  }

  const toggleStatus = async (id: string, newStatus: Event['status']) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/events/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Event marked as ${newStatus}`)
      fetchEvents()
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }


  const getStatusStyle = (status: Event['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Django-style Header */}
      <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase">Change Events</h1>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          ADD EVENT
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Drafts', value: events.filter(e => e.status === 'draft').length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg. Attendance', value: '450+', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-xl border border-white flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-6 h-6 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search events by title or location..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bugema-blue/20 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Events Table (The "Main" Django Admin part) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-12">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Event Title</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-900 group-hover:text-bugema-blue transition-colors">{event.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.location}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => openEditModal(event)}
                        className="p-1.5 text-gray-400 hover:text-bugema-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(event.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal (Create/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Title</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bugema-blue/20 outline-none text-sm font-medium"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest bg-bugema-blue text-white hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  {editingEvent ? 'SAVE CHANGES' : 'ADD EVENT'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase">Confirm Deletion</h3>
              <p className="text-gray-500 text-sm mb-8">This action is irreversible. The event will be permanently removed from all student feeds.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleting(null)}
                  className="flex-1 px-6 py-2.5 rounded-lg font-bold text-[11px] tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors uppercase"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => handleDelete(isDeleting)}
                  className="flex-1 px-6 py-2.5 rounded-lg font-bold text-[11px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-md transition-all active:scale-95 uppercase"
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
