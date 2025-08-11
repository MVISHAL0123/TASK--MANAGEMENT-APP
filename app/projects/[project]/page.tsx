"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Calendar, Clock, CheckCircle2, Circle, PlayCircle } from "lucide-react"
import { TaskEditDialog } from "@/components/task-edit-dialog"

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

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectName = params.project as string
  const [tasks, setTasks] = useState<Task[]>([])
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false)

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    // Load tasks
    const savedTasks = localStorage.getItem("taskflow_tasks")
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks)
      setTasks(allTasks)

      // Filter tasks for this project
      const filtered = allTasks.filter((task: Task) => task.project.toLowerCase() === projectName.toLowerCase())
      setProjectTasks(filtered)
    }
  }, [router, projectName])

  const updateTaskStatus = (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    setTasks(updatedTasks)
    setProjectTasks(updatedTasks.filter((task) => task.project.toLowerCase() === projectName.toLowerCase()))
    localStorage.setItem("taskflow_tasks", JSON.stringify(updatedTasks))
  }

  const getProjectStats = () => {
    const completedTasks = projectTasks.filter((task) => task.status === "completed")
    const totalTimeSpent = projectTasks.reduce((acc, task) => acc + task.timeSpent, 0)

    return {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      completionRate: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0,
      totalTimeSpent,
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-blue-600" />
      case "todo":
        return <Circle className="w-5 h-5 text-gray-400" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const handleTaskEdit = (task: Task) => {
    setEditTask(task)
    setIsTaskEditOpen(true)
  }

  const handleTaskEditClose = () => {
    setIsTaskEditOpen(false)
    setEditTask(null)
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setTasks(updatedTasks)
    setProjectTasks(updatedTasks.filter((task) => task.project.toLowerCase() === projectName.toLowerCase()))
    localStorage.setItem("taskflow_tasks", JSON.stringify(updatedTasks))
    handleTaskEditClose()
  }

  const stats = getProjectStats()
  const capitalizedProjectName = projectName.charAt(0).toUpperCase() + projectName.slice(1)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/projects")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{capitalizedProjectName} Project</h1>
                <p className="text-muted-foreground mt-2">Manage tasks for this project</p>
              </div>
            </div>

            <Button onClick={() => router.push("/tasks")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <Progress value={stats.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(stats.totalTimeSpent / 60)}h {stats.totalTimeSpent % 60}m
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>All tasks assigned to this project</CardDescription>
            </CardHeader>
            <CardContent>
              {projectTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No tasks in this project</h3>
                  <p className="text-muted-foreground mb-4">Create your first task for this project</p>
                  <Button onClick={() => router.push("/tasks")} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-start space-x-4 flex-1">
                        <button
                          onClick={() => {
                            const nextStatus =
                              task.status === "todo"
                                ? "in-progress"
                                : task.status === "in-progress"
                                  ? "completed"
                                  : "todo"
                            updateTaskStatus(task.id, nextStatus)
                          }}
                          className="mt-1"
                        >
                          {getStatusIcon(task.status)}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <button onClick={() => handleTaskEdit(task)}>
                              <h3
                                className={`font-medium ${
                                  task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                                }`}
                              >
                                {task.title}
                              </h3>
                            </button>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {editTask && (
        <TaskEditDialog
          task={editTask}
          isOpen={isTaskEditOpen}
          onClose={handleTaskEditClose}
          onSave={(taskId, updates) => {
            const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
            setTasks(updatedTasks)
            setProjectTasks(updatedTasks.filter((task) => task.project.toLowerCase() === projectName.toLowerCase()))
            localStorage.setItem("taskflow_tasks", JSON.stringify(updatedTasks))
            handleTaskEditClose()
          }}
        />
      )}
    </div>
  )
}
