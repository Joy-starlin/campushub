'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Shield, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  X,
  Eye,
  Ban,
  UserPlus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../lib/api'
import { useEffect } from 'react'


interface User {
  id: string
  name: string
  email: string
  avatar?: string
  country: string
  university: string
  plan: 'Free' | 'Premium' | 'Enterprise'
  role: 'member' | 'moderator' | 'admin'
  status: 'active' | 'suspended'
  joinDate: string
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@bugema.edu',
    country: 'Uganda',
    university: 'Bugema University',
    plan: 'Premium',
    role: 'member',
    status: 'active',
    joinDate: '2026-01-15'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.c@bugema.edu',
    country: 'Uganda',
    university: 'Bugema University',
    plan: 'Free',
    role: 'member',
    status: 'active',
    joinDate: '2026-02-20'
  }
]

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<User[]>('/api/v1/users')
      setUsers(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'member',
    status: 'active',
    plan: 'Free'
  })

  const roles = ['All', 'member', 'moderator', 'admin']
  const statuses = ['All', 'active', 'suspended']
  const plans = ['Free', 'Premium', 'Enterprise']

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'All' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'member', status: 'active', plan: 'Free' })
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData(user)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required')
      return
    }

    const token = localStorage.getItem('accessToken') || ''

    try {
      if (editingUser) {
        await apiRequest(`/api/v1/users/${editingUser.id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('User updated successfully')
      } else {
        await apiRequest('/api/v1/users', {
          method: 'POST',
          token,
          body: JSON.stringify(formData)
        })
        toast.success('User account created')
      }
      setIsModalOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Action failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken') || ''
      await apiRequest(`/api/v1/users/${id}`, {
        method: 'DELETE',
        token
      })
      toast.success('User account deleted')
      setIsDeleting(null)
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to delete user')
    }
  }


  const getStatusStyle = (status: User['status']) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200'
  }

  const getRoleStyle = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'moderator': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6">
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Users className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Select Users to Change</h1>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95">
          <UserPlus className="w-4 h-4" /> ADD USER
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>{roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}</select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}</select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-center w-12"><input type="checkbox" className="rounded" /></th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 group-hover:text-bugema-blue transition-colors">{user.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getRoleStyle(user.role)}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(user.status)}`}>{user.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                     <button onClick={() => openEditModal(user)} className="p-1.5 text-gray-400 hover:text-bugema-blue hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                     <button onClick={() => setIsDeleting(user.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-black text-gray-900 uppercase">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Full Name</label><input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="col-span-2"><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Email Address</label><input type="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Role</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}>{roles.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}</select></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Plan</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value as any })}>{plans.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}</select></div>
                  <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Status</label><select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}><option value="active">ACTIVE</option><option value="suspended">SUSPENDED</option></select></div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-gray-500 hover:bg-gray-200 uppercase">CANCEL</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest bg-bugema-blue text-white hover:bg-blue-700 shadow-md uppercase">{editingUser ? 'SAVE CHANGES' : 'CREATE USER'}</button>
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
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase text-xs">Confirm Permanent Deletion</h3>
              <p className="text-gray-500 text-sm mb-8">This will erase the user account and all associated data. This action is irreversible.</p>
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
