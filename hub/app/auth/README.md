# Bugema Hub Authentication System

A complete authentication system for Bugema Hub built with Next.js, Firebase Auth, react-hook-form, and zod validation.

## Features

### 🔐 **Authentication Methods**
- **Email/Password**: Traditional sign in with email and password
- **Google Sign-In**: One-click authentication with Google
- **Password Reset**: Secure password recovery via email

### 🛡️ **Security Features**
- **Firebase Auth**: Industry-standard authentication
- **Zod Validation**: Client-side form validation
- **Role-Based Access**: Member, Moderator, Admin roles
- **Protected Routes**: Automatic redirection based on auth status
- **Session Persistence**: Local storage for persistent sessions

### 📱 **User Experience**
- **Responsive Design**: Mobile-first approach
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Toast notifications for actions
- **Profile Completion**: Onboarding for new users

## Pages & Routes

### `/auth/login`
- Email and password sign in
- "Continue with Google" button
- "Forgot password?" link
- Redirects to dashboard on success
- Responsive design with proper touch targets

### `/auth/signup`
- Signup options page
- Email signup option
- Google signup option
- Feature highlights
- Redirects to signup flow

### `/auth/forgot-password`
- Email input for password reset
- Sends reset link via Firebase
- Success confirmation screen
- Instructions for next steps

### `/auth/reset-password`
- New password and confirm fields
- Zod validation with password requirements
- Success confirmation screen
- Redirect to login after success

### `/auth/complete-profile`
- Required for first-time Google users
- Collects university, course, year
- Profile completion flow
- Redirects to dashboard after completion

## Components

### AuthContext
Global authentication state management using React Context.

```tsx
import { useAuth } from '../contexts/AuthContext'

const { user, loading, signIn, signUp, signOut } = useAuth()
```

### ProtectedRoute
Higher-order component for protecting routes based on authentication and role.

```tsx
import ProtectedRoute from '../components/ProtectedRoute'

// Basic protection
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Admin-only protection
<ProtectedRoute requireAdmin>
  <AdminPanel />
</ProtectedRoute>
```

### useAuth Hook
Custom hook for accessing authentication state and methods.

```tsx
const {
  user,           // Current user object
  loading,        // Loading state
  signIn,         // Email/password sign in
  signUp,         // Email/password sign up
  signOut,        // Sign out
  signInWithGoogle, // Google sign in
  resetPassword,  // Send reset email
  updatePassword, // Update password
  updateUserProfile, // Update user profile
  refreshUser     // Refresh user data
} = useAuth()
```

## User Object Structure

```typescript
interface User {
  uid: string                    // Firebase UID
  email: string                  // User email
  displayName?: string           // Display name
  photoURL?: string              // Profile photo URL
  role: 'member' | 'moderator' | 'admin'  // User role
  university?: string            // University
  course?: string                // Course of study
  year?: string                  // Academic year
  isProfileComplete: boolean     // Profile completion status
  createdAt: Date                // Account creation date
  lastLoginAt: Date              // Last login date
}
```

## Validation Schemas

### Login Schema
```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})
```

### Reset Password Schema
```typescript
const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})
```

### Complete Profile Schema
```typescript
const completeProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  university: z.string().min(2, 'Please enter your university'),
  course: z.string().min(2, 'Please enter your course'),
  year: z.string().min(1, 'Please select your year')
})
```

## Firebase Configuration

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google providers
3. Enable Firestore for user data storage
4. Copy configuration to environment variables
5. Set up authorized domains for deployment

## Usage Examples

### Protecting a Page
```tsx
// app/dashboard/page.tsx
import ProtectedRoute from '../components/ProtectedRoute'
import Dashboard from '../components/Dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
```

### Admin-Only Page
```tsx
// app/admin/page.tsx
import ProtectedRoute from '../components/ProtectedRoute'
import AdminPanel from '../components/admin/AdminPanel'

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPanel />
    </ProtectedRoute>
  )
}
```

### Using Auth in Components
```tsx
import { useAuth } from '../contexts/AuthContext'

export default function UserProfile() {
  const { user, signOut, updateUserProfile } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect handled by ProtectedRoute
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleUpdateProfile = async (data) => {
    try {
      await updateUserProfile(data)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <h1>Welcome, {user?.displayName}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
```

### App Provider Setup
```tsx
// app/layout.tsx
import { AuthProvider } from '../contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Error Handling

### Authentication Errors
- User-friendly error messages
- Toast notifications for feedback
- Proper validation feedback
- Network error handling

### Common Error Messages
- "No account found with this email address"
- "Incorrect password. Please try again"
- "An account with this email already exists"
- "Password should be at least 6 characters"
- "Please enter a valid email address"
- "Too many attempts. Please try again later"

## Security Features

### Password Requirements
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Session Management
- Firebase Auth persistence
- Automatic token refresh
- Secure session handling
- Logout on all devices option

### Role-Based Access
- Member: Basic access
- Moderator: Content moderation
- Admin: Full administrative access
- Automatic role checking

## Mobile Responsiveness

### Touch Targets
- Minimum 44x44px for all interactive elements
- Proper spacing between elements
- Touch-friendly form inputs

### Responsive Design
- Mobile-first approach
- Proper viewport handling
- Optimized for all screen sizes
- Smooth animations and transitions

## Testing

### Authentication Flow Testing
1. Test email/password sign up and sign in
2. Test Google Sign-In flow
3. Test password reset functionality
4. Test protected route redirection
5. Test role-based access control
6. Test profile completion flow

### Error Testing
1. Test invalid email formats
2. Test weak passwords
3. Test mismatched passwords
4. Test network errors
5. Test expired reset links

## Deployment Considerations

### Firebase Configuration
- Update authorized domains
- Configure email templates
- Set up custom domains
- Enable security rules

### Environment Variables
- Set all required environment variables
- Use secure configuration management
- Test in staging environment
- Monitor authentication metrics

## Future Enhancements

### Planned Features
- Multi-factor authentication
- Social login providers (Facebook, Apple)
- Email verification
- Account deletion
- Session management dashboard
- Advanced role permissions
- Audit logging

### Performance Optimizations
- Lazy loading auth components
- Optimized bundle size
- Caching strategies
- Error boundary implementation

## Support

For authentication-related issues:
1. Check Firebase console configuration
2. Verify environment variables
3. Review browser console errors
4. Test network connectivity
5. Check Firebase security rules

This authentication system provides a secure, user-friendly, and scalable foundation for Bugema Hub's user management needs.
