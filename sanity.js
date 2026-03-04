import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

console.log('🔧 [SANITY] Initializing Sanity client...')
console.log('🔧 [SANITY] Config:', {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27',
  hasToken: !!process.env.NEXT_PUBLIC_SANITY_TOKEN,
  tokenLength: process.env.NEXT_PUBLIC_SANITY_TOKEN?.length,
})

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27',
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  useCdn: false,
})

console.log('✅ [SANITY] Client initialized successfully')

const builder = createImageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)

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