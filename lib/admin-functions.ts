export interface UserData {
  id: string
  name: string
  email: string
  joinedAt: string
  lastActive: string
  status: "active" | "inactive" | "suspended"
  tasksCount: number
  projectsCount: number
}

export interface SystemAlert {
  id: string
  type: "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  resolved: boolean
}

export interface RecentActivity {
  id: string
  user: string
  action: string
  timestamp: string
  time: string
}

export const getSystemStats = () => {
  // Get actual registered users only
  const users = getAllUsers()
  const allTasks = getAllTasks()
  const completedTasks = allTasks.filter((task) => task.status === "completed")

  // Calculate storage usage
  const storageUsed = calculateStorageUsage()

  // Get system uptime
  const uptime = calculateUptime()

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
    systemUptime: uptime,
    storageUsed: storageUsed,
  }
}

export const getAllUsers = (): UserData[] => {
  const registeredUsers = JSON.parse(localStorage.getItem("taskflow_registered_users") || "[]")

  return registeredUsers.map((user: any) => ({
    id: user.id || user.email,
    name: user.name,
    email: user.email,
    joinedAt: user.joinedAt || new Date().toISOString(),
    lastActive: user.lastActive || new Date().toISOString(),
    status: "active" as const,
    tasksCount: getUserTaskCount(user.email),
    projectsCount: 0, // Simplified for now
  }))
}

export const registerUser = (userData: any) => {
  const registeredUsers = JSON.parse(localStorage.getItem("taskflow_registered_users") || "[]")

  // Check if user already exists
  const existingUserIndex = registeredUsers.findIndex((u: any) => u.email === userData.email)
  if (existingUserIndex !== -1) {
    // Update last active
    registeredUsers[existingUserIndex].lastActive = new Date().toISOString()
    localStorage.setItem("taskflow_registered_users", JSON.stringify(registeredUsers))
    return
  }

  // Add new user
  const newUser = {
    ...userData,
    id: userData.email,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  }

  registeredUsers.push(newUser)
  localStorage.setItem("taskflow_registered_users", JSON.stringify(registeredUsers))

  // Set app install date if not set
  if (!localStorage.getItem("taskflow_install_date")) {
    localStorage.setItem("taskflow_install_date", new Date().toISOString())
  }
}

const getUserTaskCount = (email: string): number => {
  const userTasks = JSON.parse(localStorage.getItem(`taskflow_${email}_tasks`) || "[]")
  return userTasks.length
}

const getUserProjectCount = (email: string): number => {
  const userProjects = JSON.parse(localStorage.getItem(`taskflow_${email}_projects`) || "[]")
  return userProjects.length
}

export const getAllTasks = () => {
  // Get tasks from all registered users
  const registeredUsers = JSON.parse(localStorage.getItem("taskflow_registered_users") || "[]")
  let allTasks: any[] = []

  registeredUsers.forEach((user: any) => {
    const userTasks = JSON.parse(localStorage.getItem(`taskflow_${user.email}_tasks`) || "[]")
    allTasks = [...allTasks, ...userTasks]
  })

  return allTasks
}

export const getAllProjects = () => {
  // Get projects from all registered users
  const registeredUsers = JSON.parse(localStorage.getItem("taskflow_registered_users") || "[]")
  let allProjects: any[] = []

  registeredUsers.forEach((user: any) => {
    const userProjects = JSON.parse(localStorage.getItem(`taskflow_${user.email}_projects`) || "[]")
    allProjects = [...allProjects, ...userProjects]
  })

  return allProjects
}

export const calculateStorageUsage = (): number => {
  let totalSize = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith("taskflow_")) {
      totalSize += localStorage[key].length
    }
  }

  // Convert to percentage of 5MB (typical localStorage limit)
  const maxStorage = 5 * 1024 * 1024 // 5MB in bytes
  return Math.min(100, (totalSize / maxStorage) * 100)
}

export const calculateUptime = (): string => {
  const installDate = localStorage.getItem("taskflow_install_date")
  if (!installDate) {
    return "0 days, 0 hours"
  }

  const now = new Date()
  const install = new Date(installDate)
  const diffMs = now.getTime() - install.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return `${days} days, ${hours} hours`
}

export const getSystemUptimePercentage = (): number => {
  return 99.9 // Simplified
}

export const getSystemAlerts = (): SystemAlert[] => {
  const saved = localStorage.getItem("taskflow_system_alerts")
  if (saved) {
    return JSON.parse(saved)
  }

  const alerts: SystemAlert[] = [
    {
      id: "system_info",
      type: "info",
      title: "System Running Smoothly",
      message: "All systems are operational and running normally.",
      timestamp: new Date().toISOString(),
      resolved: false,
    },
  ]

  localStorage.setItem("taskflow_system_alerts", JSON.stringify(alerts))
  return alerts
}

export async function getRecentActivityAPI(): Promise<RecentActivity[]> {
  const res = await fetch('/api/activity', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function logRecentActivityAPI(user: string, action: string) {
  await fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, action }),
  });
}

export const createDatabaseBackup = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    users: getAllUsers(),
    tasks: getAllTasks(),
    systemData: {
      installDate: localStorage.getItem("taskflow_install_date"),
      alerts: localStorage.getItem("taskflow_system_alerts"),
      recentActivity: localStorage.getItem("taskflow_recent_activity"),
    },
  }

  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement("a")
  link.href = url
  link.download = `taskflow-admin-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}

export const suspendUser = (userId: string) => {
  const users = JSON.parse(localStorage.getItem("taskflow_registered_users") || "[]")
  const updatedUsers = users.map((user: any) => (user.id === userId ? { ...user, status: "suspended" } : user))
  localStorage.setItem("taskflow_registered_users", JSON.stringify(updatedUsers))

  addRecentActivity("Admin", `Suspended user ${userId}`)
  return true
}

export const activateUser = (userId: string) => {
  const users = JSON.parse(localStorage.getItem("taskflow_registered_users") || "[]")
  const updatedUsers = users.map((user: any) => (user.id === userId ? { ...user, status: "active" } : user))
  localStorage.setItem("taskflow_registered_users", JSON.stringify(updatedUsers))

  addRecentActivity("Admin", `Activated user ${userId}`)
  return true
}

export const resolveAlert = (alertId: string) => {
  const alerts = getSystemAlerts()
  const updatedAlerts = alerts.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert))
  localStorage.setItem("taskflow_system_alerts", JSON.stringify(updatedAlerts))
  return true
}

export const addRecentActivity = (user: string, action: string) => {
  const activities = JSON.parse(localStorage.getItem("taskflow_recent_activity") || "[]")

  const newActivity = {
    id: Date.now().toString(),
    user,
    action,
    timestamp: new Date().toISOString(),
    time: "Just now",
  }

  const updatedActivities = [newActivity, ...activities].slice(0, 10) // Keep only last 10
  localStorage.setItem("taskflow_recent_activity", JSON.stringify(updatedActivities))
}
