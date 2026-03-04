'use client'

import { useEffect, useState } from 'react'

export default function DebugEnv() {
  const [envVars, setEnvVars] = useState({})

  useEffect(() => {
    const vars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? '✓ SET' : '✗ MISSING',
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ? '✓ SET' : '✗ MISSING',
    }

    // Show actual values (masked for security, but helpful for debugging)
    console.log('=== ENVIRONMENT VARIABLES ===')
    Object.entries(vars).forEach(([key, value]) => {
      const envValue = process.env[key]
      console.log(`${key}: ${value}`)
      if (envValue) {
        console.log(`  Length: ${envValue.length}, First 10 chars: ${envValue.substring(0, 10)}...`)
      }
    })

    setEnvVars(vars)
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <p>Check browser console and Vercel logs for more details</p>
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{key}</span>
            <span style={{ color: value.includes('✓') ? 'green' : 'red' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
        <strong>⚠️ Important:</strong>
        <ul>
          <li>All NEXT_PUBLIC_* variables should show ✓ SET</li>
          <li>If any show ✗ MISSING, add them to Vercel dashboard under Settings → Environment Variables</li>
          <li>Make sure variable names are EXACT (case-sensitive)</li>
          <li>Redeploy after adding variables</li>
        </ul>
      </div>
    </div>
  )
}
