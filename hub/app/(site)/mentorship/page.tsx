'use client'

import { useState } from 'react'
import MentorshipFeature from '../../components/MentorshipFeature'
import { MentorshipRequest, MentorshipSession } from '../../types/alumni'
import toast from 'react-hot-toast'

// Mock Data for Mentors
const mockMentors = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    description: 'Passionate about technology and mentoring the next generation of developers.',
    areas: ['career', 'technical'],
    mentorshipCount: 15,
    rating: '4.9'
  },
  {
    id: '2',
    name: 'Michael Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    description: 'Tech leader with 10+ years helping startups scale their engineering teams.',
    areas: ['entrepreneurship', 'leadership'],
    mentorshipCount: 8,
    rating: '4.8'
  },
  {
    id: '3',
    name: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    description: 'Research scientist specializing in ML and AI. Always happy to guide students in academic research.',
    areas: ['research', 'academic'],
    mentorshipCount: 24,
    rating: '5.0'
  }
]

// Mock Data for Requests
const initialRequests: MentorshipRequest[] = [
  {
    id: 'req1',
    mentorId: '1',
    menteeId: 'me123',
    status: 'pending',
    message: 'Hello, I would like to get some advice on your career journey.',
    requestedAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'req2',
    mentorId: '2',
    menteeId: 'me123',
    status: 'accepted',
    message: 'Hi Michael, seeking guidance on starting a tech business.',
    requestedAt: '2023-09-15T14:30:00Z',
    updatedAt: '2023-09-16T09:00:00Z',
    scheduledSession: {
      id: 'sess1',
      mentorshipRequestId: 'req2',
      title: 'Introductory Mentorship Session',
      description: 'Discussing your startup ideas and overall roadmap',
      scheduledAt: '2023-11-20T10:00:00Z',
      duration: 60,
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      status: 'scheduled',
      createdAt: '2023-09-16T09:15:00Z'
    }
  },
  {
    id: 'req3',
    mentorId: '3',
    menteeId: 'me123',
    status: 'completed',
    message: 'Looking for advice on AI research methodologies.',
    requestedAt: '2023-08-01T10:00:00Z',
    updatedAt: '2023-08-15T15:00:00Z',
    scheduledSession: {
      id: 'sess2',
      mentorshipRequestId: 'req3',
      title: 'Research Methodologies Discussion',
      description: 'Review of current trends and publication strategies',
      scheduledAt: '2023-08-10T09:00:00Z',
      duration: 45,
      meetingUrl: 'https://meet.google.com/xyz-uvw-rst',
      status: 'completed',
      createdAt: '2023-08-02T10:00:00Z'
    }
  }
]

export default function MentorshipPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>(initialRequests)

  const handleRequestMentorship = (mentorId: string, message: string) => {
    toast.success('Mentorship requested!')
    const newReq: MentorshipRequest = {
      id: `req${Date.now()}`,
      mentorId,
      menteeId: 'me123',
      status: 'pending',
      message: message,
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setRequests([newReq, ...requests])
  }

  const handleRespondToRequest = (requestId: string, status: 'accepted' | 'declined', responseMessage?: string) => {
    toast.success(`Request ${status}`)
    setRequests(requests.map(req => req.id === requestId ? { ...req, status, updatedAt: new Date().toISOString() } : req))
  }

  const handleScheduleSession = (requestId: string, session: Omit<MentorshipSession, 'id' | 'mentorshipRequestId' | 'createdAt'>) => {
    toast.success('Session scheduled successfully!')
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          scheduledSession: {
            ...session,
            id: `sess${Date.now()}`,
            mentorshipRequestId: requestId,
            createdAt: new Date().toISOString()
          }
        }
      }
      return req
    }))
  }

  return (
    <>
      <MentorshipFeature
        mentorshipAreas={mockMentors}
        mentorshipRequests={requests}
        onRequestMentorship={handleRequestMentorship}
        onRespondToRequest={handleRespondToRequest}
        onScheduleSession={handleScheduleSession}
      />
    </>
  )
}



