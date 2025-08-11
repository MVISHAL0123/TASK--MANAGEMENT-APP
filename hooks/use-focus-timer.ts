"use client"

import { useState, useEffect, useRef } from "react"
import { useSound } from "@/contexts/sound-context"
import { useEnhancedNotification } from "@/hooks/use-enhanced-notification"
import { getCurrentUserEmail, addUserFocusTime, addUserFocusSession } from "@/lib/user-data"

export function useFocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<"work" | "break">("work")
  const [completedSessions, setCompletedSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const { playTimerComplete, playTimerStart } = useSound()
  const { showFocusSessionCompleteNotification } = useEnhancedNotification()

  const workDuration = 25 * 60 // 25 minutes
  const breakDuration = 5 * 60 // 5 minutes

  useEffect(() => {
    // Load saved timer state only once on mount
    const userEmail = getCurrentUserEmail()
    if (userEmail) {
      const savedState = localStorage.getItem(`taskflow_${userEmail}_timer_state`)
      if (savedState) {
        const state = JSON.parse(savedState)
        setCompletedSessions(state.completedSessions || 0)

        // Only restore timer state if it was actually running
        if (state.isRunning && state.timeLeft && state.sessionType) {
          setTimeLeft(state.timeLeft)
          setSessionType(state.sessionType)
          setIsRunning(false) // Don't auto-start, let user manually start
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const saveTimerState = () => {
    const userEmail = getCurrentUserEmail()
    if (userEmail) {
      localStorage.setItem(
        `taskflow_${userEmail}_timer_state`,
        JSON.stringify({
          completedSessions,
          sessionType,
          timeLeft,
          isRunning,
          lastSaved: Date.now(),
        }),
      )
    }
  }

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true)
      startTimeRef.current = Date.now()
      playTimerStart()

      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            completeSession()
            return sessionType === "work" ? workDuration : breakDuration
          }
          return prevTime - 1
        })
      }, 1000)
    }
  }

  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      setIsRunning(false)

      // Calculate and save focus time for work sessions
      if (sessionType === "work" && startTimeRef.current) {
        const focusedMinutes = Math.floor((Date.now() - startTimeRef.current) / (1000 * 60))
        if (focusedMinutes > 0) {
          const userEmail = getCurrentUserEmail()
          if (userEmail) {
            addUserFocusTime(userEmail, focusedMinutes)
          }
        }
      }

      saveTimerState()
    }
  }

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Save focus time if it was a work session
    if (sessionType === "work" && startTimeRef.current && isRunning) {
      const focusedMinutes = Math.floor((Date.now() - startTimeRef.current) / (1000 * 60))
      if (focusedMinutes > 0) {
        const userEmail = getCurrentUserEmail()
        if (userEmail) {
          addUserFocusTime(userEmail, focusedMinutes)
        }
      }
    }

    setIsRunning(false)
    setTimeLeft(sessionType === "work" ? workDuration : breakDuration)
    startTimeRef.current = null
    saveTimerState()
  }

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsRunning(false)
    setSessionType("work")
    setTimeLeft(workDuration)
    startTimeRef.current = null

    // Clear saved state
    const userEmail = getCurrentUserEmail()
    if (userEmail) {
      localStorage.removeItem(`taskflow_${userEmail}_timer_state`)
    }
  }

  const skipSession = () => {
    completeSession()
  }

  const completeSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    playTimerComplete()
    setIsRunning(false)

    const userEmail = getCurrentUserEmail()
    if (userEmail) {
      if (sessionType === "work") {
        // Add full session time for completed work sessions
        const sessionMinutes = Math.floor(workDuration / 60)
        addUserFocusTime(userEmail, sessionMinutes)

        // Add to focus sessions history
        addUserFocusSession(userEmail, {
          type: "work",
          duration: sessionMinutes,
          completed: true,
        })

        // Show notification
        showFocusSessionCompleteNotification(sessionMinutes)

        // Switch to break
        setSessionType("break")
        setTimeLeft(breakDuration)
        setCompletedSessions((prev) => prev + 1)
      } else {
        // Switch back to work
        setSessionType("work")
        setTimeLeft(workDuration)
      }
    }

    startTimeRef.current = null
    saveTimerState()
  }

  // Save state only when timer is actually running or when sessions complete
  useEffect(() => {
    if (isRunning || completedSessions > 0) {
      saveTimerState()
    }
  }, [completedSessions, sessionType, isRunning])

  return {
    timeLeft,
    isRunning,
    sessionType,
    completedSessions,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    skipSession,
  }
}
