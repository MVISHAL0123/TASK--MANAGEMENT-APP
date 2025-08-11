export const ADMIN_CREDENTIALS = {
  email: "admin@taskflow.com",
  password: "TaskFlow2025Admin!",
}

export const isAdmin = (email: string): boolean => {
  return email === ADMIN_CREDENTIALS.email
}

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const generateUserId = (): string => {
  return "user_" + Math.random().toString(36).substring(2, 15)
}
