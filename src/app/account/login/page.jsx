'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInModal } from '@/components/GoogleSignInModal'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[LOGIN-PAGE] Starting email login for:', email)

    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }
    if (!password) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }

    const timeout = setTimeout(() => {
      console.error('[LOGIN-PAGE] Email login timeout after 15 seconds')
      setError('Sign-in took too long. Please check your connection and try again.')
      setLoading(false)
    }, 15000)

    try {
      console.log('[LOGIN-PAGE] Calling signIn function...')
      await signIn(email, password)
      clearTimeout(timeout)
      console.log('[LOGIN-PAGE] Sign-in successful, redirecting to account')
      router.push('/account')
    } catch (err) {
      clearTimeout(timeout)
      console.error('[LOGIN-PAGE] Email login error:', err)
      
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.')
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials and try again.')
      }
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    setShowGoogleModal(true)
    console.log('[LOGIN-PAGE] Google button clicked, showing modal')

    const timeout = setTimeout(() => {
      console.error('[LOGIN-PAGE] Google login timeout after 30 seconds')
      setError('Google sign-in took too long. The popup may have been blocked. Please try again.')
      setShowGoogleModal(false)
      setLoading(false)
    }, 30000)

    try {
      console.log('[LOGIN-PAGE] Calling signInWithGoogle function...')
      const result = await signInWithGoogle()
      clearTimeout(timeout)
      console.log('[LOGIN-PAGE] Sign-in successful:', result)
      // Redirect immediately after auth succeeds (Sanity syncs in background)
      setShowGoogleModal(false)
      console.log('[LOGIN-PAGE] Modal closed, redirecting to account')
      router.push('/account')
    } catch (err) {
      clearTimeout(timeout)
      console.error('[LOGIN-PAGE] Google login error:', err)
      
      // Provide user-friendly error messages
      if (err.message?.includes('popup-blocked')) {
        setError('Popup was blocked by your browser. Please allow popups and try again.')
      } else if (err.message?.includes('cancelled')) {
        setError('Sign-in was cancelled. Please try again.')
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.')
      }
      setShowGoogleModal(false)
      setLoading(false)
    }
  }

  return (
    <>
      <GoogleSignInModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black text-white relative">
        {/* Dark Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-100"></div>

        {/* Main Content Area */}
        <div className="relative w-full max-w-md p-6 md:p-8 z-10">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            Welcome Back
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 border border-gray-600 rounded-lg font-medium text-white hover:bg-gray-900 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {showGoogleModal ? 'Opening Google...' : 'Sign in with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/account/register" className="text-white hover:text-gray-300 font-medium underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              <Link href="/account/forgot-password" className="text-white hover:text-gray-300 font-medium underline">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
