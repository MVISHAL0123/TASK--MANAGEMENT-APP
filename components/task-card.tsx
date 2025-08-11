"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, Edit, MoreVertical, Trash2, FileEdit } from "lucide-react"
import type { Task } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { TaskForm } from "./task-form"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)

  const getPriorityClass = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
    }
  }

  const getStatusClass = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "status-completed"
      case "in-progress":
        return "status-in-progress"
      case "todo":
        return "status-todo"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <Card className={`w-full ${isOverdue ? "border-destructive bg-destructive/5" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                <FileEdit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <Badge className={getStatusClass(task.status)}>{task.status.replace("-", " ")}</Badge>
          <Badge className={getPriorityClass(task.priority)}>{task.priority}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
              <Calendar className="h-4 w-4" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateTask(task.id, {
                status: task.status === "completed" ? "todo" : "completed",
              })
            }
          >
            {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm task={task} onClose={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Task</DialogTitle>
          </DialogHeader>
          <RenameTaskForm task={task} onClose={() => setIsRenameOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function RenameTaskForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const { updateTask } = useTasks()
  const [title, setTitle] = useState(task.title)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      updateTask(task.id, { title: title.trim() })
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Task Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          required
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
