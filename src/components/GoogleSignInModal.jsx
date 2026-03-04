'use client'

import { useEffect } from 'react'

/**
 * Google Sign-In Loading Modal
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function GoogleSignInModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      console.log('[MODAL] Modal opened')
      document.body.style.overflow = 'hidden'
    } else {
      console.log('[MODAL] Modal closed')
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <style>{`
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .spinner-ring {
          animation: spin-fast 1.2s linear infinite;
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Spinner */}
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-3 border-gray-800"></div>
            
            {/* Animated spinner ring */}
            <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-white border-r-gray-500 spinner-ring"></div>
            
            {/* Inner pulse */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 pulse-ring"></div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">
              Authenticating
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Verifying your identity...
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gray-600"
                style={{
                  animation: `pulse 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 text-xs font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200 hover:bg-gray-900/50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
