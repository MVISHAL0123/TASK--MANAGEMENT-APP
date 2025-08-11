"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, CheckCircle, Clock, Target, Trash2 } from "lucide-react"
import { getCurrentUserEmail, getUserNotifications, setUserNotifications } from "@/lib/user-data"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  icon: string
  timestamp: string
  read: boolean
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()

    // Set up interval to refresh notifications
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const userNotifications = getUserNotifications(userEmail)
    setNotifications(userNotifications)
    setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length)
  }

  const markAsRead = (notificationId: string) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    setUserNotifications(userEmail, updatedNotifications)
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length)
  }

  const markAllAsRead = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updatedNotifications)
    setUserNotifications(userEmail, updatedNotifications)
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedNotifications = notifications.filter((n) => n.id !== notificationId)
    setNotifications(updatedNotifications)
    setUserNotifications(userEmail, updatedNotifications)
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length)
  }

  const clearAllNotifications = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    setNotifications([])
    setUserNotifications(userEmail, [])
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "task_completed":
        return <Target className="w-4 h-4 text-blue-500" />
      case "focus_complete":
        return <Clock className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50 border-l-2 border-blue-500" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll see notifications here when you create tasks or complete focus sessions
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
