import React, { useState } from 'react'
import { client } from '@/sanity'
import { Copy, X } from 'lucide-react'
import { createGameDiscount } from '@/lib/promoOfferFactory'

const MysteryBoxGame = ({ onClose, allowReplay = true, recordGamePlay = () => {} }) => {
  const [selectedBox, setSelectedBox] = useState(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealedBoxes, setRevealedBoxes] = useState(new Set())
  const [gameResult, setGameResult] = useState(null)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [discountCode, setDiscountCode] = useState(null)
  const [copied, setCopied] = useState(false)

  const rewards = [
    { discount: 5, icon: '🎁' },
    { discount: 6, icon: '💫' },
    { discount: 7, icon: '✨' },
    { discount: 8, icon: '🌟' },
    { discount: 10, icon: '💎' },
    { discount: 12, icon: '👑' },
    { discount: 8, icon: '🎀' },
    { discount: 9, icon: '🎊' },
    { discount: 11, icon: '🎉' },
  ]

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'MYSTIQUE'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleBoxClick = async (index) => {
    if (revealedBoxes.has(index) || isRevealing) return

    setSelectedBox(index)
    setIsRevealing(true)
    setGameCompleted(true)
    recordGamePlay() // Record that game was actually played

    const reward = rewards[index]
    const newCode = generateDiscountCode()

    // Create discount in Sanity
    try {
      const tier = reward.discount >= 11 ? 'high' : reward.discount >= 8 ? 'standard' : 'low'
      const offer = await createGameDiscount(client, {
        code: newCode,
        gameName: 'Mystery Box',
        tier,
      })

      // Simulate reveal animation
      setTimeout(() => {
        setRevealedBoxes((prev) => new Set([...prev, index]))
        setGameResult({
          icon: reward.icon,
          code: newCode,
          offerLabel: offer.label,
        })
        setDiscountCode(newCode)
        setIsRevealing(false)
      }, 1000)
      return
    } catch (error) {
      console.error('Error creating discount:', error)
    }

    // Simulate reveal animation
    setTimeout(() => {
      setRevealedBoxes((prev) => new Set([...prev, index]))
      setGameResult({
        icon: reward.icon,
        code: newCode,
        offerLabel: 'Special Offer Unlocked',
      })
      setDiscountCode(newCode)
      setIsRevealing(false)
    }, 1000)
  }

  const handleCopy = async () => {
    if (discountCode) {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePlayAgain = () => {
    setGameResult(null)
    setDiscountCode(null)
    setSelectedBox(null)
    setRevealedBoxes(new Set())
  }

  if (gameResult) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <button
            onClick={() => onClose(gameCompleted)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={18} className="text-white sm:w-5 sm:h-5" />
          </button>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="text-5xl sm:text-6xl animate-bounce">{gameResult.icon}</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              You Won!
            </h2>
            <p className="text-lg text-gray-200">{gameResult.offerLabel}</p>

            <div className="bg-zinc-900 rounded-lg p-4 border border-white/20">
              <p className="text-xs text-gray-400 mb-2">Your Discount Code</p>
              <code className="text-3xl font-light tracking-[0.3em] text-white break-all">
                {gameResult.code}
              </code>
            </div>

            <button
              onClick={handleCopy}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy Code'}
            </button>

            {allowReplay && (
              <button
                onClick={handlePlayAgain}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <button
          onClick={() => onClose(gameCompleted)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1 sm:mb-2 text-white">
          Mystery Box
        </h1>
        <p className="text-center text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 md:mb-8">Pick a box to reveal your prize!</p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {rewards.map((_, index) => (
            <button
              key={index}
              onClick={() => handleBoxClick(index)}
              disabled={revealedBoxes.has(index) || isRevealing}
              className={`relative h-24 sm:h-28 md:h-32 rounded-lg transition-all duration-500 transform hover:scale-110 ${
                revealedBoxes.has(index)
                    ? 'bg-zinc-800 border-2 border-white/40'
                  : isRevealing && selectedBox === index
                    ? 'bg-white text-black border-2 border-white scale-105'
                    : 'bg-zinc-900 border-2 border-white/20 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {revealedBoxes.has(index) ? (
                  <>
                    <span className="text-2xl">✓</span>
                    <span className="text-xs text-green-200">Opened</span>
                  </>
                ) : selectedBox === index && isRevealing ? (
                  <div className="animate-spin">⚡</div>
                ) : (
                  <>
                    <span className="text-3xl">📦</span>
                    <span className="text-xs text-gray-200 font-light">{index + 1}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          {revealedBoxes.size === 0 ? 'Choose your lucky box!' : `${revealedBoxes.size} of 9 opened`}
        </p>
      </div>
    </div>
  )
}

export default MysteryBoxGame
