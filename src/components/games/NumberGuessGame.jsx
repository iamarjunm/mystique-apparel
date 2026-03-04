import React, { useState, useEffect } from 'react'
import { client } from '@/sanity'
import { Copy, X } from 'lucide-react'
import { createGameDiscount } from '@/lib/promoOfferFactory'

const NumberGuessGame = ({ onClose, allowReplay = true, recordGamePlay = () => {} }) => {
  const MAX_ATTEMPTS = 7
  const [secretNumber, setSecretNumber] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [input, setInput] = useState('')
  const [gameResult, setGameResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [discountCode, setDiscountCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [hint, setHint] = useState('')
  const [gameCompleted, setGameCompleted] = useState(false)

  useEffect(() => {
    setSecretNumber(Math.floor(Math.random() * 100) + 1)
  }, [])

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'GUESS'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleGuess = async () => {
    if (!input || isNaN(input) || gameOver || gameResult) return

    setGameCompleted(true)
    recordGamePlay() // Record that game was actually played

    const guess = parseInt(input)
    const newGuesses = [...guesses, guess]
    setGuesses(newGuesses)
    setInput('')

    if (guess === secretNumber) {
      const newCode = generateDiscountCode()

      try {
        const tier = newGuesses.length <= 3 ? 'high' : newGuesses.length <= 5 ? 'standard' : 'low'
        const offer = await createGameDiscount(client, {
          code: newCode,
          gameName: 'Number Guess',
          tier,
        })

        setGameResult({
          icon: '🎯',
          code: newCode,
          guesses: newGuesses.length,
          offerLabel: offer.label,
        })
        setDiscountCode(newCode)
        return
      } catch (error) {
        console.error('Error creating discount:', error)
      }

      setGameResult({
        icon: '🎯',
        code: newCode,
        guesses: newGuesses.length,
        offerLabel: 'Special Offer Unlocked',
      })
      setDiscountCode(newCode)
    } else if (guess < secretNumber) {
      setHint('Higher! 📈')
    } else {
      setHint('Lower! 📉')
    }

    if (newGuesses.length >= MAX_ATTEMPTS && guess !== secretNumber) {
      setGameOver(true)
      setHint(`Out of attempts! The number was ${secretNumber}`)
    }
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
    setGameOver(false)
    setDiscountCode(null)
    setGuesses([])
    setInput('')
    setHint('')
    setSecretNumber(Math.floor(Math.random() * 100) + 1)
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
            <div className="text-5xl sm:text-6xl">😞</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Vault Locked!
            </h2>
            <p className="text-gray-300">You used all {MAX_ATTEMPTS} attempts.</p>
            <p className="text-gray-400 text-sm">{hint}</p>

            {allowReplay && (
              <button
                onClick={handlePlayAgain}
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
              Correct!
            </h2>
            <p className="text-lg text-gray-200">{gameResult.offerLabel}</p>
            <p className="text-gray-300">Guessed in {gameResult.guesses} tries</p>

            <div className="bg-zinc-900 rounded-lg p-4 border border-white/20">
              <p className="text-xs text-gray-400 mb-2">Your Discount Code</p>
              <code className="text-3xl font-light tracking-[0.3em] text-white">
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
      <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-sm w-full border border-white/20 shadow-2xl">
        <button
          onClick={() => onClose(gameCompleted)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X size={18} className="text-white sm:w-5 sm:h-5" />
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1 sm:mb-2 text-white">
          Number Guess
        </h1>
        <p className="text-center text-gray-300 mb-4">Guess a number between 1-100 in max {MAX_ATTEMPTS} attempts</p>

        <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-white/20">
          <p className="text-center text-gray-400 mb-4">Attempts: {guesses.length}/{MAX_ATTEMPTS}</p>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {guesses.map((guess, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-2 text-center text-black font-bold text-sm"
              >
                {guess}
              </div>
            ))}
          </div>
          {hint && <p className="text-center text-lg font-semibold text-amber-300">{hint}</p>}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="100"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            placeholder="Enter number..."
            className="flex-1 bg-zinc-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={handleGuess}
            disabled={!input || isNaN(input) || guesses.length >= MAX_ATTEMPTS}
            className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            Guess
          </button>
        </div>
      </div>
    </div>
  )
}

export default NumberGuessGame
