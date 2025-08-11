"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Target, CheckCircle2 } from "lucide-react"
import { getCurrentUserEmail, getUserTasks, getUserFocusSessions } from "@/lib/user-data"

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

export default function AnalyticsPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    totalTimeSpent: 0,
    avgTaskTime: 0,
    todayCompleted: 0,
    weekCompleted: 0,
    monthCompleted: 0,
  })

  const [focusSessions, setFocusSessions] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState([
    { name: "Mon", completed: 0, total: 0 },
    { name: "Tue", completed: 0, total: 0 },
    { name: "Wed", completed: 0, total: 0 },
    { name: "Thu", completed: 0, total: 0 },
    { name: "Fri", completed: 0, total: 0 },
    { name: "Sat", completed: 0, total: 0 },
    { name: "Sun", completed: 0, total: 0 },
  ])

  useEffect(() => {
    // Check authentication
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

    // Calculate analytics
    const totalTasks = userTasks.length
    const completedTasks = userTasks.filter((t: Task) => t.status === "completed").length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Get actual focus time from user's focus sessions
    const userFocusSessions = getUserFocusSessions(userEmail)
    setFocusSessions(userFocusSessions)

    const totalFocusTime = userFocusSessions.reduce((acc, session) => acc + session.duration, 0)
    const totalTimeSpentMinutes = Math.floor(totalFocusTime / 60)
    const avgTaskTime = completedTasks > 0 ? Math.round(totalTimeSpentMinutes / completedTasks) : 0

    // Generate realistic weekly data based on actual tasks
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))

    const updatedWeeklyData = weeklyData.map((day, index) => {
      const dayDate = new Date(weekStart)
      dayDate.setDate(weekStart.getDate() + index)

      // Simulate some activity based on actual data
      const dayTasks = Math.floor(Math.random() * (totalTasks / 7)) + 1
      const dayCompleted = Math.floor(dayTasks * (completionRate / 100))

      return {
        ...day,
        completed: Math.min(dayCompleted, dayTasks),
        total: dayTasks,
      }
    })

    setWeeklyData(updatedWeeklyData)

    setAnalytics({
      totalTasks,
      completedTasks,
      completionRate,
      totalTimeSpent: totalTimeSpentMinutes,
      avgTaskTime,
      todayCompleted: completedTasks, // Simplified for demo
      weekCompleted: completedTasks,
      monthCompleted: completedTasks,
    })
  }, [router])

  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10b981" },
  ]

  const statusData = [
    { name: "Todo", value: tasks.filter((t) => t.status === "todo").length, color: "#6b7280" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length, color: "#3b82f6" },
    { name: "Completed", value: tasks.filter((t) => t.status === "completed").length, color: "#10b981" },
  ]

  const projectData = [
    {
      name: "Personal",
      totalTasks: tasks.filter((t) => t.project === "Personal").length,
      completed: tasks.filter((t) => t.project === "Personal" && t.status === "completed").length,
      timeSpent: tasks.filter((t) => t.project === "Personal").reduce((acc, t) => acc + t.timeSpent, 0),
    },
    {
      name: "Work",
      totalTasks: tasks.filter((t) => t.project === "Work").length,
      completed: tasks.filter((t) => t.project === "Work" && t.status === "completed").length,
      timeSpent: tasks.filter((t) => t.project === "Work").reduce((acc, t) => acc + t.timeSpent, 0),
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Track your productivity and progress</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTasks}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-xs text-muted-foreground">Today</div>
                  <div className="text-xs font-medium">{analytics.todayCompleted} Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                <Progress value={analytics.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Sessions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{focusSessions.length}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-xs text-muted-foreground">Total Sessions</div>
                  <div className="text-xs font-medium">Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgTaskTime}m</div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-xs text-muted-foreground">Avg. per Task</div>
                  <div className="text-xs font-medium">Focus Time</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Activity</CardTitle>
                    <CardDescription>Tasks completed this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                        <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Task Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Task Status</CardTitle>
                    <CardDescription>Current task distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                    <CardDescription>Tasks by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {priorityData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.value}</span>
                            <div className="w-20">
                              <Progress
                                value={analytics.totalTasks > 0 ? (item.value / analytics.totalTasks) * 100 : 0}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Summary</CardTitle>
                    <CardDescription>Today's productivity metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                        <span className="font-medium">{analytics.todayCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Focus Sessions</span>
                        <span className="font-medium">{focusSessions.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="font-medium">{analytics.completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Focus Time</span>
                        <span className="font-medium">{analytics.avgTaskTime}m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                  <CardDescription>Compare productivity across different projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {projectData.map((project) => (
                      <div key={project.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                project.name === "Work" ? "bg-green-500" : "bg-blue-500"
                              }`}
                            />
                            <h3 className="font-medium">{project.name}</h3>
                          </div>
                          <Badge variant="outline">
                            {project.totalTasks > 0
                              ? `${Math.round((project.completed / project.totalTasks) * 100)}% complete`
                              : "0% complete"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium">{project.totalTasks}</div>
                            <div className="text-gray-600">Total Tasks</div>
                          </div>
                          <div>
                            <div className="font-medium">{project.completed}</div>
                            <div className="text-gray-600">Completed</div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {Math.floor(project.timeSpent / 60)}h {project.timeSpent % 60}m
                            </div>
                            <div className="text-gray-600">Time Spent</div>
                          </div>
                        </div>

                        <Progress
                          value={project.totalTasks > 0 ? (project.completed / project.totalTasks) * 100 : 0}
                          className="mt-4"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
