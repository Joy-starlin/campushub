import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

import { getAnalytics, isSupported } from 'firebase/analytics'
 
 // Initialize Firebase
 const app = initializeApp(firebaseConfig)
 
 // Initialize Firebase services
 export const auth = getAuth(app)
 export const db = getFirestore(app)
 export const realtimeDb = getDatabase(app)
 
 // Initialize Analytics safely (only in browser)
 export const initAnalytics = async () => {
   if (typeof window !== 'undefined') {
     const supported = await isSupported()
     if (supported) {
       return getAnalytics(app)
     }
   }
   return null
 }

// Set auth persistence
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error)
})

export default app
