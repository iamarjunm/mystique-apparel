'use client'

import { useEffect, useState } from 'react'
import { client as sanityClient } from '@/sanity/lib/client'

export default function DiagnosticsPage() {
  const [results, setResults] = useState({
    envVars: {},
    clientConfig: {},
    fetchTest: null,
    error: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('[DIAGNOSTICS] Starting...')
      try {
        // Check env vars
        const envVars = {
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET',
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET',
          tokenPresent: !!process.env.NEXT_PUBLIC_SANITY_TOKEN,
        }
        console.log('[DIAGNOSTICS] Env vars:', envVars)

        // Check client config
        const clientConfig = {
          projectId: sanityClient.config().projectId || 'NOT SET',
          dataset: sanityClient.config().dataset || 'NOT SET',
          apiVersion: sanityClient.config().apiVersion || 'NOT SET',
          useCdn: sanityClient.config().useCdn || 'NOT SET',
          token: !!sanityClient.config().token,
        }
        console.log('[DIAGNOSTICS] Client config:', clientConfig)

        // Test fetch
        console.log('[DIAGNOSTICS] Testing fetch...')
        let fetchTest = null
        try {
          const query = '*[_type == "userProfile"] | length'
          fetchTest = await sanityClient.fetch(query)
          console.log('[DIAGNOSTICS] Fetch successful, count:', fetchTest)
        } catch (fetchError) {
          console.error('[DIAGNOSTICS] Fetch failed:', fetchError.message)
          fetchTest = { error: fetchError.message }
        }

        setResults({
          envVars,
          clientConfig,
          fetchTest,
          error: null,
        })
      } catch (error) {
        console.error('[DIAGNOSTICS] Error:', error)
        setResults({
          envVars: {},
          clientConfig: {},
          fetchTest: null,
          error: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Sanity Diagnostics</h1>

        {loading ? (
          <div className="text-white text-center">
            <p>Running diagnostics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error Section */}
            {results.error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
                <pre className="bg-black p-4 rounded text-red-300 overflow-auto">
                  {results.error}
                </pre>
              </div>
            )}

            {/* Environment Variables */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Environment Variables</h2>
              <div className="space-y-2 text-gray-300 font-mono text-sm">
                <div>
                  <span className="text-gray-400">NEXT_PUBLIC_SANITY_PROJECT_ID:</span>{' '}
                  <span className="text-green-400">{results.envVars.projectId}</span>
                </div>
                <div>
                  <span className="text-gray-400">NEXT_PUBLIC_SANITY_DATASET:</span>{' '}
                  <span className="text-green-400">{results.envVars.dataset}</span>
                </div>
                <div>
                  <span className="text-gray-400">NEXT_PUBLIC_SANITY_TOKEN:</span>{' '}
                  <span className={results.envVars.tokenPresent ? 'text-green-400' : 'text-red-400'}>
                    {results.envVars.tokenPresent ? 'PRESENT' : 'NOT SET'}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Configuration */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Sanity Client Config</h2>
              <div className="space-y-2 text-gray-300 font-mono text-sm">
                <div>
                  <span className="text-gray-400">Project ID:</span>{' '}
                  <span className="text-blue-400">{results.clientConfig.projectId}</span>
                </div>
                <div>
                  <span className="text-gray-400">Dataset:</span>{' '}
                  <span className="text-blue-400">{results.clientConfig.dataset}</span>
                </div>
                <div>
                  <span className="text-gray-400">API Version:</span>{' '}
                  <span className="text-blue-400">{results.clientConfig.apiVersion}</span>
                </div>
                <div>
                  <span className="text-gray-400">Use CDN:</span>{' '}
                  <span className="text-blue-400">{String(results.clientConfig.useCdn)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Token Present:</span>{' '}
                  <span className={results.clientConfig.token ? 'text-green-400' : 'text-red-400'}>
                    {String(results.clientConfig.token)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fetch Test */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Sanity Fetch Test</h2>
              {typeof results.fetchTest === 'object' && results.fetchTest?.error ? (
                <div className="bg-red-900/20 p-4 rounded">
                  <p className="text-red-400 font-mono text-sm">{results.fetchTest.error}</p>
                </div>
              ) : (
                <div className="bg-green-900/20 p-4 rounded">
                  <p className="text-green-400 font-mono text-sm">
                    Query successful. Found {results.fetchTest} documents.
                  </p>
                </div>
              )}
            </div>

            {/* Console Output Hint */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-2">Tip</h2>
              <p className="text-gray-300 text-sm">
                Check your browser console for detailed logs. Open DevTools (F12) and filter for
                [AUTH], [SANITY], and [DIAGNOSTICS] logs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
