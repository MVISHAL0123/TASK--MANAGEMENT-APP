"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Filter, Calendar, Clock, CheckCircle2, Circle, PlayCircle, Pencil } from "lucide-react"
import { TaskEditDialog } from "@/components/task-edit-dialog"
import { getCurrentUserEmail, getUserTasks, setUserTasks, migrateOldData } from "@/lib/user-data"
import { useEnhancedNotification } from "@/hooks/use-enhanced-notification"

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

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    project: "Personal",
    dueDate: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { showTaskCreatedNotification } = useEnhancedNotification()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    const userObj = JSON.parse(userData)

    // Migrate old data if needed
    migrateOldData(userObj.email)

    // Load user-specific tasks
    const userTasks = getUserTasks(userObj.email)
    setTasks(userTasks)
    setFilteredTasks(userTasks)
  }, [router])

  useEffect(() => {
    // Filter tasks based on search and filters
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus)
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, filterStatus, filterPriority])

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return

    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: "todo",
      project: newTask.project,
      dueDate: newTask.dueDate,
      timeSpent: 0,
    }

    const updatedTasks = [...tasks, task]
    setTasks(updatedTasks)
    setUserTasks(userEmail, updatedTasks)

    // Show notification
    showTaskCreatedNotification(newTask.title)

    // Reset form
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      project: "Personal",
      dueDate: "",
    })
    setIsDialogOpen(false)
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    setTasks(updatedTasks)
    setUserTasks(userEmail, updatedTasks)
  }

  const updateTaskStatus = (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    handleTaskUpdate(taskId, { status: newStatus })
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
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setIsEditDialogOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
              <p className="text-gray-600 mt-2">Manage and organize your personal tasks efficiently</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your personal workflow. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewTask({ ...newTask, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project">Project</Label>
                      <Select
                        value={newTask.project}
                        onValueChange={(value) => setNewTask({ ...newTask, project: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search your tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
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
                          <button
                            onClick={() => handleTaskEdit(task)}
                            className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded transition-colors"
                          >
                            <h3
                              className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : "text-gray-900"}`}
                            >
                              {task.title}
                            </h3>
                            <Pencil className="w-3 h-3 text-gray-500" />
                          </button>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>

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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTasks.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                        ? "Try adjusting your search or filters"
                        : "Create your first task to get started"}
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Dialog */}
      {selectedTask && (
        <TaskEditDialog
          task={selectedTask}
          isOpen={isEditDialogOpen}
          onClose={handleEditClose}
          onSave={handleTaskUpdate}
        />
      )}
    </div>
  )
}
