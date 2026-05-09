'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  Tag, 
  User, 
  DollarSign,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  PlusCircle,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../lib/api'
import { useEffect } from 'react'


interface MarketplaceItem {
  id: string
  title: string
  price: number
  seller: string
  category: string
  status: 'available' | 'sold' | 'pending'
  condition: 'new' | 'used'
  timestamp: string
}

const mockItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Calculus Early Transcendentals',
    price: 35000,
    seller: 'Kato J.',
    category: 'Books',
    status: 'available',
    condition: 'used',
    timestamp: '2026-04-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'iPhone 13 - Like New',
    price: 1200000,
    seller: 'Sandra M.',
    category: 'Electronics',
    status: 'pending',
    condition: 'new',
    timestamp: '2026-04-21T14:30:00Z'
  }
]

export default function MarketplaceManagement() {
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<MarketplaceItem[]>('/api/v1/marketplace')
      setItems(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load marketplace items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  
  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null)
  const [formData, setFormData] = useState<Partial<MarketplaceItem>>({
    title: '',
    price: 0,
    seller: '',
    category: 'Books',
    status: 'available',
    condition: 'used'
  })

  const categories = ['All', 'Books', 'Electronics', 'Clothing', 'Services', 'Other']
  const statuses = ['All', 'available', 'sold', 'pending']

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.seller.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // CRUD Handlers
  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      price: 0,
      seller: 'Admin',
      category: 'Books',
      status: 'available',
      condition: 'used'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: MarketplaceItem) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.seller) {
      toast.error('Title and Seller are required')
      return
    }

    const token = localStorage.getItem('accessToken') || ''

    try {
      if (editingItem) {
        await apiRequest(`/api/v1/marketplace/${editingItem.id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('Item updated successfully')
      } else {
        await apiRequest('/api/v1/marketplace', {
          method: 'POST',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('Item listed successfully')
      }
      setIsModalOpen(false)
      fetchItems()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed'
      toast.error(errorMessage || 'Action failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/marketplace/${id}`, {
        method: 'DELETE',
        token
      })
      toast.success('Item removed successfully')
      setIsDeleting(null)
      fetchItems()
    } catch (error: unknown) {
      toast.error('Failed to remove item')
    }
  }


  const getStatusStyle = (status: MarketplaceItem['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200'
      case 'sold': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6">
       {/* Django-style Header */}
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <ShoppingBag className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Marketplace Inventory</h1>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          ADD LISTING
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Listings', value: items.filter(i => i.status === 'available').length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Volume', value: 'UGX ' + items.reduce((acc, i) => acc + i.price, 0).toLocaleString(), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Platform Fee', value: 'UGX 45,000', icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Safety', value: 3, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-xl border border-white flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-sm font-black ${stat.color} truncate max-w-[120px]`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-6 h-6 ${stat.color} opacity-20 flex-shrink-0`} />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search listings..."
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-center w-12">
                   <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 group-hover:text-bugema-blue transition-colors text-sm">{item.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.category}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    UGX {item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {item.seller}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-gray-400 hover:text-bugema-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(item.id)}
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
                  {editingItem ? 'Edit Listing' : 'Add New Listing'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Product Title</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Price (UGX)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Seller Name / ID</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.seller}
                      onChange={e => setFormData({ ...formData, seller: e.target.value })}
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
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Condition</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.condition}
                      onChange={e => setFormData({ ...formData, condition: e.target.value as 'new' | 'used' })}
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as 'available' | 'sold' | 'pending' })}
                    >
                      {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-gray-500 hover:bg-gray-200 transition-colors uppercase"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest bg-bugema-blue text-white hover:bg-blue-700 shadow-md transition-all active:scale-95 uppercase"
                >
                   {editingItem ? 'SAVE CHANGES' : 'CREATE LISTING'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase">Confirm Removal</h3>
              <p className="text-gray-500 text-sm mb-8">This item will be removed from the marketplace. All buyer inquiries will be closed.</p>
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
