'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Download, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  FileText,
  DollarSign,
  Filter,
  X,
  TrendingUp,
  Landmark
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiRequest } from '../../lib/api'
import { useEffect } from 'react'


interface Payment {
  id: string
  user: {
    name: string
    email: string
  }
  plan: string
  amount: number
  currency: string
  method: 'card' | 'mobile_money' | 'bank_transfer'
  date: string
  status: 'completed' | 'pending' | 'failed'
  transactionId: string
}

const mockPayments: Payment[] = [
  {
    id: '1',
    user: { name: 'Sarah Johnson', email: 'sarah.j@bugema.edu' },
    plan: 'Premium',
    amount: 50000,
    currency: 'UGX',
    method: 'mobile_money',
    date: '2026-04-23T10:30:00Z',
    status: 'completed',
    transactionId: 'TXN001234'
  }
]

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<Payment[]>('/api/v1/payments')
      setPayments(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])


  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusStyle = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6">
       <div className="bg-white border-b border-gray-200 -m-6 mb-6 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Landmark className="w-6 h-6 text-bugema-blue" />
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Select Payments to Change</h1>
        </div>
        <button onClick={() => toast.success('CSV Exporting...')} className="flex items-center gap-2 bg-bugema-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95">
          <Download className="w-4 h-4" /> EXPORT CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Today\'s Revenue', value: 'UGX 450k', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active Subscriptions', value: '1,240', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Payouts', value: 'UGX 1.2M', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="completed">COMPLETED</option>
          <option value="pending">PENDING</option>
          <option value="failed">FAILED</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-center w-12"><input type="checkbox" className="rounded" /></th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Transaction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{p.transactionId}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{p.user.name}</p>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {p.currency} {p.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500">
                  {new Date(p.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
