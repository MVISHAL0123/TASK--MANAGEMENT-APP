"use client"

import { useEffect, useCallback } from "react"

export function useNotification() {
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

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
    return null
  }, [])

  const scheduleTaskReminders = useCallback(() => {
    // Clear existing interval
    const existingInterval = localStorage.getItem("taskflow_reminder_interval")
    if (existingInterval) {
      clearInterval(Number(existingInterval))
    }

    // Check if notifications are enabled
    const settings = JSON.parse(localStorage.getItem("taskflow_settings") || "{}")
    if (!settings.taskReminders) return

    // Set new interval for every 2 hours
    const intervalId = setInterval(
      () => {
        const tasks = JSON.parse(localStorage.getItem("taskflow_tasks") || "[]")
        const incompleteTasks = tasks.filter((task: any) => task.status !== "completed")
        const overdueTasks = tasks.filter((task: any) => {
          if (!task.dueDate || task.status === "completed") return false
          return new Date(task.dueDate) < new Date()
        })

        if (incompleteTasks.length > 0) {
          let message = `You have ${incompleteTasks.length} incomplete task${incompleteTasks.length > 1 ? "s" : ""}.`
          if (overdueTasks.length > 0) {
            message += ` ${overdueTasks.length} task${overdueTasks.length > 1 ? "s are" : " is"} overdue!`
          } else {
            message += " Time to make progress!"
          }

          sendNotification("TaskFlow Reminder", {
            body: message,
            tag: "task-reminder",
          })

          // Also add to in-app notifications
          const newNotification = {
            id: Date.now().toString(),
            title: "Task Reminder",
            message,
            type: "info" as const,
            timestamp: new Date(),
            read: false,
          }

          const existingNotifications = JSON.parse(localStorage.getItem("taskflow_notifications") || "[]")
          const updatedNotifications = [newNotification, ...existingNotifications].slice(0, 50) // Keep only last 50
          localStorage.setItem("taskflow_notifications", JSON.stringify(updatedNotifications))
        }
      },
      2 * 60 * 60 * 1000,
    ) // 2 hours in milliseconds

    localStorage.setItem("taskflow_reminder_interval", intervalId.toString())
  }, [sendNotification])

  const stopTaskReminders = useCallback(() => {
    const existingInterval = localStorage.getItem("taskflow_reminder_interval")
    if (existingInterval) {
      clearInterval(Number(existingInterval))
      localStorage.removeItem("taskflow_reminder_interval")
    }
  }, [])

  useEffect(() => {
    // Initialize notifications on mount
    const settings = JSON.parse(localStorage.getItem("taskflow_settings") || "{}")
    if (settings.taskReminders) {
      requestPermission().then((granted) => {
        if (granted) {
          scheduleTaskReminders()
        }
      })
    }

    // Cleanup on unmount
    return () => {
      stopTaskReminders()
    }
  }, [requestPermission, scheduleTaskReminders, stopTaskReminders])

  return {
    requestPermission,
    sendNotification,
    scheduleTaskReminders,
    stopTaskReminders,
  }
}
