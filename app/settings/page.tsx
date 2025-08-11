"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/contexts/sound-context"
import { getCurrentUserEmail, getUserSettings, setUserSettings } from "@/lib/user-data"
import { User, Bell, Volume2, Clock, Download, Trash2, Save, Moon, Sun, Monitor, Upload, Database } from "lucide-react"

interface Settings {
  theme: "light" | "dark" | "system"
  soundEffects: boolean
  soundVolume: number
  pushNotifications: boolean
  emailNotifications: boolean
  focusReminders: boolean
  dailyReview: boolean
  taskReminders: boolean
  pomodoroLength: number
  shortBreakLength: number
  longBreakLength: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  keyboardShortcuts: boolean
  autoSave: boolean
  compactMode: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { soundEnabled, setSoundEnabled, volume, setVolume } = useSound()
  const [user, setUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<Settings>({
    theme: "light",
    soundEffects: true,
    soundVolume: 70,
    pushNotifications: true,
    emailNotifications: false,
    focusReminders: true,
    dailyReview: true,
    taskReminders: false,
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    keyboardShortcuts: true,
    autoSave: true,
    compactMode: false,
  })

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)

    // Load user-specific settings
    const userEmail = getCurrentUserEmail()
    if (userEmail) {
      const userSettings = getUserSettings(userEmail)
      setSettings({ ...settings, ...userSettings })

      // Apply saved theme
      applyTheme(userSettings.theme || "light")
    }
  }, [router])

  const handleSaveSettings = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Save to user-specific storage
    setUserSettings(userEmail, settings)

    // Apply theme
    applyTheme(settings.theme)

    // Update sound settings
    setSoundEnabled(settings.soundEffects)
    setVolume(settings.soundVolume / 100)

    // Handle notifications
    if (settings.taskReminders && settings.pushNotifications) {
      requestNotificationPermission()
    }

    toast({
      title: "Settings Saved Successfully! ✅",
      description: "Your preferences have been updated.",
    })
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  const handleExportData = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const data = {
      user: localStorage.getItem("taskflow_user"),
      tasks: localStorage.getItem(`taskflow_${userEmail}_tasks`),
      settings: localStorage.getItem(`taskflow_${userEmail}_settings`),
      notifications: localStorage.getItem(`taskflow_${userEmail}_notifications`),
      focusTime: localStorage.getItem(`taskflow_${userEmail}_focus_time`),
      focusSessions: localStorage.getItem(`taskflow_${userEmail}_focus_sessions`),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `taskflow-backup-${userEmail}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported Successfully! 📁",
      description: "Your personal data has been downloaded.",
    })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const userEmail = getCurrentUserEmail()
        if (!userEmail) return

        // Validate and import user-specific data
        if (data.tasks) localStorage.setItem(`taskflow_${userEmail}_tasks`, data.tasks)
        if (data.settings) {
          localStorage.setItem(`taskflow_${userEmail}_settings`, data.settings)
          const importedSettings = JSON.parse(data.settings)
          setSettings({ ...settings, ...importedSettings })
          applyTheme(importedSettings.theme || "light")
        }
        if (data.notifications) localStorage.setItem(`taskflow_${userEmail}_notifications`, data.notifications)
        if (data.focusTime) localStorage.setItem(`taskflow_${userEmail}_focus_time`, data.focusTime)
        if (data.focusSessions) localStorage.setItem(`taskflow_${userEmail}_focus_sessions`, data.focusSessions)

        toast({
          title: "Data Imported Successfully! 📥",
          description: "Your data has been restored. Please refresh the page.",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Please check the file format and try again.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      const userEmail = getCurrentUserEmail()
      if (!userEmail) return

      localStorage.removeItem(`taskflow_${userEmail}_tasks`)
      localStorage.removeItem(`taskflow_${userEmail}_notifications`)
      localStorage.removeItem(`taskflow_${userEmail}_focus_time`)
      localStorage.removeItem(`taskflow_${userEmail}_focus_sessions`)

      toast({
        title: "Data Cleared Successfully! 🗑️",
        description: "Your personal data has been removed.",
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled! 🔔",
          description: "You'll receive task reminders and updates.",
        })
        scheduleTaskReminders()
      } else if (permission === "denied") {
        toast({
          title: "Notification Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        })
        setSettings({ ...settings, taskReminders: false, pushNotifications: false })
      }
    } else {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      })
      setSettings({ ...settings, taskReminders: false, pushNotifications: false })
    }
  }

  const scheduleTaskReminders = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    // Clear existing interval
    const existingInterval = localStorage.getItem(`taskflow_${userEmail}_reminder_interval`)
    if (existingInterval) {
      clearInterval(Number(existingInterval))
    }

    // Set new interval for every 2 hours
    const intervalId = setInterval(
      () => {
        const tasks = JSON.parse(localStorage.getItem(`taskflow_${userEmail}_tasks`) || "[]")
        const incompleteTasks = tasks.filter((task: any) => task.status !== "completed")

        if (incompleteTasks.length > 0 && settings.taskReminders && settings.pushNotifications) {
          new Notification("TaskFlow Reminder", {
            body: `You have ${incompleteTasks.length} incomplete task${incompleteTasks.length > 1 ? "s" : ""}. Time to make progress!`,
            icon: "/favicon.ico",
          })
        }
      },
      2 * 60 * 60 * 1000,
    ) // 2 hours in milliseconds

    localStorage.setItem(`taskflow_${userEmail}_reminder_interval`, intervalId.toString())
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Customize your TaskFlow experience</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={user.name || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ""} readOnly />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Profile information is read-only in this demo version.</p>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Theme
                </CardTitle>
                <CardDescription>Choose your preferred theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme Mode</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: "light" | "dark" | "system") => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="w-4 h-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="w-4 h-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, pushNotifications: checked })
                      if (!checked) {
                        setSettings({ ...settings, pushNotifications: false, taskReminders: false })
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about incomplete tasks every 2 hours</p>
                  </div>
                  <Switch
                    checked={settings.taskReminders}
                    onCheckedChange={(checked) => {
                      if (checked && settings.pushNotifications) {
                        requestNotificationPermission()
                      } else {
                        setSettings({ ...settings, taskReminders: checked })
                      }
                    }}
                    disabled={!settings.pushNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sound Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Sound & Audio
                </CardTitle>
                <CardDescription>Configure sound effects and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for timer and task completion</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) => setSettings({ ...settings, soundEffects: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Volume ({settings.soundVolume}%)</Label>
                  <Slider
                    value={[settings.soundVolume]}
                    onValueChange={(value) => setSettings({ ...settings, soundVolume: value[0] })}
                    max={100}
                    step={10}
                    disabled={!settings.soundEffects}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timer Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Focus Timer
                </CardTitle>
                <CardDescription>Customize your Pomodoro timer settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pomodoro">Focus Length (minutes)</Label>
                    <Input
                      id="pomodoro"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.pomodoroLength}
                      onChange={(e) =>
                        setSettings({ ...settings, pomodoroLength: Number.parseInt(e.target.value) || 25 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                    <Input
                      id="shortBreak"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakLength}
                      onChange={(e) =>
                        setSettings({ ...settings, shortBreakLength: Number.parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longBreak">Long Break (minutes)</Label>
                    <Input
                      id="longBreak"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakLength}
                      onChange={(e) =>
                        setSettings({ ...settings, longBreakLength: Number.parseInt(e.target.value) || 15 })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Data Management
                </CardTitle>
                <CardDescription>Export, import, or clear your personal data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Export Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">Download all your data as a backup file</p>
                    <Button onClick={handleExportData} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Import Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">Restore data from a backup file</p>
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="flex-1"
                        ref={fileInputRef}
                      />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Clear Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">Remove all your data and start fresh</p>
                    <Button
                      onClick={handleClearData}
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
