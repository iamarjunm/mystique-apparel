'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { client, syncUserProfile } from '../../sanity'

// Lazy load Firebase auth - only on client side
let auth = null
if (typeof window !== 'undefined') {
  const { auth: firebaseAuth } = require('../../firebase')
  auth = firebaseAuth
}

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data from Sanity
  const fetchUserData = async (uid, email) => {
    console.log('[AUTH-FETCH] Fetching user data from Sanity for UID:', uid)
    try {
      const query = `*[_type == "userProfile" && firebaseUid == $uid][0]{
        _id,
        firebaseUid,
        email,
        displayName,
        phoneNumber,
        addresses,
        authProvider,
        isAdmin
      }`
      
      const userData = await client.fetch(query, { uid })
      
      if (userData) {
        console.log('[AUTH-FETCH] ✅ User profile found in Sanity:', userData.email)
        return {
          uid: userData.firebaseUid,
          email: userData.email,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber,
          photoURL: null,
          addresses: userData.addresses || [],
          isAdmin: userData.isAdmin || false,
        }
      }
      
      console.log('[AUTH-FETCH] ⚠️  User profile not found in Sanity')
      return null
    } catch (error) {
      console.error('[AUTH-FETCH] ❌ Error fetching user data:', error.message)
      return null
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    // Skip if Firebase auth is not available
    if (!auth) {
      console.warn('[AUTH] Firebase not initialized - auth is null')
      setLoading(false)
      return
    }

    console.log('[AUTH] Setting up auth state listener...')
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('[AUTH] Auth state changed:', firebaseUser ? firebaseUser.email : 'no user')
        setUser(firebaseUser)
        
        if (firebaseUser) {
          console.log('[AUTH] User logged in, fetching data from Sanity...')
          const data = await fetchUserData(firebaseUser.uid, firebaseUser.email)
          setUserData(data)
          console.log('[AUTH] User data loaded from Sanity')
        } else {
          console.log('[AUTH] No user logged in')
          setUserData(null)
        }
        
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error('[AUTH] Error setting up auth listener:', error.message)
      setLoading(false)
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email, password) => {
    console.log('[AUTH] Starting email sign-in for:', email)
    if (!auth) {
      throw new Error('Firebase auth not initialized. Check NEXT_PUBLIC_FIREBASE_* environment variables.')
    }
    try {
      console.log('[AUTH] Calling Firebase signInWithEmailAndPassword...')
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('[AUTH] ✅ Firebase authentication successful')

      // Check if Sanity profile exists
      console.log('[AUTH] Checking Sanity profile...')
      const data = await fetchUserData(user.uid, user.email)
      
      if (!data) {
        console.warn('[AUTH] ⚠️  No Sanity profile found, creating one...')
        try {
          // Create profile if it doesn't exist
          await syncUserProfile({
            firebaseUid: user.uid,
            email: user.email,
            displayName: user.displayName || email.split('@')[0],
            authProvider: 'email',
            phoneNumber: user.phoneNumber || null,
            addresses: [],
          })
          console.log('[AUTH] ✅ Sanity profile created')
          
          // Fetch the newly created profile
          const newData = await fetchUserData(user.uid, user.email)
          setUserData(newData)
        } catch (sanityError) {
          console.error('[AUTH] ⚠️  Sanity profile creation failed:', sanityError.message)
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || email.split('@')[0],
            photoURL: null,
          })
        }
      } else {
        setUserData(data)
        console.log('[AUTH] ✅ Sanity profile verified')
      }

      console.log('[AUTH] Sign-in complete')
    } catch (error) {
      console.error('[AUTH] ❌ Sign-in error:', error.code, error.message)
      throw new Error(error.message)
    }
  }

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    console.log('[AUTH] Starting email sign-up for:', email)
    if (!auth) {
      throw new Error('Firebase auth not initialized. Please refresh the page.')
    }
    try {
      console.log('[AUTH] Creating Firebase user account...')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('[AUTH] ✅ User account created with ID:', user.uid)

      // Update Firebase profile with display name
      console.log('[AUTH] Updating Firebase profile...')
      await updateProfile(user, { displayName })
      console.log('[AUTH] ✅ Firebase profile updated')

      // Create user profile in Sanity directly
      console.log('[SANITY] Creating user profile...')
      await syncUserProfile({
        firebaseUid: user.uid,
        email: user.email,
        displayName,
        authProvider: 'email',
        phoneNumber: null,
        addresses: [],
      })
      console.log('[SANITY] ✅ Profile created')

      // Fetch user data from Sanity
      console.log('[AUTH] Fetching user data from Sanity...')
      const data = await fetchUserData(user.uid, user.email)
      setUserData(data)
      console.log('[AUTH] ✅ Sign-up complete')
    } catch (error) {
      console.error('[AUTH] ❌ Sign-up error:', error.code, error.message)
      throw new Error(error.message)
    }
  }

  // Google Sign-In
  const signInWithGoogle = async () => {
    console.log('[AUTH] Starting Google Sign-In...')
    if (!auth) {
      throw new Error('Firebase auth not initialized. Please refresh the page.')
    }
    try {
      console.log('[AUTH] Creating Google provider')
      const googleProvider = new GoogleAuthProvider()
      
      console.log('[AUTH] Opening sign-in popup')
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      console.log('[AUTH] ✅ Google auth successful:', user.email)

      // Check if Sanity profile exists, create if not
      console.log('[SANITY] Checking Sanity profile...')
      let data = await fetchUserData(user.uid, user.email)
      
      if (!data) {
        console.log('[SANITY] Creating new Sanity profile')
        await syncUserProfile({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          authProvider: 'google',
          phoneNumber: user.phoneNumber || null,
          addresses: [],
        })
        console.log('[SANITY] ✅ Profile created')
        
        // Fetch the newly created profile
        data = await fetchUserData(user.uid, user.email)
      } else {
        console.log('[SANITY] ✅ Profile already exists')
      }

      setUserData(data)
      console.log('[AUTH] ✅ Google Sign-In complete')
      return { success: true }
    } catch (error) {
      console.error('[AUTH] ❌ Google Sign-In failed:', error.code, error.message)
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site.')
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled.')
      }
      
      throw new Error(error.message || 'Failed to sign in with Google')
    }
  }

  // Sign out
  const signOut = async () => {
    console.log('[AUTH] Starting sign-out...')
    if (!auth) {
      setUserData(null)
      return
    }
    try {
      console.log('[AUTH] Calling Firebase signOut...')
      await firebaseSignOut(auth)
      console.log('[AUTH] Firebase sign-out successful')
      setUserData(null)
      console.log('[AUTH] User data cleared, sign-out complete')
    } catch (error) {
      console.error('[AUTH] Sign-out error:', error.message)
      throw new Error(error.message)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    console.log('[AUTH] Resetting password for:', email)
    if (!auth) {
      throw new Error('Firebase auth not initialized. Please refresh the page.')
    }
    try {
      console.log('[AUTH] Sending password reset email...')
      await sendPasswordResetEmail(auth, email)
      console.log('[AUTH] Password reset email sent')
    } catch (error) {
      console.error('[AUTH] Password reset error:', error.message)
      throw new Error(error.message)
    }
  }

  // Update user profile
  const updateUserProfile = async (data) => {
    if (!user) throw new Error('No user logged in')
    if (!auth) throw new Error('Firebase auth not initialized')

    console.log('[AUTH] Updating user profile in Sanity...')
    try {
      if (data.displayName) {
        console.log('[AUTH] Updating Firebase displayName...')
        await updateProfile(user, { displayName: data.displayName })
      }

      console.log('[SANITY] Updating Sanity profile...')
      await syncUserProfile({
        firebaseUid: user.uid,
        email: user.email,
        displayName: data.displayName || userData?.displayName,
        authProvider: userData?.authProvider || 'email',
        phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : userData?.phoneNumber,
        addresses: data.addresses || userData?.addresses || [],
      })
      console.log('[SANITY] ✅ Profile updated')

      const updatedData = await fetchUserData(user.uid, user.email)
      setUserData(updatedData)
      console.log('[AUTH] ✅ Profile update complete')
    } catch (error) {
      console.error('[AUTH] ❌ Profile update error:', error.message)
      throw new Error(error.message)
    }
  }

  // Manually refresh user data
  const refreshUserData = async () => {
    if (user) {
      console.log('[AUTH] Refreshing user data from Sanity...')
      const data = await fetchUserData(user.uid, user.email)
      setUserData(data)
      console.log('[AUTH] ✅ User data refreshed')
    }
  }

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
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
