"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, Plus, Clock } from "lucide-react"

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

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "task" | "focus" | "break"
  task?: Task
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
      const parsedTasks = JSON.parse(savedTasks)
      setTasks(parsedTasks)

      // Convert tasks with due dates to calendar events
      const taskEvents: CalendarEvent[] = parsedTasks
        .filter((task: Task) => task.dueDate)
        .map((task: Task) => ({
          id: task.id,
          title: task.title,
          date: new Date(task.dueDate),
          type: "task" as const,
          task,
        }))

      setEvents(taskEvents)
    }
  }, [router])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const days = getDaysInMonth(currentDate)
  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
              <p className="text-muted-foreground mt-2">View and manage your tasks by date</p>
            </div>

            <Button onClick={() => router.push("/tasks")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                      const dayEvents = getEventsForDate(date)
                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[80px] p-2 border border-border rounded-lg cursor-pointer transition-colors
                            ${date ? "hover:bg-accent" : ""}
                            ${isToday(date) ? "bg-primary/10 border-primary" : ""}
                            ${isSelected(date) ? "bg-accent border-primary" : ""}
                          `}
                          onClick={() => date && setSelectedDate(date)}
                        >
                          {date && (
                            <>
                              <div
                                className={`text-sm font-medium ${isToday(date) ? "text-primary" : "text-foreground"}`}
                              >
                                {date.getDate()}
                              </div>
                              <div className="space-y-1 mt-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                  <div
                                    key={event.id}
                                    className="text-xs p-1 rounded bg-primary/20 text-primary truncate"
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Date Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate
                      ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                      : "Select a Date"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDate
                      ? `${selectedDateEvents.length} task${selectedDateEvents.length !== 1 ? "s" : ""} scheduled`
                      : "Click on a date to view tasks"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="space-y-4">
                      {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No tasks scheduled for this date</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedDateEvents.map((event) => (
                            <div key={event.id} className="p-3 border border-border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-foreground">{event.title}</h4>
                                {event.task && (
                                  <Badge className={getPriorityColor(event.task.priority)}>{event.task.priority}</Badge>
                                )}
                              </div>
                              {event.task && (
                                <>
                                  <p className="text-sm text-muted-foreground mb-2">{event.task.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                      <div
                                        className={`w-2 h-2 rounded-full mr-1 ${
                                          event.task.project === "Work" ? "bg-green-500" : "bg-blue-500"
                                        }`}
                                      />
                                      {event.task.project}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {Math.floor(event.task.timeSpent / 60)}h {event.task.timeSpent % 60}m
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a date to view scheduled tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Tasks</span>
                      <span className="font-medium">{events.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-medium">{events.filter((e) => e.task?.status === "completed").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Overdue</span>
                      <span className="font-medium text-red-600">
                        {
                          events.filter(
                            (e) => e.task && new Date(e.task.dueDate) < new Date() && e.task.status !== "completed",
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
