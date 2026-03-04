import React, { useState, useRef, useEffect } from 'react'
import { client } from '@/sanity'
import { Copy, X } from 'lucide-react'
import { createGameDiscount } from '@/lib/promoOfferFactory'

const ScratchCardGame = ({ onClose, allowReplay = true, recordGamePlay = () => {} }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isScratching, setIsScratching] = useState(true)
  const [gameResult, setGameResult] = useState(null)
  const [discountCode, setDiscountCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [scratchPercentage, setScratchPercentage] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)

  const scratchRewards = [
    { tier: 'low', emoji: '🎀' },
    { tier: 'low', emoji: '⭐' },
    { tier: 'standard', emoji: '💫' },
    { tier: 'standard', emoji: '🌈' },
    { tier: 'high', emoji: '👑' },
    { tier: 'high', emoji: '🏆' },
  ]

  const [selectedReward, setSelectedReward] = useState(
    scratchRewards[Math.floor(Math.random() * scratchRewards.length)]
  )

  const drawScratchLayer = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    // base cover
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, width, height)

    // metallic sheen
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.24)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.18)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // diagonal lines for texture
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    for (let i = -height; i < width; i += 12) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + height, height)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Scratch to Reveal Offer', width / 2, height / 2)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    drawScratchLayer()
  }, [])

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'SCRATCH'
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const getPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const point = e.touches?.[0] || e
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    }
  }

  const scratchAt = (x, y) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 18, 0, Math.PI * 2)
    ctx.fill()

    // add softer edge
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fill()
    ctx.fillStyle = '#000'
  }

  const calculateScratchPercentage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let scratched = 0

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) scratched++
    }

    const percentage = (scratched / (data.length / 4)) * 100
    setScratchPercentage(percentage)

    if (percentage > 40) {
      revealResult()
    }
  }

  const handlePointerDown = (e) => {
    if (!isScratching) return
    setIsDrawing(true)
    const { x, y } = getPoint(e)
    scratchAt(x, y)
    calculateScratchPercentage()
  }

  const handlePointerMove = (e) => {
    if (!isScratching || !isDrawing) return
    const { x, y } = getPoint(e)
    scratchAt(x, y)
    calculateScratchPercentage()
  }

  const handlePointerUp = () => {
    setIsDrawing(false)
  }

  const revealResult = async () => {
    setIsScratching(false)
    setGameCompleted(true)
    recordGamePlay() // Record that game was actually played
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const newCode = generateDiscountCode()

    try {
      const offer = await createGameDiscount(client, {
        code: newCode,
        gameName: 'Scratch Card',
        tier: selectedReward.tier,
      })

      setTimeout(() => {
        setGameResult({
          icon: selectedReward.emoji,
          code: newCode,
          offerLabel: offer.label,
        })
        setDiscountCode(newCode)
      }, 500)
      return
    } catch (error) {
      console.error('Error creating discount:', error)
    }

    setTimeout(() => {
      setGameResult({
        icon: selectedReward.emoji,
        code: newCode,
        offerLabel: 'Special Offer Unlocked',
      })
      setDiscountCode(newCode)
    }, 500)
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
    setGameCompleted(false)
    setIsScratching(true)
    setIsDrawing(false)
    setScratchPercentage(0)
    setSelectedReward(scratchRewards[Math.floor(Math.random() * scratchRewards.length)])
    requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawScratchLayer()
      ctx.globalCompositeOperation = 'source-over'
    })
  }

  if (gameResult) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <button
            onClick={() => {
              onClose(gameCompleted)
            }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={18} className="text-white sm:w-5 sm:h-5" />
          </button>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="text-6xl sm:text-7xl animate-bounce">{gameResult.icon}</div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Congratulations!
              </h2>
              <p className="text-sm text-gray-400 mt-2">You've unlocked a special offer</p>
            </div>
            <p className="text-lg text-gray-200">{gameResult.offerLabel}</p>

            <div className="bg-black/50 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Your Discount Code</p>
              <code className="text-2xl sm:text-3xl font-mono font-bold tracking-[0.1em] text-white bg-black/80 p-3 rounded-lg block mb-3">
                {gameResult.code}
              </code>
            </div>

            <button
              onClick={handleCopy}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 sm:py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Copy size={18} />
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>

            {allowReplay && (
              <button
                onClick={handlePlayAgain}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition-all duration-300"
              >
                Try Your Luck Again
              </button>
            )}

            <p className="text-xs text-gray-400 pt-2">Use this code at checkout to get your discount</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <button
          onClick={() => {
            onClose(gameCompleted)
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition z-20"
        >
          <X size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        <div className="text-center space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Scratch & Win</h1>
            <p className="text-gray-400 text-sm mt-1">Scratch to reveal an exclusive offer</p>
          </div>

          <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-1">
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="w-full h-60 rounded-lg cursor-crosshair bg-zinc-900 touch-none border border-white/5"
            />
            <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2 animate-pulse">{selectedReward.emoji}</div>
                <div className="text-xs font-semibold text-gray-400">MYSTERY</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Scratch Progress</span>
              <span className="font-semibold">{Math.round(scratchPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
                style={{ width: `${Math.min(scratchPercentage, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            {scratchPercentage < 40
              ? 'Keep scratching to reveal your offer...'
              : 'Revealing your reward...'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScratchCardGame
