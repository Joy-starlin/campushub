'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  Users, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  Globe, 
  MessageSquare,
  TrendingUp,
  Settings,
  User,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  Shield,
  Target,
  Award,
  LogOut
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
  subItems?: NavItem[]
  description?: string
}

interface UserStats {
  rank: number
  clubs: number
  posts: number
  points: number
  notifications: number
}

interface ResponsiveNavigationProps {
  currentUser?: {
    name: string
    avatar?: string
    role: string
  }
  userStats?: UserStats
  className?: string
}

/**
 * Responsive navigation component
 * - Mobile: Bottom navigation bar (hidden on md+)
 * - Desktop: Top navigation bar (hidden on md-)
 * Mobile-first approach with proper touch targets
 */
export default function ResponsiveNavigation({
  currentUser,
  userStats = { rank: 0, clubs: 0, posts: 0, points: 0, notifications: 0 },
  className = ''
}: ResponsiveNavigationProps) {
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState('home')
  const [activeDesktopGroup, setActiveDesktopGroup] = useState('main')
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleMobileMenuToggle = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    // onMobileMenuToggle?.(newState)
  }

  // Comprehensive navigation structure
  const navigationGroups = {
    home: {
      label: 'HOME',
      icon: <Home className="w-5 h-5" />,
      items: [
        { id: 'home', label: 'News Feed', icon: <Home className="w-5 h-5" />, href: '/', description: 'Latest updates and news' },
        { id: 'search', label: 'Global Search', icon: <Search className="w-5 h-5" />, href: '/search', description: 'Search everything' }
      ],
      singlePage: true
    },
    events: {
      label: 'EVENTS & CLUBS',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        { id: 'news-feed', label: 'News Feed', icon: <MessageSquare className="w-5 h-5" />, href: '/news', description: 'Latest updates' },
        { id: 'all-events', label: 'All Events', icon: <Calendar className="w-5 h-5" />, href: '/events', description: 'Browse all events' },
        { id: 'clubs', label: 'Club Directory', icon: <Users className="w-5 h-5" />, href: '/clubs', description: 'All student clubs' },
        { id: 'club-chat', label: 'Club Live Chat', icon: <MessageSquare className="w-5 h-5" />, href: '/club-chat', description: 'Real-time discussions', badge: userStats?.clubs },
        { id: 'study-groups', label: 'Study Groups', icon: <BookOpen className="w-5 h-5" />, href: '/study-groups', description: 'Academic groups', badge: 2 }
      ]
    },
    community: {
      label: 'COMMUNITY',
      icon: <Users className="w-5 h-5" />,
      items: [
        { id: 'marketplace', label: 'Marketplace', icon: <Briefcase className="w-5 h-5" />, href: '/marketplace', description: 'Buy & sell items' },
        { id: 'lost-found', label: 'Lost & Found', icon: <Search className="w-5 h-5" />, href: '/lost-found', description: 'Find lost items' },
        { id: 'ride-sharing', label: 'Ride Sharing', icon: <Globe className="w-5 h-5" />, href: '/ride-sharing', description: 'Share rides' },
        { id: 'directions', label: 'Directions & Map', icon: <Globe className="w-5 h-5" />, href: '/directions', description: 'Campus navigation' },
        { id: 'feedback', label: 'Anonymous Feedback', icon: <MessageSquare className="w-5 h-5" />, href: '/feedback', description: 'Share thoughts' },
        { id: 'resources', label: 'PDF Resources', icon: <BookOpen className="w-5 h-5" />, href: '/resources', description: 'Download materials', badge: 15 }
      ]
    },
    global: {
      label: 'GLOBAL',
      icon: <Globe className="w-5 h-5" />,
      items: [
        { id: 'jobs', label: 'Jobs & Internships', icon: <Briefcase className="w-5 h-5" />, href: '/jobs', description: 'Career opportunities', badge: 8 },
        { id: 'alumni', label: 'Alumni Network', icon: <Users className="w-5 h-5" />, href: '/alumni', description: 'Connect with alumni' },
        { id: 'universities', label: 'Universities', icon: <Globe className="w-5 h-5" />, href: '/universities', description: 'Partner universities' },
        { id: 'mentorship', label: 'Mentorship', icon: <Target className="w-5 h-5" />, href: '/mentorship', description: 'Find mentors', badge: 5 }
      ]
    },
    engage: {
      label: 'ENGAGE',
      icon: <TrendingUp className="w-5 h-5" />,
      items: [
        { id: 'leaderboard', label: 'Leaderboard', icon: <TrendingUp className="w-5 h-5" />, href: '/leaderboard', description: 'Top contributors' },
        { id: 'badges', label: 'Badges & Achievements', icon: <Award className="w-5 h-5" />, href: '/badges', description: 'Your achievements' },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, href: '/notifications', description: 'Stay updated', badge: userStats?.notifications },
        { id: 'verified', label: 'Verified Badges', icon: <Shield className="w-5 h-5" />, href: '/verified', description: 'Get verified' }
      ]
    }
  }

  // Mobile tabs - simplified for bottom navigation
  const mobileTabs = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" />, href: '/' },
    { id: 'events', label: 'Events', icon: <Calendar className="w-6 h-6" />, href: '/events' },
    { id: 'community', label: 'Community', icon: <Users className="w-6 h-6" />, href: '/community' },
    { id: 'global', label: 'Global', icon: <Globe className="w-6 h-6" />, href: '/global' },
    { id: 'engage', label: 'Engage', icon: <TrendingUp className="w-6 h-6" />, href: '/engage' }
  ]

  // User menu items
  const userMenuItems = [
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" />, href: '/profile' },
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="w-4 h-4" />, href: '/dashboard' },
    { id: 'settings', label: 'Settings & Privacy', icon: <Settings className="w-4 h-4" />, href: '/settings' },
    { id: 'admin', label: 'Admin Dashboard', icon: <Shield className="w-4 h-4" />, href: '/admin', adminOnly: true },
    { id: 'api', label: 'Public API', icon: <Globe className="w-4 h-4" />, href: '/api-docs', adminOnly: true }
  ]

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    detectDevice()
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  // Desktop Navigation - Mega Menu Style
  const DesktopNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-6">
      {Object.entries(navigationGroups).map(([groupKey, group]: [string, any]) => (
        <div
          key={groupKey}
          className="relative"
          onMouseEnter={() => setHoveredGroup(groupKey)}
          onMouseLeave={() => setHoveredGroup(null)}
        >
          {group.singlePage ? (
            <a
              href={group.items[0].href}
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="w-5 h-5 text-blue-600 dark:text-blue-400">
                {group.icon}
              </div>
              <span className="font-semibold text-base">{group.label}</span>
            </a>
          ) : (
            <button className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="w-5 h-5 text-blue-600 dark:text-blue-400">
                {group.icon}
              </div>
              <span className="font-semibold text-base">{group.label}</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </button>
          )}
          
          {!group.singlePage && (
            <AnimatePresence>
              {hoveredGroup === groupKey && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {group.icon}
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        {group.label}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {group.items.map((item: NavItem) => (
                        <a
                          key={item.id}
                          href={item.href}
                          className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.badge && item.badge > 0 && (
                            <div className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                              {item.badge}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </nav>
  )

  // Tablet Navigation - Full Sidebar
  const TabletNavigation = () => (
    <nav className="hidden md:flex lg:hidden flex-col w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* User Stats Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {currentUser?.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentUser?.role}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              #{userStats.rank}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Rank</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats.clubs}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Clubs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats.posts}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats.points}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Points</div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(navigationGroups).map(([groupKey, group]: [string, any]) => (
          <div key={groupKey} className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {group.label}
              </h4>
            </div>
            <div className="p-4 space-y-2">
              {group.items.map((item: NavItem) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.label}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )

  // Mobile Navigation - Bottom Tabs
  const MobileNavigation = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      {/* Category Strip */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMobileTab(tab.id)}
            className={`flex flex-col items-center space-y-2 px-4 py-3 min-w-fit transition-all duration-200 ${
              activeMobileTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="w-7 h-7 transition-transform duration-200">
              {tab.icon}
            </div>
            <span className="text-sm font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Active Tab Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 transition-all duration-300"
        style={{
          transform: `translateX(${mobileTabs.findIndex(tab => tab.id === activeMobileTab) * 100}%)`,
          width: `${100 / mobileTabs.length}%`
        }}
      />
    </div>
  )

  // Mobile Menu (for when sidebar is needed)
  const MobileMenu = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* User Info */}
            {currentUser && (
              <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {currentUser.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Items */}
            <div className="space-y-2">
              {Object.values(navigationGroups).flatMap((group: any) => group.items).map((item: NavItem) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Header with user controls and independent search
  const Header = () => (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Bugema Hub
            </span>
          </div>

          {/* Independent Search Bar - Desktop Only */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search everything..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <kbd className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  ⌘K
                </span>
              </kbd>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {userStats.notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {userStats.notifications}
                </div>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden lg:block text-base font-medium text-gray-900 dark:text-white">
                  {currentUser?.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      {userMenuItems.map((item) => (
                        <a
                          key={item.id}
                          href={item.href}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                            {item.icon}
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {item.label}
                          </span>
                        </a>
                      ))}
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <Header />
      
      <div className="flex">
        {/* Desktop Navigation */}
        <DesktopNavigation />
        
        {/* Tablet Navigation */}
        <TabletNavigation />
        
        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Navigation */}
          <MobileNavigation />
          <MobileMenu />
        </div>
      </div>
    </div>
  )
}
