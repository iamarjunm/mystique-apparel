import { client } from '@/sanity'

export async function GET(req) {
  try {
    console.log('[API] Fetching all users from Sanity...')

    // Fetch all user profiles with all relevant fields
    const users = await client.fetch(`
      *[_type == "userProfile"] | order(createdAt desc) {
        _id,
        email,
        displayName,
        phoneNumber,
        firebaseUid,
        addresses,
        authProvider,
        isAdmin,
        createdAt
      }
    `)

    console.log(`[API] ✅ Fetched ${users.length} users`)

    return new Response(
      JSON.stringify({
        success: true,
        users,
        count: users.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('[API] Error fetching users:', error.message)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch users',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
