'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Globe,
  BookOpen,
  MessageSquare,
  FileText,
  Timer,
  LogOut,
  Plus,
  Send,
  Download,
  Heart,
  Share2,
  Star,
  Target,
  Briefcase
} from 'lucide-react'
import { StudyGroup, DiscussionPost, SharedResource, User } from '../types/studyGroups'
import ResponsiveContainer from './ResponsiveContainer'
import { ResponsiveButton } from './ResponsiveForm'
import toast from 'react-hot-toast'

interface StudyGroupDetailProps {
  group: StudyGroup
  currentUser: User
  onJoinGroup: (groupId: string) => void
  onLeaveGroup: (groupId: string) => void
  onPostDiscussion: (groupId: string, content: string) => void
  onReplyToPost: (postId: string, content: string) => void
  onUploadResource: (groupId: string, file: File, title: string, description: string) => void
  onDownloadResource: (resourceId: string) => void
}

export default function StudyGroupDetail({
  group,
  currentUser,
  onJoinGroup,
  onLeaveGroup,
  onPostDiscussion,
  onReplyToPost,
  onUploadResource,
  onDownloadResource
}: StudyGroupDetailProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({})
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({})
  const [timeUntilMeeting, setTimeUntilMeeting] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [newResource, setNewResource] = useState({ title: '', description: '', file: null as File | null })

  // Mock data for demonstration
  const [discussionPosts] = useState<DiscussionPost[]>([
    {
      id: '1',
      groupId: group.id,
      author: {
        id: '2',
        name: 'Alice Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        email: 'alice@example.com',
        course: 'Computer Science',
        year: '3rd Year'
      },
      content: 'Hey everyone! I found some great resources for our upcoming exam. Check the shared resources section!',
      createdAt: '2026-04-23T10:00:00Z',
      replies: [
        {
          id: '1',
          author: {
            id: '3',
            name: 'Bob Smith',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            email: 'bob@example.com',
            course: 'Computer Science',
            year: '3rd Year'
          },
          content: 'Thanks Alice! These are really helpful.',
          createdAt: '2026-04-23T10:30:00Z',
          likes: 3,
          isLiked: false
        }
      ],
      likes: 5,
      isLiked: true
    }
  ])

  const [sharedResources] = useState<SharedResource[]>([
    {
      id: '1',
      groupId: group.id,
      title: 'Chapter 5 Summary Notes',
      description: 'Comprehensive summary of all key concepts from Chapter 5',
      fileUrl: '/files/chapter5-notes.pdf',
      fileName: 'chapter5-notes.pdf',
      fileSize: 2048576,
      uploadedBy: {
        id: '2',
        name: 'Alice Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        email: 'alice@example.com'
      },
      uploadedAt: '2026-04-23T09:00:00Z',
      downloads: 12
    }
  ])

  useEffect(() => {
    // Check if user is a member
    setIsJoined(group.members.some(member => member.id === currentUser.id))
  }, [group.members, currentUser.id])

  useEffect(() => {
    // Calculate time until next meeting
    if (group.nextMeeting) {
      const updateCountdown = () => {
        const now = new Date()
        const meetingTime = new Date(group.nextMeeting!)
        const diff = meetingTime.getTime() - now.getTime()

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setTimeUntilMeeting(`${hours}h ${minutes}m`)
        } else {
          setTimeUntilMeeting('Meeting in progress')
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [group.nextMeeting])

  const handleJoinGroup = () => {
    onJoinGroup(group.id)
    setIsJoined(true)
    toast.success('Successfully joined the study group!')
  }

  const handleLeaveGroup = () => {
    if (confirm('Are you sure you want to leave this study group?')) {
      onLeaveGroup(group.id)
      setIsJoined(false)
      toast.success('You have left the study group')
    }
  }

  const handlePostDiscussion = () => {
    if (newPost.trim()) {
      onPostDiscussion(group.id, newPost)
      setNewPost('')
      toast.success('Post added successfully!')
    }
  }

  const handleReply = (postId: string) => {
    const content = replyContent[postId]
    if (content?.trim()) {
      onReplyToPost(postId, content)
      setReplyContent({ ...replyContent, [postId]: '' })
      setShowReplyForm({ ...showReplyForm, [postId]: false })
      toast.success('Reply added successfully!')
    }
  }

  const handleFileUpload = async () => {
    if (newResource.file && newResource.title) {
      setUploadingFile(true)
      try {
        await onUploadResource(group.id, newResource.file, newResource.title, newResource.description)
        setNewResource({ title: '', description: '', file: null })
        toast.success('Resource uploaded successfully!')
      } finally {
        setUploadingFile(false)
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Group Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {group.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {group.courseName} • {group.courseCode}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{group.department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{group.language}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3">
              {/* Join/Leave Button */}
              {!isJoined ? (
                <ResponsiveButton
                  variant="primary"
                  onClick={handleJoinGroup}
                  disabled={group.currentMembers >= group.maxMembers}
                  className="min-h-11"
                >
                  {group.currentMembers >= group.maxMembers ? 'Group Full' : 'Join Group'}
                </ResponsiveButton>
              ) : (
                <ResponsiveButton
                  variant="secondary"
                  onClick={handleLeaveGroup}
                  className="min-h-11"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </ResponsiveButton>
              )}

              {/* Members Count */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {group.currentMembers}/{group.maxMembers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Members</div>
              </div>
            </div>
          </div>

          {/* Description and Goals */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>
            
            {group.goals.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Goals
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {group.goals.map((goal, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Schedule and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </h4>
              <div className="text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2 mb-1">
                  <span>{group.schedule.days.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{group.schedule.time}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                {group.location.type === 'online' ? (
                  <Video className="w-4 h-4 mr-1" />
                ) : (
                  <MapPin className="w-4 h-4 mr-1" />
                )}
                Location
              </h4>
              <div className="text-gray-600 dark:text-gray-300">
                {group.location.type === 'online' ? (
                  <a
                    href={group.location.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Join Google Meet
                  </a>
                ) : (
                  <span>{group.location.room}</span>
                )}
              </div>
            </div>
          </div>

          {/* Next Meeting Countdown */}
          {group.nextMeeting && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Next Meeting
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {timeUntilMeeting}
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          {group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {group.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Members ({group.members.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    {member.id === group.leader.id && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {member.course} • {member.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Discussion Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Discussion Board
          </h2>

          {isJoined && (
            <div className="mb-6">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with the group..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <ResponsiveButton
                  variant="primary"
                  onClick={handlePostDiscussion}
                  disabled={!newPost.trim()}
                  className="min-h-9"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </ResponsiveButton>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {discussionPosts.map((post) => (
              <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.author.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => setShowReplyForm({ ...showReplyForm, [post.id]: !showReplyForm[post.id] })}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies.length}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {post.replies.length > 0 && (
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              {reply.author.avatar ? (
                                <img
                                  src={reply.author.avatar}
                                  alt={reply.author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <Users className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {reply.author.name}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {showReplyForm[post.id] && isJoined && (
                      <div className="mt-3 pl-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={replyContent[post.id] || ''}
                            onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <ResponsiveButton
                            variant="primary"
                            onClick={() => handleReply(post.id)}
                            disabled={!replyContent[post.id]?.trim()}
                            className="min-h-9"
                          >
                            Reply
                          </ResponsiveButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shared Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Shared Resources
          </h2>

          {isJoined && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Upload Resource</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Resource title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <input
                    type="file"
                    onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    className="flex-1 text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                  <ResponsiveButton
                    variant="primary"
                    onClick={handleFileUpload}
                    disabled={!newResource.file || !newResource.title || uploadingFile}
                    className="min-h-9"
                  >
                    {uploadingFile ? 'Uploading...' : 'Upload'}
                  </ResponsiveButton>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {sharedResources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {resource.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {resource.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Uploaded by {resource.uploadedBy.name}</span>
                      <span>{formatFileSize(resource.fileSize)}</span>
                      <span>{formatDate(resource.uploadedAt)}</span>
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => onDownloadResource(resource.id)}
                  className="min-h-9"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </ResponsiveButton>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </ResponsiveContainer>
  )
}
