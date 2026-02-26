'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
  photoURL: string | null
  addresses?: Array<{
    id: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    isPrimary: boolean
  }>
}

interface AuthContextType {
  user: FirebaseUser | null
  userData: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserData>) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        return userDoc.data() as UserData
      }
      return null
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser.uid)
        setUserData(data)
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName,
        phoneNumber: null,
        photoURL: null,
        addresses: [],
        createdAt: new Date().toISOString(),
      })

      // Refresh user data
      const data = await fetchUserData(user.uid)
      setUserData(data)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUserData(null)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Update user profile
  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in')

    try {
      // Update Firebase Auth profile
      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName })
      }

      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, data)

      // Refresh user data
      const updatedData = await fetchUserData(user.uid)
      setUserData(updatedData)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Manually refresh user data
  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user.uid)
      setUserData(data)
    }
  }

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
