export interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  joinedAt: string
  status: "online" | "offline" | "away"
  avatar?: string
  lastSeen?: string
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  type: "text" | "file" | "system"
  fileUrl?: string
  fileName?: string
  fileSize?: string
}

export interface TeamWorkspace {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  createdAt: string
  members: TeamMember[]
  messages: ChatMessage[]
  files: SharedFile[]
}

export interface SharedFile {
  id: string
  name: string
  url: string
  size: string
  uploadedBy: string
  uploadedAt: string
  type: string
}

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const createWorkspace = (name: string, creatorName: string, creatorEmail: string): TeamWorkspace => {
  const inviteCode = generateInviteCode()
  const creator: TeamMember = {
    id: "creator",
    name: creatorName,
    email: creatorEmail,
    role: "owner",
    joinedAt: new Date().toISOString(),
    status: "online",
  }

  return {
    id: `workspace_${Date.now()}`,
    name,
    inviteCode,
    createdBy: creatorName,
    createdAt: new Date().toISOString(),
    members: [creator],
    messages: [
      {
        id: "welcome",
        senderId: "system",
        senderName: "System",
        message: `Welcome to ${name}! Team workspace created by ${creatorName}.`,
        timestamp: new Date().toISOString(),
        type: "system",
      },
    ],
    files: [],
  }
}
