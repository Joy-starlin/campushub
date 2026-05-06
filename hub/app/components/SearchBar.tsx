'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, Calendar, Users, User, MessageSquare, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'event' | 'club' | 'post' | 'person' | 'marketplace'
  title: string
  subtitle: string
  url: string
}

interface SearchBarProps {
  placeholder?: string
  className?: string
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'event',
    title: 'React Workshop',
    subtitle: 'Computer Science Club • March 25',
    url: '/events/1'
  },
  {
    id: '2',
    type: 'club',
    title: 'Computer Science Club',
    subtitle: '145 members • Technology',
    url: '/clubs/1'
  },
  {
    id: '3',
    type: 'person',
    title: 'Sarah Johnson',
    subtitle: 'Computer Science • 3rd Year',
    url: '/profile/sarahjohnson'
  },
  {
    id: '4',
    type: 'post',
    title: 'Looking for study partners',
    subtitle: 'Posted 2 hours ago • 12 likes',
    url: '/feed/1'
  },
  {
    id: '5',
    type: 'marketplace',
    title: 'MacBook Pro 2020',
    subtitle: 'UGX 1,200,000 • Electronics',
    url: '/marketplace/1'
  }
]

const typeIcons = {
  event: Calendar,
  club: Users,
  person: User,
  post: MessageSquare,
  marketplace: ShoppingBag
}

const typeColors = {
  event: 'text-blue-600',
  club: 'text-purple-600',
  person: 'text-green-600',
  post: 'text-orange-600',
  marketplace: 'text-red-600'
}

export default function SearchBar({ placeholder = "Search Bugema Hub...", className = "" }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Simulate search API call
  const performSearch = useCallback((searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    // Simulate API delay
    setTimeout(() => {
      const filtered = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered)
    }, 300)
  }, [])

  // Handle query change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length + recentSearches.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0) {
            const allItems = [...recentSearches, ...results]
            const selectedItem = allItems[selectedIndex]
            if (selectedItem) {
              if (typeof selectedItem === 'string') {
                handleSearchSelect(selectedItem)
              } else {
                handleResultClick(selectedItem)
              }
            }
          } else if (query) {
            handleSearch()
          }
          break
        case 'Escape':
          setShowDropdown(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showDropdown, selectedIndex, results, recentSearches, query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExpand = () => {
    setIsExpanded(true)
    inputRef.current?.focus()
  }

  const handleCollapse = () => {
    if (!query) {
      setIsExpanded(false)
      setShowDropdown(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowDropdown(true)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query.trim())
    router.push(result.url)
    setShowDropdown(false)
  }

  const handleSearchSelect = (searchQuery: string) => {
    setQuery(searchQuery)
    inputRef.current?.focus()
  }

  const handleClearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const totalItems = recentSearches.length + results.length

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Bar */}
      <div className={`flex items-center transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-10'
      } bg-white rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500`}>
        {isExpanded && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleCollapse}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 outline-none text-sm"
          />
        )}
        
        <button
          onClick={isExpanded ? handleSearch : handleExpand}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded && query ? (
            <X className="w-5 h-5" onClick={(e: any) => {
              e.stopPropagation()
              setQuery('')
              inputRef.current?.focus()
            }} />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            <div className="overflow-y-auto max-h-96">
              {/* Recent Searches */}
              {query === '' && recentSearches.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={search}
                        onClick={() => handleSearchSelect(search)}
                        className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 text-left transition-colors ${
                          selectedIndex === index ? 'bg-gray-100' : ''
                        }`}
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {query && (
                <div className="p-4">
                  <div className="space-y-1">
                    {results.length > 0 ? (
                      results.map((result, index) => {
                        const Icon = typeIcons[result.type]
                        const globalIndex = recentSearches.length + index
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors ${
                              selectedIndex === globalIndex ? 'bg-gray-100' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${typeColors[result.type]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {result.subtitle}
                              </div>
                            </div>
                          </button>
                        )
                      })
                    ) : query.length >= 2 ? (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No results found for "{query}"</p>
                        <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                      </div>
                    ) : null}
                  </div>

                  {/* See all results link */}
                  {query.length >= 2 && results.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        See all results for "{query}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
