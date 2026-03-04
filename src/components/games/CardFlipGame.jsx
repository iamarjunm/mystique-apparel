import React, { useState } from 'react'
import { client } from '@/sanity'
import { Copy, X } from 'lucide-react'
import { createGameDiscount } from '@/lib/promoOfferFactory'

const createShuffledCards = () => {
  const pairDesigns = [
    { pair: 1, emoji: '🖤' },
    { pair: 2, emoji: '♠️' },
    { pair: 3, emoji: '🎴' },
    { pair: 4, emoji: '🃏' },
  ]

  const duplicated = pairDesigns.flatMap((item) => [
    { pair: item.pair, emoji: item.emoji },
    { pair: item.pair, emoji: item.emoji },
  ])

  for (let i = duplicated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]]
  }

  return duplicated.map((card, index) => ({
    id: index + 1,
    pair: card.pair,
    emoji: card.emoji,
  }))
}

const CardFlipGame = ({ onClose, allowReplay = true, recordGamePlay = () => {} }) => {
  const MAX_MOVES = 8
  const [cards, setCards] = useState(() => createShuffledCards())
  const [flipped, setFlipped] = useState({})
  const [matchedPairs, setMatchedPairs] = useState(new Set())
  const [gameResult, setGameResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [discountCode, setDiscountCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [moves, setMoves] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'MATCH'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCardClick = async (id) => {
    if (gameOver || gameResult) return
    if (flipped[id] || matchedPairs.has(cards.find((c) => c.id === id).pair)) return

    setGameCompleted(true)
    recordGamePlay() // Record that game was actually played

    const newFlipped = { ...flipped, [id]: true }
    setFlipped(newFlipped)

    const flippedCards = Object.keys(newFlipped).filter((key) => newFlipped[key])

    if (flippedCards.length === 2) {
      const nextMoves = moves + 1
      setMoves(nextMoves)
      let didWin = false

      const card1 = cards.find((c) => c.id == flippedCards[0])
      const card2 = cards.find((c) => c.id == flippedCards[1])

      if (card1.pair === card2.pair) {
        // Match found!
        const newMatches = new Set(matchedPairs)
        newMatches.add(card1.pair)
        setMatchedPairs(newMatches)

        if (newMatches.size === 4) {
          didWin = true
          // All matches found
          const newCode = generateDiscountCode()

          try {
            const offer = await createGameDiscount(client, {
              code: newCode,
              gameName: 'Card Flip',
              tier: moves <= 4 ? 'high' : 'standard',
            })

            setGameResult({
              icon: '🎉',
              code: newCode,
              offerLabel: offer.label,
            })
            setDiscountCode(newCode)
            didWin = true
            return
          } catch (error) {
            console.error('Error creating discount:', error)
          }

          setGameResult({
            icon: '🎉',
            code: newCode,
            offerLabel: 'Special Offer Unlocked',
          })
          setDiscountCode(newCode)
        }

        setTimeout(() => {
          setFlipped({})
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setFlipped({})
        }, 1000)
      }

      if (nextMoves >= MAX_MOVES && !didWin) {
        setTimeout(() => {
          setFlipped({})
          setGameOver(true)
        }, 1100)
      }
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
    setFlipped({})
    setMatchedPairs(new Set())
    setMoves(0)
    setCards(createShuffledCards())
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
            <div className="text-5xl sm:text-6xl">😢</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Out of Moves!
            </h2>
            <p className="text-gray-300">You used all {MAX_MOVES} moves. Try again for a reward!</p>

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
              Perfect Match!
            </h2>
            <p className="text-lg text-gray-200">{gameResult.offerLabel}</p>
            <p className="text-gray-300">Completed in {moves} moves</p>

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
          Card Flip
        </h1>
        <p className="text-center text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">Match all pairs within {MAX_MOVES} moves to win!</p>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={flipped[card.id] || matchedPairs.has(card.pair)}
              className={`h-16 sm:h-20 rounded-lg font-bold text-xl sm:text-2xl transition-all duration-300 transform ${
                flipped[card.id] || matchedPairs.has(card.pair)
                    ? 'bg-white text-black scale-100'
                    : 'bg-zinc-900 hover:scale-110 hover:shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20`}
            >
              {flipped[card.id] || matchedPairs.has(card.pair) ? card.emoji : '✦'}
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs sm:text-sm">
          Moves: {moves}/{MAX_MOVES} | Left: {Math.max(0, MAX_MOVES - moves)} | Matches: {matchedPairs.size}/4
        </p>
      </div>
    </div>
  )
}

export default CardFlipGame
