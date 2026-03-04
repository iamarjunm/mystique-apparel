import React, { useEffect, useState } from 'react'
import { client } from '@/sanity'
import { Copy, X, Zap } from 'lucide-react'

const PAD_CONFIG = [
  { id: 0, label: 'A', color: 'from-zinc-900 via-zinc-800 to-black', neon: 'shadow-white/40' },
  { id: 1, label: 'B', color: 'from-zinc-800 via-zinc-700 to-zinc-900', neon: 'shadow-zinc-200/40' },
  { id: 2, label: 'C', color: 'from-zinc-700 via-zinc-600 to-zinc-800', neon: 'shadow-zinc-300/40' },
  { id: 3, label: 'D', color: 'from-zinc-600 via-zinc-500 to-zinc-700', neon: 'shadow-zinc-400/40' },
  { id: 4, label: 'E', color: 'from-zinc-500 via-zinc-400 to-zinc-600', neon: 'shadow-zinc-500/40' },
  { id: 5, label: 'F', color: 'from-zinc-400 via-zinc-300 to-zinc-500', neon: 'shadow-zinc-600/40' },
]

const ROUNDS_TO_WIN = 8
const MAX_MISTAKES = 3
const BASE_SPEED = 550
const MIN_SPEED = 280

const NeonVaultGame = ({ onClose, allowReplay = true, recordGamePlay = () => {} }) => {
  const [sequence, setSequence] = useState([])
  const [playerInput, setPlayerInput] = useState([])
  const [round, setRound] = useState(1)
  const [mistakes, setMistakes] = useState(0)
  const [showingSequence, setShowingSequence] = useState(true)
  const [activePad, setActivePad] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [discountCode, setDiscountCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [pulseEffect, setPulseEffect] = useState(null)
  const [gameCompleted, setGameCompleted] = useState(false)

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'VAULT'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const getSpeed = (currentRound) => {
    // Speed increases as rounds progress
    const progress = (currentRound - 1) / (ROUNDS_TO_WIN - 1)
    return Math.max(MIN_SPEED, BASE_SPEED - progress * (BASE_SPEED - MIN_SPEED))
  }

  const playSequence = async (seq, currentRound) => {
    setShowingSequence(true)
    setActivePad(null)

    const speed = getSpeed(currentRound)
    await wait(600)
    
    for (const step of seq) {
      setActivePad(step)
      setPulseEffect(step)
      await wait(speed)
      setActivePad(null)
      await wait(speed * 0.4)
      setPulseEffect(null)
    }

    setShowingSequence(false)
  }

  const startGame = async () => {
    const first = Math.floor(Math.random() * PAD_CONFIG.length)
    const initialSequence = [first]
    setSequence(initialSequence)
    setPlayerInput([])
    setRound(1)
    setMistakes(0)
    setGameOver(false)
    setGameResult(null)
    setDiscountCode(null)
    setPulseEffect(null)

    await playSequence(initialSequence, 1)
  }

  useEffect(() => {
    startGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createReward = async (reward, newCode) => {
    const now = new Date()
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await client.create({
      _type: 'discountCode',
      code: newCode,
      description: `Neon Vault reward: ${reward}% off`,
      discountType: 'percentage',
      percentageOff: reward,
      appliesTo: 'entireOrder',
      usageLimit: 1,
      usageLimitPerCustomer: 1,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      isActive: true,
      timesUsed: 0,
    })
  }

  const handlePadClick = async (padId) => {
    if (showingSequence || gameResult || gameOver) return

    setGameCompleted(true)
    recordGamePlay() // Record that game was actually played

    // Visual feedback on click
    setActivePad(padId)
    setPulseEffect(padId)
    await wait(150)
    setActivePad(null)
    await wait(50)
    setPulseEffect(null)

    const nextInput = [...playerInput, padId]
    setPlayerInput(nextInput)

    const expected = sequence[nextInput.length - 1]

    if (padId !== expected) {
      const nextMistakes = mistakes + 1
      setMistakes(nextMistakes)
      setPlayerInput([])

      if (nextMistakes > MAX_MISTAKES) {
        setGameOver(true)
        return
      }

      await wait(400)
      await playSequence(sequence, round)
      return
    }

    if (nextInput.length === sequence.length) {
      if (round >= ROUNDS_TO_WIN) {
        const reward = mistakes === 0 ? 12 : mistakes === 1 ? 10 : mistakes <= 2 ? 9 : 7
        const newCode = generateDiscountCode()

        try {
          await createReward(reward, newCode)
        } catch (error) {
          console.error('Error creating discount:', error)
        }

        setGameResult({ reward, code: newCode })
        setDiscountCode(newCode)
        return
      }

      const nextRound = round + 1
      const extended = [...sequence, Math.floor(Math.random() * PAD_CONFIG.length)]
      setRound(nextRound)
      setSequence(extended)
      setPlayerInput([])
      await wait(500)
      await playSequence(extended, nextRound)
    }
  }

  const handleCopy = async () => {
    if (discountCode) {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
            <div className="relative">
              <div className="text-5xl sm:text-7xl animate-bounce">🔐</div>
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Vault Cracked!
            </h2>
            <div className="relative">
              <p className="text-3xl sm:text-4xl font-bold text-white animate-pulse">{gameResult.reward}% OFF</p>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">
                {mistakes === 0 ? '🌟 Perfect Run!' : `Completed with ${mistakes} mistake${mistakes > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4 border border-white/20">
              <p className="text-xs text-gray-400 mb-2">Your Discount Code</p>
              <code className="text-3xl font-light tracking-[0.25em] text-white break-all">
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
                onClick={startGame}
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

  if (gameOver) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={18} className="text-white sm:w-5 sm:h-5" />
          </button>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="text-5xl sm:text-7xl animate-pulse">🚨</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Alarm Triggered!
            </h2>
            <p className="text-gray-300">Too many mistakes. Max allowed: {MAX_MISTAKES + 1}</p>
            <p className="text-sm text-gray-400">Made it to round {round} of {ROUNDS_TO_WIN}</p>

            {allowReplay && (
              <button
                onClick={startGame}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const progress = (round / ROUNDS_TO_WIN) * 100

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-zinc-950 via-black to-zinc-900 rounded-2xl p-4 sm:p-6 md:p-8 max-w-lg w-full border border-white/20 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={() => onClose(gameCompleted)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 tracking-wider">
            NEON VAULT
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mb-1">Memorize the sequence to unlock rewards</p>
          
          {/* Progress Bar */}
          <div className="mt-4 mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Round {round}/{ROUNDS_TO_WIN}</span>
              <span>Mistakes: {mistakes}/{MAX_MISTAKES + 1}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white via-zinc-300 to-zinc-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Speed indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Zap size={12} />
            <span>
              {round <= 3 ? 'Normal Speed' : round <= 5 ? 'Fast' : 'Very Fast'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
          {PAD_CONFIG.map((pad) => {
            const isActive = activePad === pad.id
            const isPulsing = pulseEffect === pad.id
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={showingSequence}
                className={`relative h-20 sm:h-24 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-white font-bold text-xl sm:text-2xl overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-br ${pad.color} border-white scale-110 shadow-2xl ${pad.neon}`
                    : `bg-gradient-to-br ${pad.color} border-white/30 hover:scale-105 hover:border-white/50`
                } ${showingSequence ? 'opacity-70 cursor-wait' : 'hover:shadow-lg hover:shadow-white/5'}`}
              >
                {/* Neon glow effect on active */}
                {isPulsing && (
                  <div className="absolute inset-0 bg-white/20 animate-ping rounded-2xl" />
                )}
                
                {/* Grid pattern background */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                  }}
                />
                
                <span className="relative z-10">{pad.label}</span>
                
                {/* Corner accent */}
                <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-white/30" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-white/30" />
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <p className={`text-sm font-medium transition-all duration-300 ${
            showingSequence 
              ? 'text-white animate-pulse' 
              : 'text-gray-400'
          }`}>
            {showingSequence ? '👁️ Watch carefully...' : '✋ Your turn - repeat the sequence!'}
          </p>
          
          {/* Sequence length indicator */}
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: sequence.length }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i < playerInput.length
                    ? 'bg-white scale-125'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NeonVaultGame
