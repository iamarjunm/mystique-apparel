/**
 * Sanity Debug Utility
 * Helps diagnose Sanity connection and authentication issues
 */

export const debugSanity = async () => {
  console.group('[SANITY-DEBUG] Starting Sanity diagnostics...')
  
  try {
    // Check environment variables
    console.log('[SANITY-DEBUG] Environment Variables:')
    console.log('  - NEXT_PUBLIC_SANITY_PROJECT_ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET')
    console.log('  - NEXT_PUBLIC_SANITY_DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET')
    console.log('  - NEXT_PUBLIC_SANITY_TOKEN present:', !!process.env.NEXT_PUBLIC_SANITY_TOKEN)
    
    // Try to import and check client
    const { client } = await import('@/sanity/lib/client')
    console.log('[SANITY-DEBUG] Client imported successfully')
    console.log('[SANITY-DEBUG] Client config:', {
      projectId: client.config().projectId,
      dataset: client.config().dataset,
      useCdn: client.config().useCdn,
      apiVersion: client.config().apiVersion,
      token: !!client.config().token,
    })
    
    // Try a simple fetch
    console.log('[SANITY-DEBUG] Attempting simple fetch...')
    const result = await client.fetch('*[_type == "userProfile"][0...3] { _id, email }')
    console.log('[SANITY-DEBUG] Fetch successful, found', Array.isArray(result) ? result.length : 0, 'documents')
    
    console.groupEnd()
    return { success: true, message: 'Sanity is working properly' }
  } catch (error) {
    console.error('[SANITY-DEBUG] Error:', error.message)
    console.error('[SANITY-DEBUG] Full error:', error)
    console.groupEnd()
    return { success: false, message: error.message, error }
  }
}

// Auto-run on client side in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[SANITY-DEBUG] Debug utility loaded. Call window.debugSanity() in console to run diagnostics.')
  if (typeof window === 'object') {
    window.debugSanity = debugSanity
  }
}
