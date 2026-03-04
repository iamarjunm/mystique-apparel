import { createClient } from '@sanity/client'

// Get environment variables - these MUST be set in .env.local
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gukn7o5g'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.NEXT_PUBLIC_SANITY_TOKEN
const apiVersion = '2025-02-27'

// Create the Sanity client with proper configuration
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: token || undefined,
  useCdn: false, // Never use CDN with token (for real-time data)
  apiHost: 'https://api.sanity.io',
  ignoreBrowserTokenWarning: true, // Suppress browser token warning in development
})


// Wrapper functions with proper error handling and logging
export const sanityFetch = async (query, params = {}) => {
  if (!query) {
    throw new Error('GROQ query is required')
  }

  try {
    const result = await client.fetch(query, params)
    return result
  } catch (error) {
    console.error('[SANITY-FETCH] Query failed:', error.message)
    throw new Error(`Sanity fetch failed: ${error.message}`)
  }
}

export const sanityCreate = async (document) => {
  if (!token) {
    throw new Error('Cannot create documents: No authentication token configured')
  }

  if (!document._type) {
    throw new Error('Document must have a _type field')
  }

  try {
    console.log('[SANITY-CREATE] Creating document:', document._type)
    const result = await client.create(document)
    console.log('[SANITY-CREATE] ✓ Document created:', result._id)
    return result
  } catch (error) {
    console.error('[SANITY-CREATE] ✗ Create failed:', error.message)
    console.error('[SANITY-CREATE] Status:', error.statusCode || 'unknown')
    
    // Check for specific error types
    if (error.statusCode === 401) {
      console.error('[SANITY-CREATE] Authentication failed - token may be invalid')
    } else if (error.statusCode === 403) {
      console.error('[SANITY-CREATE] Permission denied - token may not have write access')
    } else if (error.message.includes('network') || error.message.includes('offline')) {
      console.error('[SANITY-CREATE] Network error - check your internet connection')
    }
    
    throw new Error(`Sanity create failed: ${error.message}`)
  }
}

export const sanityPatch = async (documentId, patch) => {
  if (!token) {
    throw new Error('Cannot patch documents: No authentication token configured')
  }

  try {
    console.log('[SANITY-PATCH] Patching document:', documentId)
    const result = await client.patch(documentId).set(patch).commit()
    console.log('[SANITY-PATCH] ✓ Document patched:', result._id)
    return result
  } catch (error) {
    console.error('[SANITY-PATCH] ✗ Patch failed:', error.message)
    throw new Error(`Sanity patch failed: ${error.message}`)
  }
}

// Health check function
export const sanityHealthCheck = async () => {
  try {
    console.log('[SANITY-HEALTH] Running health check...')
    
    // Test connectivity - fetch all userProfile documents and count them
    const query = '*[_type == "userProfile"]'
    const result = await client.fetch(query)
    const count = Array.isArray(result) ? result.length : 0
    
    console.log('[SANITY-HEALTH] ✓ Connection successful')
    console.log('[SANITY-HEALTH] Document count:', count)
    
    return {
      status: 'healthy',
      projectId,
      dataset,
      documentCount: count,
      authenticated: !!token,
    }
  } catch (error) {
    console.error('[SANITY-HEALTH] ✗ Health check failed:', error.message)
    return {
      status: 'unhealthy',
      error: error.message,
      projectId,
      dataset,
      authenticated: !!token,
    }
  }
}

// Export helper to get config
export const getClientConfig = () => ({
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token,
  useCdn: false,
})
