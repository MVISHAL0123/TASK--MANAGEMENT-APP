"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TaskDashboard } from "@/components/task-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, Clock, CheckCircle2, Target, TrendingUp, Trash2 } from "lucide-react"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { getCurrentUserEmail, getUserTasks, getUserFocusTime, setUserTasks } from "@/lib/user-data"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  project: string
  dueDate: string
  timeSpent: number
  createdAt: Date
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [todayFocusTime, setTodayFocusTime] = useState(0)

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    const userObj = JSON.parse(userData)
    setUser(userObj)

    const userEmail = getCurrentUserEmail()
    if (!userEmail) {
      router.push("/")
      return
    }

    // Load user-specific tasks
    const userTasks = getUserTasks(userEmail)
    setTasks(userTasks)

    // Load today's focus time
    const focusTime = getUserFocusTime(userEmail)
    setTodayFocusTime(focusTime)
  }, [router])

  const deleteTask = (taskId: string) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    setUserTasks(userEmail, updatedTasks)
  }

  const updateTaskStatus = (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    setTasks(updatedTasks)
    setUserTasks(userEmail, updatedTasks)
  }

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "todo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header with Notification */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your tasks today</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <Button onClick={() => router.push("/tasks")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">{inProgressTasks} in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(todayFocusTime / 60)}h {todayFocusTime % 60}m
                </div>
                <p className="text-xs text-muted-foreground">Focus time today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Tasks</CardTitle>
                <CardDescription>Your latest tasks and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full mr-1 ${
                                  task.project === "Work" ? "bg-green-500" : "bg-blue-500"
                                }`}
                              />
                              {task.project}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextStatus =
                                task.status === "todo"
                                  ? "in-progress"
                                  : task.status === "in-progress"
                                    ? "completed"
                                    : "todo"
                              updateTaskStatus(task.id, nextStatus)
                            }}
                          >
                            {task.status === "completed"
                              ? "Reopen"
                              : task.status === "in-progress"
                                ? "Complete"
                                : "Start"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-600 mb-4">Create your first task to get started</p>
                    <Button onClick={() => router.push("/tasks")} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task Dashboard Component */}
            <TaskDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
