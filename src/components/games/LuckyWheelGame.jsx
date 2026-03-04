import React, { useState } from 'react'
import { client } from '@/sanity'
import { Copy, X } from 'lucide-react'

const LuckyWheelGame = ({ onClose, allowReplay = true, recordGamePlay = () => {} }) => {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningIndex, setWinningIndex] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [discountCode, setDiscountCode] = useState(null)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [copied, setCopied] = useState(false)

  const wheelSegments = [
    {
      color: '#0a0a0a',
      icon: '🎁',
      shortLabel: '₹100 OFF',
      fullLabel: '₹100 OFF on orders above ₹999',
      offerData: { discountType: 'fixed', fixedAmountOff: 100, minimumPurchaseAmount: 999 },
    },
    {
      color: '#141414',
      icon: '🚚',
      shortLabel: 'FREE SHIP',
      fullLabel: 'Free Shipping on orders above ₹799',
      offerData: { discountType: 'freeShipping', minimumPurchaseAmount: 799 },
    },
    {
      color: '#1f1f1f',
      icon: '🛍️',
      shortLabel: '5% OFF',
      fullLabel: '5% OFF on orders above ₹799',
      offerData: { discountType: 'percentage', percentageOff: 5, minimumPurchaseAmount: 799 },
    },
    {
      color: '#2a2a2a',
      icon: '🎯',
      shortLabel: '8% OFF',
      fullLabel: '8% OFF on orders above ₹999',
      offerData: { discountType: 'percentage', percentageOff: 8, minimumPurchaseAmount: 999 },
    },
    {
      color: '#353535',
      icon: '💸',
      shortLabel: '₹100 OFF',
      fullLabel: '₹100 OFF on orders above ₹1299',
      offerData: { discountType: 'fixed', fixedAmountOff: 100, minimumPurchaseAmount: 1299 },
    },
    {
      color: '#404040',
      icon: '🎉',
      shortLabel: 'FREE SHIP',
      fullLabel: 'Free Shipping on orders above ₹999',
      offerData: { discountType: 'freeShipping', minimumPurchaseAmount: 999 },
    },
    {
      color: '#525252',
      icon: '🏷️',
      shortLabel: '10% OFF',
      fullLabel: '10% OFF on orders above ₹1499',
      offerData: { discountType: 'percentage', percentageOff: 10, minimumPurchaseAmount: 1499 },
    },
    {
      color: '#666666',
      icon: '🎊',
      shortLabel: '₹150 OFF',
      fullLabel: '₹150 OFF on orders above ₹1799',
      offerData: { discountType: 'fixed', fixedAmountOff: 150, minimumPurchaseAmount: 1799 },
    },
  ]

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'LUCKY'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const createOfferFromSegment = async (code, segment) => {
    const now = new Date()
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await client.create({
      _type: 'discountCode',
      code,
      description: `Lucky Wheel reward: ${segment.fullLabel}`,
      appliesTo: 'entireOrder',
      usageLimit: 1,
      usageLimitPerCustomer: 1,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      isActive: true,
      timesUsed: 0,
      ...segment.offerData,
    })
  }

  const handleSpin = async () => {
    if (isSpinning) return

    setIsSpinning(true)
    setGameCompleted(true)
    recordGamePlay() // Record that game was actually played
    setWinningIndex(null)
    const randomSpin = Math.floor(Math.random() * 360) + 1800 // At least 5 full rotations
    const newRotation = rotation + randomSpin
    setRotation(newRotation)

    setTimeout(async () => {
      const normalizedRotation = newRotation % 360
      const segmentIndex = Math.floor((360 - normalizedRotation + 22.5) / 45) % wheelSegments.length
      const winningSegment = wheelSegments[segmentIndex]
      setWinningIndex(segmentIndex)

      const newCode = generateDiscountCode()

      try {
        await createOfferFromSegment(newCode, winningSegment)

        setGameResult({
          icon: winningSegment.icon,
          code: newCode,
          offerLabel: winningSegment.fullLabel,
        })
        setDiscountCode(newCode)
        setIsSpinning(false)
        return
      } catch (error) {
        console.error('Error creating discount:', error)
      }

      setGameResult({
        icon: winningSegment.icon,
        code: newCode,
        offerLabel: 'Special Offer Unlocked',
      })
      setDiscountCode(newCode)
      setIsSpinning(false)
    }, 2000)
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
    setWinningIndex(null)
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
              Wheel Spins!
            </h2>
            <p className="text-base sm:text-lg text-gray-200">{gameResult.offerLabel}</p>

            <div className="bg-zinc-900 rounded-lg p-3 sm:p-4 border border-white/20">
              <p className="text-xs text-gray-400 mb-2">Your Discount Code</p>
              <code className="text-2xl sm:text-3xl font-light tracking-[0.25em] sm:tracking-[0.3em] text-white break-all">
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
                Spin Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full border border-white/20 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={() => onClose(gameCompleted)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition z-10"
        >
          <X size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-1 sm:mb-2 text-white tracking-wider">
          MYSTIQUE FORTUNE
        </h1>
        <p className="text-center text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 md:mb-8 font-light tracking-wide">Spin the wheel of destiny for exclusive rewards</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          {/* Wheel */}
          <div className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[22rem] sm:h-[22rem] md:w-[26rem] md:h-[26rem] mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-[18px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
            </div>

            {/* Wheel */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              }}
            >
              {wheelSegments.map((segment, index) => {
                const angle = (360 / wheelSegments.length) * index
                const x1 = 100 + 90 * Math.cos((angle * Math.PI) / 180)
                const y1 = 100 + 90 * Math.sin((angle * Math.PI) / 180)
                const x2 = 100 + 90 * Math.cos(((angle + 45) * Math.PI) / 180)
                const y2 = 100 + 90 * Math.sin(((angle + 45) * Math.PI) / 180)
                const tx = 100 + 63 * Math.cos(((angle + 22.5) * Math.PI) / 180)
                const ty = 100 + 63 * Math.sin(((angle + 22.5) * Math.PI) / 180)

                return (
                  <g key={index}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke={winningIndex === index ? '#ffffff' : '#8a8a8a'}
                      strokeWidth={winningIndex === index ? '3' : '1.5'}
                    />
                    <text
                      x={tx}
                      y={ty - 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="7.5"
                      fontFamily="serif"
                      fontWeight="600"
                      fill="#ffffff"
                      letterSpacing="0.5"
                      transform={`rotate(${angle + 90} ${tx} ${ty})`}
                    >
                      {segment.shortLabel}
                    </text>
                    <text
                      x={tx}
                      y={ty + 9}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fill="#ffffff"
                      transform={`rotate(${angle + 90} ${tx} ${ty})`}
                    >
                      {segment.icon}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Center circle */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-black shadow-lg" />
          </div>

          <div className="w-full">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-base sm:text-lg tracking-wider">AVAILABLE REWARDS</h3>
            <div className="space-y-1.5 sm:space-y-2 max-h-60 sm:max-h-72 overflow-auto pr-1">
              {wheelSegments.map((segment, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all duration-300 ${
                    winningIndex === idx 
                      ? 'border-white bg-white/15 shadow-lg shadow-white/10 scale-[1.02]' 
                      : 'border-white/20 bg-zinc-900/50 hover:bg-zinc-900/70'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{segment.icon}</span>
                  <span className="text-xs sm:text-sm text-gray-100 font-light tracking-wide">{segment.fullLabel}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full mt-4 sm:mt-5 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 transform shadow-lg ${
                isSpinning
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border-2 border-zinc-700'
                  : 'bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] border-2 border-white active:scale-95'
              }`}
            >
              {isSpinning ? '⏳ Spinning...' : '🎯 SPIN THE WHEEL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LuckyWheelGame
