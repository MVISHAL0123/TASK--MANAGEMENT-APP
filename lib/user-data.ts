// User data management with proper isolation

export function getCurrentUserEmail(): string | null {
  const userData = localStorage.getItem("taskflow_user")
  if (!userData) return null

  try {
    const user = JSON.parse(userData)
    return user.email
  } catch {
    return null
  }
}

export function getUserTasks(userEmail: string) {
  const tasks = localStorage.getItem(`taskflow_${userEmail}_tasks`)
  return tasks ? JSON.parse(tasks) : []
}

export function setUserTasks(userEmail: string, tasks: any[]) {
  localStorage.setItem(`taskflow_${userEmail}_tasks`, JSON.stringify(tasks))
}

export function getUserNotifications(userEmail: string) {
  const notifications = localStorage.getItem(`taskflow_${userEmail}_notifications`)
  return notifications ? JSON.parse(notifications) : []
}

export function setUserNotifications(userEmail: string, notifications: any[]) {
  localStorage.setItem(`taskflow_${userEmail}_notifications`, JSON.stringify(notifications))
}

export function addUserNotification(userEmail: string, notification: any) {
  const notifications = getUserNotifications(userEmail)
  const newNotification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
  }
  notifications.unshift(newNotification)
  setUserNotifications(userEmail, notifications.slice(0, 50)) // Keep only last 50
}

export function getUserSettings(userEmail: string) {
  const settings = localStorage.getItem(`taskflow_${userEmail}_settings`)
  return settings ? JSON.parse(settings) : {}
}

export function setUserSettings(userEmail: string, settings: any) {
  localStorage.setItem(`taskflow_${userEmail}_settings`, JSON.stringify(settings))
}

export function getUserFocusTime(userEmail: string): number {
  const today = new Date().toDateString()
  const focusTime = localStorage.getItem(`taskflow_${userEmail}_focus_time_${today}`)
  return focusTime ? Number.parseInt(focusTime) : 0
}

export function setUserFocusTime(userEmail: string, minutes: number) {
  const today = new Date().toDateString()
  localStorage.setItem(`taskflow_${userEmail}_focus_time_${today}`, minutes.toString())
}

export function addUserFocusTime(userEmail: string, additionalMinutes: number) {
  const currentTime = getUserFocusTime(userEmail)
  setUserFocusTime(userEmail, currentTime + additionalMinutes)
}

export function getUserFocusSessions(userEmail: string) {
  const sessions = localStorage.getItem(`taskflow_${userEmail}_focus_sessions`)
  return sessions ? JSON.parse(sessions) : []
}

export function setUserFocusSessions(userEmail: string, sessions: any[]) {
  localStorage.setItem(`taskflow_${userEmail}_focus_sessions`, JSON.stringify(sessions))
}

export function addUserFocusSession(userEmail: string, session: any) {
  const sessions = getUserFocusSessions(userEmail)
  sessions.push({
    ...session,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  })
  setUserFocusSessions(userEmail, sessions)
}

export function getUserWorkspaces(userEmail: string) {
  const workspaces = localStorage.getItem(`taskflow_${userEmail}_workspaces`)
  return workspaces ? JSON.parse(workspaces) : []
}

export function setUserWorkspaces(userEmail: string, workspaces: any[]) {
  localStorage.setItem(`taskflow_${userEmail}_workspaces`, JSON.stringify(workspaces))
}

// Migration function to move old global data to user-specific storage
export function migrateOldData(userEmail: string) {
  // Check if user already has data
  const existingTasks = getUserTasks(userEmail)
  if (existingTasks.length > 0) return // Already migrated

  // Migrate old global tasks
  const oldTasks = localStorage.getItem("taskflow_tasks")
  if (oldTasks) {
    const tasks = JSON.parse(oldTasks)
    setUserTasks(userEmail, tasks)
    localStorage.removeItem("taskflow_tasks") // Clean up old data
  }

  // Migrate old global notifications
  const oldNotifications = localStorage.getItem("taskflow_notifications")
  if (oldNotifications) {
    const notifications = JSON.parse(oldNotifications)
    setUserNotifications(userEmail, notifications)
    localStorage.removeItem("taskflow_notifications") // Clean up old data
  }

  // Migrate old global settings
  const oldSettings = localStorage.getItem("taskflow_settings")
  if (oldSettings) {
    const settings = JSON.parse(oldSettings)
    setUserSettings(userEmail, settings)
    localStorage.removeItem("taskflow_settings") // Clean up old data
  }
}
