import React, { useState, useEffect } from 'react'
import { client } from '@/sanity'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import MysteryBoxGame from './games/MysteryBoxGame'
import ScratchCardGame from './games/ScratchCardGame'
import LuckyWheelGame from './games/LuckyWheelGame'
import CardFlipGame from './games/CardFlipGame'
import NumberGuessGame from './games/NumberGuessGame'
import NeonVaultGame from './games/NeonVaultGame'

const PromoGameSelector = ({ isOpen, onClose }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState(null)
  const [userGameData, setUserGameData] = useState({})

  const STORAGE_KEY = 'mystique_game_data_v2'

  const getIdentityKey = () => {
    if (user?.uid) return `user:${user.uid}`
    if (user?.email) return `email:${String(user.email).toLowerCase()}`

    let guestId = localStorage.getItem('mystique_guest_id')
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('mystique_guest_id', guestId)
    }
    return `guest:${guestId}`
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "siteSettings"][0] {
            promotionalGames {
              enabled,
              activeGame,
              offerCycleId,
              replayInterval
            }
          }`
        )
        setSettings(data)
      } catch (error) {
        console.error('Error fetching site settings:', error)
      }
    }

    fetchSettings()

    // Load game data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUserGameData(JSON.parse(stored))
      } catch {
        setUserGameData({})
      }
    }
  }, [])

  const canPlayGame = () => {
    const activeGame = settings?.promotionalGames?.activeGame
    if (!activeGame) return true

    const replayInterval = Number(settings?.promotionalGames?.replayInterval ?? 24)
    const offerCycleId = settings?.promotionalGames?.offerCycleId
    const gameCycleKey = `${activeGame}:${offerCycleId || 'legacy'}`
    const identityKey = getIdentityKey()
    const cycleData = userGameData?.[identityKey]?.[gameCycleKey]
    const legacyData = !offerCycleId ? userGameData?.[identityKey]?.[activeGame] : null
    const gameData = cycleData || legacyData
    const lastPlayed = gameData?.lastPlayed

    if (!lastPlayed) return true

    // replayInterval = 0 => one-time ever per user account/device for this game
    if (replayInterval === 0) {
      return false
    }

    const hoursSincePlay = (Date.now() - lastPlayed) / (1000 * 60 * 60)
    return hoursSincePlay >= replayInterval
  }

  const recordGamePlay = () => {
    const activeGame = settings?.promotionalGames?.activeGame
    if (!activeGame) return

    const offerCycleId = settings?.promotionalGames?.offerCycleId
    const gameCycleKey = `${activeGame}:${offerCycleId || 'legacy'}`
    const identityKey = getIdentityKey()
    const previous = userGameData?.[identityKey]?.[gameCycleKey] || {}
    const newData = {
      ...userGameData,
      [identityKey]: {
        ...(userGameData?.[identityKey] || {}),
        [gameCycleKey]: {
          lastPlayed: Date.now(),
          playCount: (previous.playCount || 0) + 1,
        },
      },
    }

    setUserGameData(newData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  }

  const handleGameClose = (gameWasPlayed = false) => {
    // Only record gameplay if the game was actually played/completed
    if (gameWasPlayed) {
      recordGamePlay()
    }
    onClose()
  }

  if (!isOpen || !settings?.promotionalGames?.enabled || loading) return null

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">Login Required</h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
            Please log in to play promotional games and unlock rewards.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose()
                router.push('/account/login')
              }}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const gameMap = {
    'mystery-box': MysteryBoxGame,
    'scratch-card': ScratchCardGame,
    'lucky-wheel': LuckyWheelGame,
    'card-flip': CardFlipGame,
    'number-guess': NumberGuessGame,
    'neon-vault': NeonVaultGame,
  }

  const activeGame = settings.promotionalGames.activeGame
  const GameComponent = gameMap[activeGame]

  if (!GameComponent) return null

  if (!canPlayGame()) {
    const replayInterval = Number(settings?.promotionalGames?.replayInterval ?? 24)
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="relative bg-black rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Come Back Later!</h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
            {replayInterval === 0
              ? 'You have already played this game. With replay interval set to 0, each account can play only once.'
              : `You can play again in ${Math.ceil(replayInterval)} hours.`}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameComponent
      onClose={handleGameClose}
      allowReplay={Number(settings?.promotionalGames?.replayInterval ?? 24) !== 0}
      recordGamePlay={recordGamePlay}
    />
  )
}

export default PromoGameSelector
