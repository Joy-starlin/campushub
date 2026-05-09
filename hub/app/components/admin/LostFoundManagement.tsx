'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  SearchCode, 
  User, 
  MapPin, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  PlusCircle,
  HelpCircle,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LostFoundItem {
  id: string
  title: string
  location: string
  reporter: string
  type: 'lost' | 'found'
  status: 'pending' | 'resolved'
  itemType: string
  date: string
}

const mockLFItems: LostFoundItem[] = [
  {
    id: '1',
    title: 'Blue Water Bottle',
    location: 'Chemistry Lab',
    reporter: 'Alice W.',
    type: 'found',
    status: 'pending',
    itemType: 'Personal',
    date: '2026-04-20'
  },
  {
    id: '2',
    title: 'Lenovo Laptop Charger',
    location: 'Main Library',
    reporter: 'John D.',
    type: 'lost',
    status: 'pending',
    itemType: 'Electronics',
    date: '2026-04-21'
  }
]

export default function LostFoundManagement() {
  const [items, setItems] = useState<LostFoundItem[]>(mockLFItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null)
  const [formData, setFormData] = useState<Partial<LostFoundItem>>({
    title: '',
    location: '',
    reporter: '',
    type: 'lost',
    status: 'pending',
    itemType: 'Electronics'
  })

  const types = ['All', 'lost', 'found']
  const statuses = ['All', 'pending', 'resolved']

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.reporter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'All' || item.type === selectedType
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({ title: '', location: '', reporter: 'Admin', type: 'lost', status: 'pending', itemType: 'Electronics' })
    setIsModalOpen(true)
  }

  const openEditModal = (item: LostFoundItem) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.reporter) {
      toast.error('Title and Reporter are required')
      return
    }

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } as LostFoundItem : i))
      toast.success('Item updated successfully')
    } else {
      const newItem: LostFoundItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0]
      } as LostFoundItem
      setItems([newItem, ...items])
      toast.success('Item report created successfully')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id))
    toast.success('Report removed successfully')
    setIsDeleting(null)
  }

  return (
    <div className="p-6 space-y-6">
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <SearchCode className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Lost & Found Log</h1>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4" /> ADD REPORT
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search reports..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>{types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}</select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}</select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-center w-12"><input type="checkbox" className="rounded" /></th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 group-hover:text-bugema-blue transition-colors text-sm">{item.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.itemType}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${item.type === 'found' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>{item.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-sm">{item.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${item.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-bugema-blue hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                       <button onClick={() => setIsDeleting(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">{editingItem ? 'Edit Report' : 'Add New Report'}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Item Title</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Location Heard/Seen</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Reporter</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.reporter} onChange={e => setFormData({ ...formData, reporter: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Report Type</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'lost' | 'found' })}><option value="lost">LOST</option><option value="found">FOUND</option></select></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Status</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'pending' | 'resolved' })}><option value="pending">PENDING</option><option value="resolved">RESOLVED</option></select></div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-gray-500 hover:bg-gray-200 uppercase">CANCEL</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest bg-bugema-blue text-white hover:bg-blue-700 shadow-md uppercase">{editingItem ? 'SAVE CHANGES' : 'CREATE REPORT'}</button>
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
              <p className="text-gray-500 text-sm mb-8">This report will be deleted from the system.</p>
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
