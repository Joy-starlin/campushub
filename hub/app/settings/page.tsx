import SettingsPage from '../components/SettingsPage'

// Mock settings data - in a real app, this would come from an API
const mockSettingsData = {
  name: 'John Doe',
  bio: 'Computer Science student passionate about technology and innovation.',
  university: 'Bugema University',
  course: 'Computer Science',
  year: '3rd Year',
  email: 'john.doe@bugema.ac.ug',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  profileVisibility: 'everyone' as const,
  language: 'en'
}

export default function Settings() {
  const handleSave = (data: any) => {
    console.log('Save settings:', data)
  }

  const handleDeleteAccount = (password: string) => {
    console.log('Delete account with password:', password)
  }

  return (
    <SettingsPage
      initialData={mockSettingsData}
      onSave={handleSave}
      onDeleteAccount={handleDeleteAccount}
    />
  )
}
