"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIPrioritization } from "@/components/ai/ai-prioritization"
import { DailyReview } from "@/components/ai/daily-review"
import { Play, Pause, Square, SkipForward, Target, Clock, Volume2, VolumeX } from "lucide-react"
import { useSound } from "@/contexts/sound-context"
import { useFocusTimer } from "@/hooks/use-focus-timer"
import { useEnhancedNotification } from "@/hooks/use-enhanced-notification"
import { getCurrentUserEmail, getUserTasks, setUserTasks } from "@/lib/user-data"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  project: string
  dueDate: string
  timeSpent: number
}

export default function TimerPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<Task[]>([])

  const { soundEnabled, setSoundEnabled, playTaskComplete, playClick } = useSound()
  const { timeLeft, isRunning, sessionType, startTimer, pauseTimer, stopTimer, skipSession } = useFocusTimer()
  const { showTaskCompletedNotification } = useEnhancedNotification()

  const workDuration = 25 * 60
  const breakDuration = 5 * 60

  useEffect(() => {
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    const userEmail = getCurrentUserEmail()
    if (!userEmail) {
      router.push("/")
      return
    }

    // Load user-specific tasks
    const userTasks = getUserTasks(userEmail)
    setTasks(userTasks)

    const incompleteTasks = userTasks.filter((t: Task) => t.status !== "completed")
    const prioritized = incompleteTasks.sort((a: Task, b: Task) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    setAiSuggestions(prioritized.slice(0, 3))

    if (prioritized.length > 0 && !currentTask) {
      setCurrentTask(prioritized[0])
    }
  }, [router, currentTask])

  const completeCurrentTask = () => {
    if (currentTask) {
      const userEmail = getCurrentUserEmail()
      if (!userEmail) return

      const updatedTasks = tasks.map((task) =>
        task.id === currentTask.id ? { ...task, status: "completed" as const } : task,
      )
      setTasks(updatedTasks)
      setUserTasks(userEmail, updatedTasks)

      playTaskComplete()
      showTaskCompletedNotification(currentTask.title)

      const nextTask = aiSuggestions.find((t) => t.id !== currentTask.id)
      setCurrentTask(nextTask || null)
    }
  }

  const handleTasksReordered = (taskIds: string[]) => {
    const reorderedTasks = taskIds.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as Task[]
    setAiSuggestions(reorderedTasks.slice(0, 3))
    if (reorderedTasks.length > 0) {
      setCurrentTask(reorderedTasks[0])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress =
    sessionType === "work"
      ? ((workDuration - timeLeft) / workDuration) * 100
      : ((breakDuration - timeLeft) / breakDuration) * 100

  const getPriorityClass = (priority: string) => {
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Focus Timer & AI Assistant</h1>
              <p className="text-muted-foreground mt-2">
                Timer continues running even when you switch tabs or applications
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSoundEnabled(!soundEnabled)
                playClick()
              }}
              className="flex items-center space-x-2"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? "Sound On" : "Sound Off"}</span>
            </Button>
          </div>

          <Tabs defaultValue="focus" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="focus">Focus Mode</TabsTrigger>
              <TabsTrigger value="ai-prioritization">AI Prioritization</TabsTrigger>
              <TabsTrigger value="daily-review">Daily Review</TabsTrigger>
            </TabsList>

            <TabsContent value="focus" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Focus Timer
                    </CardTitle>
                    <CardDescription>
                      {sessionType === "work" ? "Work Session" : "Break Time"} - Continues running in background
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary mb-4">{formatTime(timeLeft)}</div>
                      <Progress value={progress} className="mb-4" />
                      <p className="text-sm text-muted-foreground">
                        {sessionType === "work" ? "Focus Time" : "Break Time"}
                      </p>
                    </div>

                    <div className="flex justify-center space-x-2">
                      {!isRunning ? (
                        <Button onClick={startTimer} className="bg-primary hover:bg-primary/90">
                          <Play className="w-4 h-4 mr-2" />
                          Start Focus
                        </Button>
                      ) : (
                        <Button onClick={pauseTimer} variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button onClick={stopTimer} variant="outline">
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button onClick={skipSession} variant="outline">
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Task</CardTitle>
                    <CardDescription>
                      {currentTask ? `Active Task (1/${aiSuggestions.length})` : "No task selected"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentTask ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-foreground mb-2">{currentTask.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{currentTask.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityClass(currentTask.priority)}>{currentTask.priority}</Badge>
                            <span className="text-sm text-muted-foreground">• {currentTask.project}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={completeCurrentTask} className="flex-1 bg-primary hover:bg-primary/90">
                            Complete Task
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No tasks available for focus session</p>
                        <Button onClick={() => router.push("/tasks")} className="mt-4 bg-primary hover:bg-primary/90">
                          Create Your First Task
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-prioritization" className="space-y-6">
              <AIPrioritization tasks={tasks} onTasksReordered={handleTasksReordered} />
            </TabsContent>

            <TabsContent value="daily-review" className="space-y-6">
              <DailyReview
                tasks={tasks}
                completedTasks={tasks.filter((t) => t.status === "completed").length}
                timeSpent={0}
                focusSessions={0}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
