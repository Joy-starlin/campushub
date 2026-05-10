'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MessageSquare, 
  ThumbsUp, 
  Flag, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  AlertTriangle,
  X,
  FileSearch,
  MessageCircle,
  ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Post {
  id: string
  author: string
  content: string
  category: string
  likes: number
  comments: number
  status: 'active' | 'flagged' | 'removed'
  timestamp: string
  reports: number
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Samuel T.',
    content: 'Has anyone seen my lost laptop charger in the library? It was a Lenovo 65W.',
    category: 'Lost & Found',
    likes: 12,
    comments: 5,
    status: 'active',
    timestamp: '2026-04-23T10:00:00Z',
    reports: 0
  },
  {
    id: '2',
    author: 'Prossy N.',
    content: 'Selling my half-used calculus textbook for 20k. DM if interested!',
    category: 'Marketplace',
    likes: 8,
    comments: 2,
    status: 'active',
    timestamp: '2026-04-23T09:15:00Z',
    reports: 0
  }
]

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState<Partial<Post>>({
    author: '',
    content: '',
    category: 'General',
    status: 'active',
  })

  const categories = ['All', 'General', 'Academic', 'Marketplace', 'Lost & Found', 'Feedback']
  const statuses = ['All', 'active', 'flagged', 'removed']

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // CRUD Handlers
  const openCreateModal = () => {
    setEditingPost(null)
    setFormData({
      author: 'Admin',
      content: '',
      category: 'General',
      status: 'active',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (post: Post) => {
    setEditingPost(post)
    setFormData(post)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.content || !formData.author) {
      toast.error('Author and Content are required')
      return
    }

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...formData } as Post : p))
      toast.success('Post updated successfully')
    } else {
      const newPost: Post = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        likes: 0,
        comments: 0,
        reports: 0,
        timestamp: new Date().toISOString()
      } as Post
      setPosts([newPost, ...posts])
      toast.success('Post created successfully')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id))
    toast.success('Post removed successfully')
    setIsDeleting(null)
  }

  const toggleStatus = (id: string, newStatus: Post['status']) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p))
    toast.success(`Post status updated to ${newStatus}`)
  }

  const getStatusStyle = (status: Post['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'flagged': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'removed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6">
       {/* Django-style Header */}
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <MessageCircle className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Change Posts</h1>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          ADD POST
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Flagged Content', value: posts.filter(p => p.status === 'flagged').length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Reports Pending', value: posts.reduce((acc, p) => acc + p.reports, 0), icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Avg. Engagement', value: '45%', icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50' },
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
            placeholder="Search content or author..."
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

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-center w-12">
                   <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Author</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Snippet</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Reports</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <User className="w-3.5 h-3.5 text-gray-400" />
                       <span className="text-sm font-bold text-gray-900">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-gray-600 line-clamp-1">{post.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {post.reports > 0 ? (
                      <span className="text-red-600 font-black text-xs">{post.reports}</span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => openEditModal(post)}
                        className="p-1.5 text-gray-400 hover:text-bugema-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(post.id)}
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
                  {editingPost ? 'Edit Post' : 'Add New Post'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Author Name / ID</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium"
                      value={formData.author}
                      onChange={e => setFormData({ ...formData, author: e.target.value })}
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
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Post Content</label>
                    <textarea 
                      rows={6}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bugema-blue/20 outline-none text-sm resize-none"
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as Post['status'] })}
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
                   {editingPost ? 'SAVE CHANGES' : 'CREATE POST'}
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
              <p className="text-gray-500 text-sm mb-8">This action is irreversible. The post will be permanently removed from the community feed.</p>
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
