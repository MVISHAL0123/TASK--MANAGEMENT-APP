"use client"

import { useEffect } from "react"
import { useNotification } from "@/hooks/use-notification"

export function NotificationManager() {
  const { scheduleTaskReminders, stopTaskReminders } = useNotification()

  useEffect(() => {
    // Check settings and start/stop reminders accordingly
    const settings = JSON.parse(localStorage.getItem("taskflow_settings") || "{}")

    if (settings.taskReminders) {
      scheduleTaskReminders()
    } else {
      stopTaskReminders()
    }

    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "taskflow_settings") {
        const newSettings = JSON.parse(e.newValue || "{}")
        if (newSettings.taskReminders) {
          scheduleTaskReminders()
        } else {
          stopTaskReminders()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [scheduleTaskReminders, stopTaskReminders])

  return null // This component doesn't render anything
}
