"use client"

import { useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  getCurrentUserEmail,
  addUserNotification,
  getUserSettings,
  getUserNotifications,
  setUserNotifications,
} from "@/lib/user-data"

interface Task {
  id: string
  title: string
  dueDate: string
  status: string
  priority: "low" | "medium" | "high"
}

export function useEnhancedNotification() {
  const { toast } = useToast()

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }, [])

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      })

      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
    return null
  }, [])

  const showTaskCreatedNotification = (taskTitle: string) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const userSettings = getUserSettings(userEmail)

    // Only show notification if push notifications are enabled
    if (userSettings.pushNotifications !== false) {
      // Default to true if not set
      // Add to notification history
      addUserNotification(userEmail, {
        type: "task_created",
        title: "Task Created",
        message: `"${taskTitle}" has been added to your tasks`,
        icon: "✅",
      })

      // Show toast notification
      toast({
        title: "Task Created Successfully! ✅",
        description: `"${taskTitle}" has been added to your tasks`,
      })

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TaskFlow - Task Created", {
          body: `"${taskTitle}" has been added to your tasks`,
          icon: "/favicon.ico",
        })
      }
    }
  }

  const showTaskCompletedNotification = (taskTitle: string) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const userSettings = getUserSettings(userEmail)

    if (userSettings.pushNotifications !== false) {
      addUserNotification(userEmail, {
        type: "task_completed",
        title: "Task Completed",
        message: `"${taskTitle}" has been completed! 🎉`,
        icon: "🎉",
      })

      toast({
        title: "Task Completed! 🎉",
        description: `"${taskTitle}" has been marked as complete`,
      })

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TaskFlow - Task Completed", {
          body: `"${taskTitle}" has been completed!`,
          icon: "/favicon.ico",
        })
      }
    }
  }

  const showFocusSessionCompleteNotification = (duration: number) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const userSettings = getUserSettings(userEmail)

    if (userSettings.pushNotifications !== false) {
      addUserNotification(userEmail, {
        type: "focus_complete",
        title: "Focus Session Complete",
        message: `Great job! You focused for ${duration} minutes`,
        icon: "🎯",
      })

      toast({
        title: "Focus Session Complete! 🎯",
        description: `Great job! You focused for ${duration} minutes`,
      })

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TaskFlow - Focus Session Complete", {
          body: `Great job! You focused for ${duration} minutes`,
          icon: "/favicon.ico",
        })
      }
    }
  }

  const checkTaskDeadlines = useCallback(() => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const settings = getUserSettings(userEmail)
    if (!settings.taskReminders) {
      return
    }

    const tasks: Task[] = JSON.parse(localStorage.getItem(`taskflow_${userEmail}_tasks`) || "[]")
    const now = new Date()

    tasks.forEach((task) => {
      if (task.status === "completed" || !task.dueDate) return

      const dueDate = new Date(task.dueDate)
      const timeDiff = dueDate.getTime() - now.getTime()
      const hoursDiff = Math.ceil(timeDiff / (1000 * 3600))

      let message = ""
      let urgency = ""

      if (hoursDiff < 0) {
        message = `Task "${task.title}" is overdue! Complete it now! ⚠️`
        urgency = "overdue"
      } else if (hoursDiff <= 2) {
        message = `Only ${hoursDiff} hour${hoursDiff !== 1 ? "s" : ""} left to complete "${task.title}"! Hurry up!! ⏰`
        urgency = "urgent"
      } else if (hoursDiff <= 24) {
        message = `${hoursDiff} hours remaining for "${task.title}". Time to focus! 🎯`
        urgency = "reminder"
      }

      if (message) {
        toast({
          title: urgency === "overdue" ? "Task Overdue!" : urgency === "urgent" ? "Urgent Task!" : "Task Reminder",
          description: message,
          variant: urgency === "overdue" ? "destructive" : "default",
        })

        sendNotification(urgency === "overdue" ? "Task Overdue!" : "Task Deadline Approaching", {
          body: message,
          tag: `task-deadline-${task.id}`,
        })

        // Add to user-specific notification history
        const notification = {
          id: Date.now().toString() + task.id,
          title: urgency === "overdue" ? "Task Overdue" : "Task Deadline",
          message,
          type: urgency === "overdue" ? ("error" as const) : ("warning" as const),
          timestamp: new Date(),
          read: false,
        }

        const existingNotifications = getUserNotifications(userEmail)
        const updatedNotifications = [notification, ...existingNotifications].slice(0, 50)
        setUserNotifications(userEmail, updatedNotifications)

        window.dispatchEvent(new CustomEvent("notificationUpdate"))
      }
    })
  }, [toast, sendNotification])

  const scheduleTaskReminders = useCallback(() => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const settings = getUserSettings(userEmail)
    if (!settings.taskReminders) return

    // Check immediately
    checkTaskDeadlines()

    // Set interval for every hour
    const intervalId = setInterval(checkTaskDeadlines, 60 * 60 * 1000)
    localStorage.setItem(`taskflow_${userEmail}_reminder_interval`, intervalId.toString())

    return () => {
      clearInterval(intervalId)
      localStorage.removeItem(`taskflow_${userEmail}_reminder_interval`)
    }
  }, [checkTaskDeadlines])

  useEffect(() => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const settings = getUserSettings(userEmail)
    if (settings.taskReminders) {
      requestPermission().then((granted) => {
        if (granted) {
          scheduleTaskReminders()
        }
      })
    }

    return () => {
      const existingInterval = localStorage.getItem(`taskflow_${userEmail}_reminder_interval`)
      if (existingInterval) {
        clearInterval(Number(existingInterval))
        localStorage.removeItem(`taskflow_${userEmail}_reminder_interval`)
      }
    }
  }, [requestPermission, scheduleTaskReminders])

  return {
    showTaskCreatedNotification,
    showTaskCompletedNotification,
    showFocusSessionCompleteNotification,
    requestPermission,
    sendNotification,
    checkTaskDeadlines,
    scheduleTaskReminders,
  }
}
