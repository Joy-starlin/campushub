'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface RecentSignup {
  id: string
  name: string
  email: string
  university: string
  country: string
  plan: string
  joinDate: string
}

const mockStatCards: StatCard[] = [
  {
    title: 'Total Members',
    value: '12,486',
    change: '+12.5%',
    changeType: 'increase',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    title: 'New This Week',
    value: '234',
    change: '+8.2%',
    changeType: 'increase',
    icon: TrendingUp,
    color: 'bg-green-500'
  },
  {
    title: 'Active Today',
    value: '1,847',
    change: '+23.1%',
    changeType: 'increase',
    icon: Activity,
    color: 'bg-purple-500'
  },
  {
    title: 'Revenue',
    value: 'UGX 45.2M',
    change: '+15.3%',
    changeType: 'increase',
    icon: DollarSign,
    color: 'bg-orange-500'
  }
]

const mockSignupData = [
  { date: 'Jan 1', signups: 45 },
  { date: 'Jan 8', signups: 52 },
  { date: 'Jan 15', signups: 48 },
  { date: 'Jan 22', signups: 61 },
  { date: 'Jan 29', signups: 55 },
  { date: 'Feb 5', signups: 67 },
  { date: 'Feb 12', signups: 72 },
  { date: 'Feb 19', signups: 69 },
  { date: 'Feb 26', signups: 78 },
  { date: 'Mar 5', signups: 82 },
  { date: 'Mar 12', signups: 91 },
  { date: 'Mar 19', signups: 88 },
  { date: 'Mar 26', signups: 95 },
  { date: 'Apr 2', signups: 103 },
  { date: 'Apr 9', signups: 98 },
  { date: 'Apr 16', signups: 112 },
  { date: 'Apr 23', signups: 108 },
  { date: 'Apr 30', signups: 115 }
]

const mockPostsByCategory = [
  { category: 'General', posts: 342 },
  { category: 'Academic', posts: 256 },
  { category: 'Events', posts: 189 },
  { category: 'Clubs', posts: 145 },
  { category: 'Marketplace', posts: 98 },
  { category: 'Lost & Found', posts: 67 }
]

const mockRecentSignups: RecentSignup[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@bugema.edu',
    university: 'Bugema University',
    country: 'Uganda',
    plan: 'Premium',
    joinDate: '2024-04-23'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.c@bugema.edu',
    university: 'Bugema University',
    country: 'Uganda',
    plan: 'Free',
    joinDate: '2024-04-23'
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.d@bugema.edu',
    university: 'Makerere University',
    country: 'Uganda',
    plan: 'Premium',
    joinDate: '2024-04-22'
  },
  {
    id: '4',
    name: 'Alex Kim',
    email: 'alex.k@bugema.edu',
    university: 'Bugema University',
    country: 'Kenya',
    plan: 'Free',
    joinDate: '2024-04-22'
  },
  {
    id: '5',
    name: 'Jordan Lee',
    email: 'jordan.l@bugema.edu',
    university: 'Uganda Christian University',
    country: 'Uganda',
    plan: 'Premium',
    joinDate: '2024-04-21'
  }
]

export default function AdminOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium':
        return 'bg-green-100 text-green-800'
      case 'Free':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your platform's performance and user activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStatCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.title}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Signups Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">New Signups</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockSignupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="signups" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Posts by Category Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Posts by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockPostsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                stroke="#888"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="posts" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Signups Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Signups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockRecentSignups.map((signup) => (
                <tr key={signup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{signup.name}</div>
                      <div className="text-sm text-gray-500">{signup.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {signup.university}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {signup.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(signup.plan)}`}>
                      {signup.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {new Date(signup.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
