'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role: 'member' | 'moderator' | 'admin'
  university?: string
  course?: string
  year?: string
  isProfileComplete: boolean
  isVerified: boolean
  createdAt: Date
  lastLoginAt: Date
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Convert Firebase user to our User interface
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData.displayName,
          photoURL: firebaseUser.photoURL || userData.photoURL,
          role: userData.role || 'member',
          university: userData.university,
          course: userData.course,
          year: userData.year,
          isProfileComplete: userData.isProfileComplete || false,
          isVerified: userData.isVerified || false,
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLoginAt: new Date()
        }
      } else {
        // New user, create basic profile
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          role: 'member',
          isProfileComplete: false,
          isVerified: false,
          createdAt: new Date(),
          lastLoginAt: new Date()
        }

        // Save to Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        })

        return newUser
      }
    } catch (error) {
      console.error('Error converting Firebase user:', error)
      return null
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        const userData = await convertFirebaseUser(firebaseUser)
        setUser(userData)
        
        // Update last login
        if (userData) {
          try {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLoginAt: serverTimestamp()
            })
          } catch (error) {
            console.error('Error updating last login:', error)
          }
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // User will be set by the onAuthStateChanged listener
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      const firebaseError = error as { code?: string }
      throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'))
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // User will be set by the onAuthStateChanged listener
    } catch (error: unknown) {
      console.error('Sign up error:', error)
      const firebaseError = error as { code?: string }
      throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'))
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      throw new Error('Failed to sign out')
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      // User will be set by the onAuthStateChanged listener
    } catch (error: unknown) {
      console.error('Google sign in error:', error)
      const firebaseError = error as { code?: string }
      throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'))
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: unknown) {
      console.error('Reset password error:', error)
      const firebaseError = error as { code?: string }
      throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'))
    }
  }

  const updateUserPassword = async (newPassword: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in')
      }
      await updatePassword(auth.currentUser, newPassword)
    } catch (error: unknown) {
      console.error('Update password error:', error)
      const firebaseError = error as { code?: string }
      throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'))
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user is currently signed in')
      }

      const updateData = {
        ...data,
        lastLoginAt: serverTimestamp()
      }

      await updateDoc(doc(db, 'users', user.uid), updateData)
      
      // Refresh user data
      await refreshUser()
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw new Error('Failed to update profile')
    }
  }

  const refreshUser = async () => {
    if (!auth.currentUser) return
    
    const userData = await convertFirebaseUser(auth.currentUser)
    setUser(userData)
  }

  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Please enter a valid email address'
      case 'auth/user-disabled':
        return 'This account has been disabled'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action'
      default:
        return 'An error occurred. Please try again'
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword: updateUserPassword,
    updateUserProfile,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
