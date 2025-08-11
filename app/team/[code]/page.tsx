"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Send, Users, Copy, Check, ArrowLeft, Upload, Paperclip } from "lucide-react"
import { getCurrentUserEmail } from "@/lib/user-data"

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: string
  type: "message" | "system" | "file"
  file?: {
    name: string
    type: string
    size: number
    content: string
  }
}

interface Workspace {
  id: string
  name: string
  description: string
  inviteCode: string
  createdBy: string
  createdAt: string
  members: string[]
  messages: ChatMessage[]
}

export default function TeamChatPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const inviteCode = params.code as string

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    loadWorkspace()
  }, [inviteCode, router])

  useEffect(() => {
    scrollToBottom()
  }, [workspace?.messages])

  const loadWorkspace = () => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    // Find workspace in global registry
    const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
    const currentWorkspace = globalWorkspaces.find((w: Workspace) => w.inviteCode === inviteCode)

    if (!currentWorkspace) {
      toast({
        title: "Workspace Not Found",
        description: "This workspace doesn't exist or has been deleted.",
        variant: "destructive",
      })
      router.push("/people")
      return
    }

    // Check if current user is a member
    if (!currentWorkspace.members.includes(userEmail)) {
      toast({
        title: "Access Denied",
        description: "You are not a member of this workspace.",
        variant: "destructive",
      })
      router.push("/people")
      return
    }

    setWorkspace(currentWorkspace)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !workspace || !user) return

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      user: user.name,
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "message",
    }

    const updatedWorkspace = {
      ...workspace,
      messages: [...workspace.messages, message],
    }

    setWorkspace(updatedWorkspace)
    updateWorkspaceInGlobalRegistry(updatedWorkspace)
    setNewMessage("")
  }

  const updateWorkspaceInGlobalRegistry = (updatedWorkspace: Workspace) => {
    const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
    const updatedWorkspaces = globalWorkspaces.map((w: Workspace) =>
      w.inviteCode === inviteCode ? updatedWorkspace : w,
    )
    localStorage.setItem("taskflow_global_workspaces", JSON.stringify(updatedWorkspaces))
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      toast({
        title: "Copied! 📋",
        description: "Invite code copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!workspace || !user) {
        toast({
          title: "Error",
          description: "Please wait until workspace and user are loaded",
          variant: "destructive"
        })
        return
      }
      
      const files = event.target.files
      if (!files || files.length === 0) return
      
      const file = files[0]
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result
        if (content) {
          const newMessage: ChatMessage = {
            id: `file_${Date.now()}`,
            user: user.name,
            message: `📎 ${file.name}`,
            timestamp: new Date().toISOString(),
            type: "file",
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              content: content as string
            }
          }
          
          const updatedWorkspace = {
            ...workspace,
            messages: [...workspace.messages, newMessage],
          }
          
          setWorkspace(updatedWorkspace)
          updateWorkspaceInGlobalRegistry(updatedWorkspace)
          
          // Clear the file input
          event.target.value = ""
          
          toast({
            title: "File Uploaded! 📎",
            description: `${file.name} has been added to the chat`,
          })
        }
      }
      
      if (file.type.includes('text') || file.type.includes('json') || file.type.includes('image')) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the file",
        variant: "destructive"
      })
    }
  }

  // Export chat data as JSON
  const exportWorkspaceData = (workspace: Workspace) => {
    const data = {
      workspace: {
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        members: workspace.members,
      },
      messages: workspace.messages,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${workspace.name.replace(/\s+/g, "_")}_export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Data Exported! 📁",
      description: "Workspace chat data has been downloaded successfully",
    })
  }

  // Import chat data from JSON
  const importWorkspaceData = (workspace: Workspace, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.messages && Array.isArray(importedData.messages)) {
          const updatedWorkspace = {
            ...workspace,
            messages: [...workspace.messages, ...importedData.messages],
          }
          setWorkspace(updatedWorkspace)
          updateWorkspaceInGlobalRegistry(updatedWorkspace)
          toast({
            title: "Data Imported! 📥",
            description: `${importedData.messages.length} messages imported successfully`,
          })
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please select a valid export file.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  if (!workspace || !user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/people")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">{workspace.name}</h1>
              <p className="text-sm text-muted-foreground">{workspace.members.length} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={copyInviteCode}>
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : inviteCode}
            </Button>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {workspace.members.length}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {workspace.messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              workspace.messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-xs font-medium">
                      {message.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{message.user}</span>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    {message.type === "system" ? (
                      <p className="text-sm text-muted-foreground italic">{message.message}</p>
                    ) : message.type === "file" && message.file ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{message.message}</p>
                        <div className="bg-gray-50 rounded-lg p-3 border">
                          {message.file.type.includes('image') ? (
                            <div className="space-y-2">
                              <img 
                                src={message.file.content} 
                                alt={message.file.name}
                                className="max-w-full h-auto rounded max-h-64 object-contain"
                              />
                              <p className="text-xs text-gray-600">
                                {message.file.name} ({(message.file.size / 1024).toFixed(1)} KB)
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (message.file) {
                                    if (message.file.type.startsWith('image/') || message.file.type.startsWith('text/')) {
                                      // For images and text, use Data URL directly
                                      const a = document.createElement('a');
                                      a.href = message.file.content;
                                      a.download = message.file.name;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    } else {
                                      // For other files (e.g., PDF, DOCX), convert base64 Data URL to Blob
                                      const dataUrl = message.file.content;
                                      const arr = dataUrl.split(',');
                                      if (arr.length === 2) {
                                        const mime = dataUrl.match(/^data:(.*?);base64,/)[1];
                                        const bstr = atob(arr[1]);
                                        let n = bstr.length;
                                        const u8arr = new Uint8Array(n);
                                        while (n--) {
                                          u8arr[n] = bstr.charCodeAt(n);
                                        }
                                        const blob = new Blob([u8arr], { type: mime });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = message.file.name;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      }
                                    }
                                  }
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <span className="text-blue-600 text-xs">📄</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{message.file.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {(message.file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              {message.file.type.includes('text') && (
                                <div className="bg-white rounded border p-2 max-h-32 overflow-y-auto">
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                    {message.file.content}
                                  </pre>
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (message.file) {
                                    if (message.file.type.startsWith('image/') || message.file.type.startsWith('text/')) {
                                      // For images and text, use Data URL directly
                                      const a = document.createElement('a');
                                      a.href = message.file.content;
                                      a.download = message.file.name;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    } else {
                                      // For other files (e.g., PDF, DOCX), convert base64 Data URL to Blob
                                      const dataUrl = message.file.content;
                                      const arr = dataUrl.split(',');
                                      if (arr.length === 2) {
                                        const mime = dataUrl.match(/^data:(.*?);base64,/)[1];
                                        const bstr = atob(arr[1]);
                                        let n = bstr.length;
                                        const u8arr = new Uint8Array(n);
                                        while (n--) {
                                          u8arr[n] = bstr.charCodeAt(n);
                                        }
                                        const blob = new Blob([u8arr], { type: mime });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = message.file.name;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      }
                                    }
                                  }
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{message.message}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            
            {/* File Upload Button */}
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                <span>
                  <Paperclip className="w-4 h-4" />
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
  
  
 