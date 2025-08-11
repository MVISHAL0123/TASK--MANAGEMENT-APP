"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus, CheckCircle, Clock, AlertCircle, ListTodo } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { TaskCard } from "./task-card"
import { TaskForm } from "./task-form"
import type { Task } from "@/lib/types"

export function TaskDashboard() {
  const { tasks, getTasksByStatus, getTaskStats, getOverdueTasks } = useTasks()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const stats = getTaskStats()
  const overdueTasks = getOverdueTasks()

  const renderTaskList = (taskList: Task[]) => {
    if (taskList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tasks found</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {taskList.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TaskForm onClose={() => setIsAddTaskOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderTaskList(tasks)}
        </TabsContent>

        <TabsContent value="todo" className="mt-6">
          {renderTaskList(getTasksByStatus("todo"))}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {renderTaskList(getTasksByStatus("in-progress"))}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {renderTaskList(getTasksByStatus("completed"))}
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          {renderTaskList(overdueTasks)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
