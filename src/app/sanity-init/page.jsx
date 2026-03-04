'use client'

import { useEffect, useState } from 'react'
import { sanityHealthCheck, getClientConfig } from '@/sanity/lib/client'

export default function SanityInitPage() {
  const [status, setStatus] = useState('loading')
  const [config, setConfig] = useState(null)
  const [health, setHealth] = useState(null)
  const [envVars, setEnvVars] = useState({})

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get client config
        const cfg = getClientConfig()
        setConfig(cfg)
        console.log('[INIT-PAGE] Client config:', cfg)

        // Get environment variables
        const env = {
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
          tokenPresent: !!process.env.NEXT_PUBLIC_SANITY_TOKEN,
        }
        setEnvVars(env)
        console.log('[INIT-PAGE] Environment:', env)

        // Run health check
        const healthResult = await sanityHealthCheck()
        setHealth(healthResult)
        console.log('[INIT-PAGE] Health check:', healthResult)

        if (healthResult.status === 'healthy') {
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('[INIT-PAGE] Initialization error:', error)
        setStatus('error')
        setHealth({ status: 'error', error: error.message })
      }
    }

    initialize()
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Sanity Initialization</h1>
          <p className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusIcon()} {status === 'loading' ? 'Checking...' : status === 'success' ? 'Healthy' : 'Error'}
          </p>
        </div>

        {/* Client Configuration */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚙️</span> Client Configuration
          </h2>
          {config ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 text-sm">Project ID</p>
                <p className="text-green-400 font-mono">{config.projectId}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 text-sm">Dataset</p>
                <p className="text-green-400 font-mono">{config.dataset}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 text-sm">API Version</p>
                <p className="text-green-400 font-mono">{config.apiVersion}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 text-sm">Token</p>
                <p className={`font-mono ${config.hasToken ? 'text-green-400' : 'text-red-400'}`}>
                  {config.hasToken ? '✓ Configured' : '✗ Not configured'}
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 text-sm">Use CDN</p>
                <p className="text-yellow-400 font-mono">{String(config.useCdn)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Loading configuration...</p>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔑</span> Environment Variables
          </h2>
          <div className="space-y-3">
            <div className="bg-gray-900 p-4 rounded flex justify-between items-center">
              <p className="text-gray-300">NEXT_PUBLIC_SANITY_PROJECT_ID</p>
              <p className={`font-mono ${envVars.projectId ? 'text-green-400' : 'text-red-400'}`}>
                {envVars.projectId ? '✓' : '✗'}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded flex justify-between items-center">
              <p className="text-gray-300">NEXT_PUBLIC_SANITY_DATASET</p>
              <p className={`font-mono ${envVars.dataset ? 'text-green-400' : 'text-red-400'}`}>
                {envVars.dataset ? '✓' : '✗'}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded flex justify-between items-center">
              <p className="text-gray-300">NEXT_PUBLIC_SANITY_TOKEN</p>
              <p className={`font-mono ${envVars.tokenPresent ? 'text-green-400' : 'text-red-400'}`}>
                {envVars.tokenPresent ? '✓' : '✗'}
              </p>
            </div>
          </div>
        </div>

        {/* Health Check */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>❤️</span> Health Check
          </h2>
          {health ? (
            <div className="space-y-3">
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-gray-400 text-sm">Status</p>
                <p
                  className={`font-mono text-lg ${
                    health.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {health.status === 'healthy' ? '✓ Healthy' : '✗ Unhealthy'}
                </p>
              </div>
              {health.status === 'healthy' ? (
                <>
                  <div className="bg-gray-900 p-4 rounded">
                    <p className="text-gray-400 text-sm">Document Count</p>
                    <p className="text-blue-400 font-mono text-lg">{health.documentCount}</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-700 p-4 rounded">
                    <p className="text-green-400">✓ Sanity is properly initialized and connected!</p>
                  </div>
                </>
              ) : (
                <div className="bg-red-900/20 border border-red-700 p-4 rounded">
                  <p className="text-red-400 mb-2">Error:</p>
                  <p className="text-red-300 font-mono text-sm">{health.error}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Running health check...</p>
          )}
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔧 Troubleshooting</h2>
          <ul className="space-y-2 text-yellow-300 text-sm">
            <li>✓ Check browser console (F12) for [SANITY-INIT] logs</li>
            <li>✓ Ensure all environment variables are set in .env.local</li>
            <li>✓ Restart dev server if you added/changed .env.local</li>
            <li>✓ Check that the token has write permissions in Sanity</li>
            <li>✓ Verify internet connection is working</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-400 mb-4">📚 What This Checks</h2>
          <ul className="space-y-2 text-blue-300 text-sm">
            <li>• Client configuration is loaded correctly</li>
            <li>• Environment variables are set</li>
            <li>• Connection to Sanity API is working</li>
            <li>• Authentication token is valid</li>
            <li>• Project and dataset are accessible</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
