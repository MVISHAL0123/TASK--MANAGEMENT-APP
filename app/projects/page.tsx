"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FolderOpen, Calendar, Clock, CheckCircle2, Target } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  color: string
  status: "active" | "completed" | "on-hold"
  createdAt: Date
  dueDate?: Date
  tasks: string[] // Task IDs
}

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

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    dueDate: "",
  })

  const colorOptions = [
    { value: "bg-blue-500", label: "Blue", class: "bg-blue-500" },
    { value: "bg-green-500", label: "Green", class: "bg-green-500" },
    { value: "bg-purple-500", label: "Purple", class: "bg-purple-500" },
    { value: "bg-red-500", label: "Red", class: "bg-red-500" },
    { value: "bg-yellow-500", label: "Yellow", class: "bg-yellow-500" },
    { value: "bg-pink-500", label: "Pink", class: "bg-pink-500" },
    { value: "bg-indigo-500", label: "Indigo", class: "bg-indigo-500" },
    { value: "bg-orange-500", label: "Orange", class: "bg-orange-500" },
  ]

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    // Load projects and tasks
    const savedProjects = localStorage.getItem("taskflow_projects")
    const savedTasks = localStorage.getItem("taskflow_tasks")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    } else {
      // Initialize with default projects
      const defaultProjects: Project[] = [
        {
          id: "personal",
          name: "Personal",
          description: "Personal tasks and goals",
          color: "bg-blue-500",
          status: "active",
          createdAt: new Date(),
          tasks: [],
        },
        {
          id: "work",
          name: "Work",
          description: "Work-related projects and tasks",
          color: "bg-green-500",
          status: "active",
          createdAt: new Date(),
          tasks: [],
        },
      ]
      setProjects(defaultProjects)
      localStorage.setItem("taskflow_projects", JSON.stringify(defaultProjects))
    }
  }, [router])

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      color: newProject.color,
      status: "active",
      createdAt: new Date(),
      dueDate: newProject.dueDate ? new Date(newProject.dueDate) : undefined,
      tasks: [],
    }

    const updatedProjects = [...projects, project]
    setProjects(updatedProjects)
    localStorage.setItem("taskflow_projects", JSON.stringify(updatedProjects))

    // Reset form
    setNewProject({
      name: "",
      description: "",
      color: "bg-blue-500",
      dueDate: "",
    })
    setIsDialogOpen(false)
  }

  const getProjectStats = (projectName: string) => {
    const projectTasks = tasks.filter((task) => task.project === projectName)
    const completedTasks = projectTasks.filter((task) => task.status === "completed")
    const totalTimeSpent = projectTasks.reduce((acc, task) => acc + task.timeSpent, 0)

    return {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      completionRate: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0,
      totalTimeSpent,
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-2">Organize your tasks into meaningful projects</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Add a new project to organize your tasks better.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter project description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={newProject.color}
                      onValueChange={(value) => setNewProject({ ...newProject, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full ${color.class}`} />
                              <span>{color.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newProject.dueDate}
                      onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} className="bg-primary hover:bg-primary/90">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const stats = getProjectStats(project.name)
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/projects/${project.name.toLowerCase()}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${project.color}`} />
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{stats.completionRate}%</span>
                        </div>
                        <Progress value={stats.completionRate} />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>{stats.totalTasks} tasks</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>{stats.completedTasks} done</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{Math.floor(stats.totalTimeSpent / 60)}h</span>
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Empty State */}
            {projects.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first project to organize your tasks</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
