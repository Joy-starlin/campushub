import UserProfilePage from '../../../components/UserProfilePage'

// Mock user data - in a real app, this would come from an API
const mockUser = {
  id: '1',
  username: 'sarahjohnson',
  name: 'Sarah Johnson',
  university: 'Bugema University',
  course: 'Computer Science',
  year: '3rd Year',
  bio: 'Passionate about technology and innovation. President of the Computer Science Club. Love coding, photography, and making new friends! 🚀',
  profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1200&h=400&fit=crop',
  isVerified: true,
  stats: {
    posts: 42,
    clubsJoined: 3,
    eventsAttended: 15,
    followers: 156,
    following: 89
  },
  isOwnProfile: false,
  isFollowing: false
}

export default function Profile() {
  const handleFollow = () => {
    console.log('Follow user')
  }

  const handleUnfollow = () => {
    console.log('Unfollow user')
  }

  const handleMessage = () => {
    console.log('Message user')
  }

  const handleEditProfile = () => {
    console.log('Edit profile')
  }

  return (
    <UserProfilePage
      user={mockUser}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
      onMessage={handleMessage}
      onEditProfile={handleEditProfile}
    />
  )
}
