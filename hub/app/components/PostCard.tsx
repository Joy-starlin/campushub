'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Share2, Bookmark, Image as ImageIcon } from 'lucide-react'

interface Post {
  id: string
  author: {
    name: string
    role: string
    avatar?: string
  }
  category: 'Event' | 'News' | 'Club' | 'Market' | 'Job' | 'Lost&Found'
  title: string
  description: string
  image?: string
  createdAt: Date
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
}

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
  onBookmark: (postId: string) => void
}

const categoryColors = {
  Event: 'bg-blue-100 text-blue-800',
  News: 'bg-red-100 text-red-800',
  Club: 'bg-purple-100 text-purple-800',
  Market: 'bg-green-100 text-green-800',
  Job: 'bg-yellow-100 text-yellow-800',
  'Lost&Found': 'bg-orange-100 text-orange-800'
}

export default function PostCard({ post, onLike, onComment, onShare, onBookmark }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
    onLike(post.id)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark(post.id)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Author Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
              {getInitials(post.author.name)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
            <p className="text-sm text-gray-500">{post.author.role}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
        </span>
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[post.category]}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
      <p className="text-gray-600 line-clamp-3 mb-4">
        {post.description}
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer ml-1">Read more</span>
      </p>

      {/* Image */}
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover lazyload"
            loading="lazy"
          />
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </motion.button>

          <button
            onClick={() => onComment(post.id)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments}</span>
          </button>

          <button
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}
