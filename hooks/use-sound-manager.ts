"use client"

import { useCallback } from "react"

interface SoundManager {
  playTimerComplete: () => void
  playTimerStart: () => void
  playTaskComplete: () => void
  playNotification: () => void
  playSuccess: () => void
  playError: () => void
  playClick: () => void
  playAchievement: () => void
}

export function useSoundManager(): SoundManager {
  // Create audio context for generating tones
  const createTone = useCallback((frequency: number, duration: number, volume = 0.3) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.warn("Audio not supported:", error)
    }
  }, [])

  const playTimerComplete = useCallback(() => {
    // Play a pleasant completion chime (C-E-G chord)
    createTone(523.25, 0.3) // C5
    setTimeout(() => createTone(659.25, 0.3), 100) // E5
    setTimeout(() => createTone(783.99, 0.5), 200) // G5
  }, [createTone])

  const playTimerStart = useCallback(() => {
    // Play a simple start beep
    createTone(440, 0.2) // A4
  }, [createTone])

  const playTaskComplete = useCallback(() => {
    // Play success sound (ascending notes)
    createTone(523.25, 0.15) // C5
    setTimeout(() => createTone(659.25, 0.15), 80) // E5
    setTimeout(() => createTone(783.99, 0.25), 160) // G5
  }, [createTone])

  const playNotification = useCallback(() => {
    // Play notification sound
    createTone(800, 0.1)
    setTimeout(() => createTone(600, 0.1), 120)
  }, [createTone])

  const playSuccess = useCallback(() => {
    // Play success sound
    createTone(523.25, 0.2)
    setTimeout(() => createTone(659.25, 0.3), 100)
  }, [createTone])

  const playError = useCallback(() => {
    // Play error sound (lower frequency)
    createTone(200, 0.3)
  }, [createTone])

  const playClick = useCallback(() => {
    // Play subtle click sound
    createTone(800, 0.05, 0.1)
  }, [createTone])

  const playAchievement = useCallback(() => {
    // Play achievement fanfare
    createTone(523.25, 0.2) // C5
    setTimeout(() => createTone(659.25, 0.2), 100) // E5
    setTimeout(() => createTone(783.99, 0.2), 200) // G5
    setTimeout(() => createTone(1046.5, 0.4), 300) // C6
  }, [createTone])

  return {
    playTimerComplete,
    playTimerStart,
    playTaskComplete,
    playNotification,
    playSuccess,
    playError,
    playClick,
    playAchievement,
  }
}
