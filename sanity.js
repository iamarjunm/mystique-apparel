import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27'
const token = process.env.NEXT_PUBLIC_SANITY_TOKEN

const hasValidConfig = Boolean(projectId && dataset)

// Only log in browser environment, not during build
if (typeof window !== 'undefined') {
  console.log('🔧 [SANITY] Initializing Sanity client...')
  console.log('🔧 [SANITY] Config:', {
    projectId,
    dataset,
    apiVersion,
    hasToken: !!token,
    tokenLength: token?.length,
    hasValidConfig,
  })
}

function createMissingConfigError() {
  return new Error(
    'Sanity client is not configured. Missing NEXT_PUBLIC_SANITY_PROJECT_ID and/or NEXT_PUBLIC_SANITY_DATASET.'
  )
}

const internalClient = hasValidConfig
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  : null

if (typeof window !== 'undefined' && internalClient) {
  console.log('✅ [SANITY] Client initialized successfully')
} else if (typeof window !== 'undefined') {
  console.warn('⚠️ [SANITY] Client not initialized: missing environment variables')
}

export const client = {
  fetch: (...args) => {
    if (!internalClient) throw createMissingConfigError()
    return internalClient.fetch(...args)
  },
  create: (...args) => {
    if (!internalClient) throw createMissingConfigError()
    return internalClient.create(...args)
  },
  patch: (...args) => {
    if (!internalClient) throw createMissingConfigError()
    return internalClient.patch(...args)
  },
  delete: (...args) => {
    if (!internalClient) throw createMissingConfigError()
    return internalClient.delete(...args)
  },
}

const builder = internalClient ? createImageUrlBuilder(internalClient) : null
export const urlFor = (source) => {
  if (!builder) return null
  return builder.image(source)
}

export async function syncUserProfile(userData) {
  console.log('👤 [SANITY] syncUserProfile called with:', {
    firebaseUid: userData.firebaseUid,
    email: userData.email,
    displayName: userData.displayName,
    hasPhoneNumber: !!userData.phoneNumber,
    addressesCount: userData.addresses?.length || 0,
    authProvider: userData.authProvider,
  })

  if (!userData.firebaseUid || !userData.email || !userData.displayName) {
    console.error('❌ [SANITY] Missing required fields:', {
      hasFirebaseUid: !!userData.firebaseUid,
      hasEmail: !!userData.email,
      hasDisplayName: !!userData.displayName,
    })
    throw new Error('firebaseUid, email, and displayName are required')
  }

  const now = new Date().toISOString()
  const addresses = Array.isArray(userData.addresses) 
    ? userData.addresses.map((addr, idx) => ({
        ...addr,
        _key: addr._key || `address-${Date.now()}-${idx}` // Add unique _key if missing
      }))
    : []
  const authProvider = userData.authProvider || 'email'

  console.log('🔍 [SANITY] Checking for existing user...')
  const existingUser = await client.fetch(
    `*[_type == "userProfile" && firebaseUid == $firebaseUid][0]`,
    { firebaseUid: userData.firebaseUid }
  )
  console.log('🔍 [SANITY] Existing user found:', !!existingUser, existingUser?._id)

  if (!existingUser) {
    console.log('➕ [SANITY] Creating new user profile...')
    const newUser = await client.create({
      _type: 'userProfile',
      firebaseUid: userData.firebaseUid,
      email: userData.email,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber || null,
      addresses,
      authProvider,
      createdAt: now,
      updatedAt: now,
    })
    console.log('✅ [SANITY] User profile created:', newUser._id)
    return newUser
  }

  const updates = {}
  if (userData.displayName && userData.displayName !== existingUser.displayName) {
    updates.displayName = userData.displayName
  }
  if ((userData.phoneNumber || null) !== (existingUser.phoneNumber || null)) {
    updates.phoneNumber = userData.phoneNumber || null
  }
  if (Array.isArray(addresses)) {
    updates.addresses = addresses
  }
  if (authProvider !== existingUser.authProvider) {
    updates.authProvider = authProvider
  }

  if (Object.keys(updates).length === 0) {
    console.log('ℹ️  [SANITY] No updates needed for user:', existingUser._id)
    return existingUser
  }

  console.log('🔄 [SANITY] Updating user profile with:', updates)
  updates.updatedAt = now
  const updatedUser = await client.patch(existingUser._id).set(updates).commit()
  console.log('✅ [SANITY] User profile updated:', updatedUser._id)
  return updatedUser
}