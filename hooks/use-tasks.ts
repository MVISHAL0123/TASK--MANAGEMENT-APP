"use client"

import { useState, useEffect, useCallback } from "react"
import type { Task } from "@/lib/types"
import { getCurrentUserEmail, getUserTasks, setUserTasks } from "@/lib/user-data"
import { useEnhancedNotification } from "./use-enhanced-notification"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { showTaskCreatedNotification, showTaskCompletedNotification } = useEnhancedNotification()

  // Load user-specific tasks
  const loadTasks = useCallback(() => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) {
      setTasks([])
      setLoading(false)
      return
    }

    const userTasks = getUserTasks(userEmail)
    setTasks(userTasks)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const userEmail = getCurrentUserEmail()
      if (!userEmail) return

      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTasks = [...tasks, newTask]
      setTasks(updatedTasks)
      setUserTasks(userEmail, updatedTasks)

      // Show notification for task creation
      showTaskCreatedNotification(newTask.title)

      console.log("Task created:", newTask.title, "for user:", userEmail)
    },
    [tasks, showTaskCreatedNotification],
  )

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const userEmail = getCurrentUserEmail()
      if (!userEmail) return

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task,
      )

      setTasks(updatedTasks)
      setUserTasks(userEmail, updatedTasks)

      // Show notification if task was completed
      if (updates.status === "completed") {
        const task = tasks.find((t) => t.id === taskId)
        if (task && task.status !== "completed") {
          showTaskCompletedNotification(task.title)
        }
      }
    },
    [tasks, showTaskCompletedNotification],
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      const userEmail = getCurrentUserEmail()
      if (!userEmail) return

      const updatedTasks = tasks.filter((task) => task.id !== taskId)
      setTasks(updatedTasks)
      setUserTasks(userEmail, updatedTasks)
    },
    [tasks],
  )

  const getTasksByProject = useCallback(
    (project: string) => {
      return tasks.filter((task) => task.project === project)
    },
    [tasks],
  )

  const getTasksByStatus = useCallback(
    (status: Task["status"]) => {
      return tasks.filter((task) => task.status === status)
    },
    [tasks],
  )

  // Add missing getTaskStats function
  const getTaskStats = useCallback(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === "completed").length
    const inProgress = tasks.filter((task) => task.status === "in-progress").length
    const todo = tasks.filter((task) => task.status === "todo").length

    return {
      total,
      completed,
      inProgress,
      todo,
    }
  }, [tasks])

  // Add missing getOverdueTasks function
  const getOverdueTasks = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today
    })
  }, [tasks])

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTasksByProject,
    getTasksByStatus,
    getTaskStats,
    getOverdueTasks,
    refreshTasks: loadTasks,
  }
}
