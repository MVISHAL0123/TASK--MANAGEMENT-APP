"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSoundManager } from "@/hooks/use-sound-manager"
import { getCurrentUserEmail, getUserSettings } from "@/lib/user-data"

interface SoundContextType {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  playTimerComplete: () => void
  playTimerStart: () => void
  playTaskComplete: () => void
  playNotification: () => void
  playSuccess: () => void
  playError: () => void
  playClick: () => void
  playAchievement: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.7)
  const soundManager = useSoundManager()

  useEffect(() => {
    // Load sound preferences from user-specific settings
    const userEmail = getCurrentUserEmail()
    if (userEmail) {
      const settings = getUserSettings(userEmail)
      if (typeof settings.soundEffects === "boolean") {
        setSoundEnabled(settings.soundEffects)
      }
      if (typeof settings.soundVolume === "number") {
        setVolume(settings.soundVolume / 100)
      }
    }
  }, [])

  const playSound = (soundFunction: () => void) => {
    if (soundEnabled) {
      soundFunction()
    }
  }

  const contextValue: SoundContextType = {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playTimerComplete: () => playSound(soundManager.playTimerComplete),
    playTimerStart: () => playSound(soundManager.playTimerStart),
    playTaskComplete: () => playSound(soundManager.playTaskComplete),
    playNotification: () => playSound(soundManager.playNotification),
    playSuccess: () => playSound(soundManager.playSuccess),
    playError: () => playSound(soundManager.playError),
    playClick: () => playSound(soundManager.playClick),
    playAchievement: () => playSound(soundManager.playAchievement),
  }

  return <SoundContext.Provider value={contextValue}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
