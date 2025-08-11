"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Copy, Users, Plus, MessageCircle, Settings, Check, Edit, Trash2, Download, Upload } from "lucide-react"
import { getCurrentUserEmail, getUserWorkspaces, setUserWorkspaces } from "@/lib/user-data"

interface Workspace {
  id: string
  name: string
  description: string
  inviteCode: string
  createdBy: string
  createdAt: string
  members: string[]
  messages: Array<{
    id: string
    user: string
    message: string
    timestamp: string
  }>
}

export default function PeoplePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [joinCode, setJoinCode] = useState("")
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    const userObj = JSON.parse(userData)
    setUser(userObj)

    const userEmail = getCurrentUserEmail()
    if (!userEmail) {
      router.push("/")
      return
    }

    // Load user's workspaces
    const userWorkspaces = getUserWorkspaces(userEmail)
    setWorkspaces(userWorkspaces)
  }, [router])

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createWorkspace = () => {
    if (!newWorkspace.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workspace name",
        variant: "destructive",
      })
      return
    }

    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const workspace: Workspace = {
      id: Date.now().toString(),
      name: newWorkspace.name,
      description: newWorkspace.description,
      inviteCode: generateInviteCode(),
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
      members: [userEmail],
      messages: [],
    }

    const updatedWorkspaces = [...workspaces, workspace]
    setWorkspaces(updatedWorkspaces)
    setUserWorkspaces(userEmail, updatedWorkspaces)

    // Also save to global workspace registry
    const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
    globalWorkspaces.push(workspace)
    localStorage.setItem("taskflow_global_workspaces", JSON.stringify(globalWorkspaces))

    setNewWorkspace({ name: "", description: "" })
    setIsCreating(false)

    toast({
      title: "Workspace Created! 🎉",
      description: `"${workspace.name}" has been created successfully`,
    })
  }

  const joinWorkspace = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      })
      return
    }

    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    // Find workspace by invite code in global registry
    const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
    const workspace = globalWorkspaces.find((w: Workspace) => w.inviteCode === joinCode.toUpperCase())

    if (!workspace) {
      toast({
        title: "Invalid Code",
        description: "Workspace not found. Please check the invite code.",
        variant: "destructive",
      })
      return
    }

    // Check if user is already a member
    if (workspace.members.includes(userEmail)) {
      toast({
        title: "Already Joined",
        description: "You are already a member of this workspace",
        variant: "destructive",
      })
      return
    }

    // Add user to workspace members
    workspace.members.push(userEmail)

    // Update global registry
    const updatedGlobalWorkspaces = globalWorkspaces.map((w: Workspace) => (w.id === workspace.id ? workspace : w))
    localStorage.setItem("taskflow_global_workspaces", JSON.stringify(updatedGlobalWorkspaces))

    // Add to user's workspaces
    const updatedWorkspaces = [...workspaces, workspace]
    setWorkspaces(updatedWorkspaces)
    setUserWorkspaces(userEmail, updatedWorkspaces)

    setJoinCode("")

    toast({
      title: "Joined Successfully! 🎉",
      description: `You've joined "${workspace.name}"`,
    })
  }

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)

      toast({
        title: "Copied! 📋",
        description: "Invite code copied to clipboard",
      })

      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const openWorkspaceChat = (workspace: Workspace) => {
    router.push(`/team/${workspace.inviteCode}`)
  }

  const startEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace)
    setEditName(workspace.name)
    setEditDescription(workspace.description)
  }

  const saveWorkspaceEdit = () => {
    if (!editingWorkspace || !editName.trim()) return

    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    const updatedWorkspace = {
      ...editingWorkspace,
      name: editName,
      description: editDescription,
    }

    // Update local workspaces
    const updatedWorkspaces = workspaces.map((w) => (w.id === editingWorkspace.id ? updatedWorkspace : w))
    setWorkspaces(updatedWorkspaces)
    setUserWorkspaces(userEmail, updatedWorkspaces)

    // Update global registry
    const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
    const updatedGlobalWorkspaces = globalWorkspaces.map((w: Workspace) =>
      w.id === editingWorkspace.id ? updatedWorkspace : w,
    )
    localStorage.setItem("taskflow_global_workspaces", JSON.stringify(updatedGlobalWorkspaces))

    setEditingWorkspace(null)
    toast({
      title: "Workspace Updated! ✅",
      description: "Workspace details have been updated successfully",
    })
  }

  const deleteWorkspace = (workspace: Workspace) => {
    const userEmail = getCurrentUserEmail()
    if (!userEmail) return

    // Remove from local workspaces
    const updatedWorkspaces = workspaces.filter((w) => w.id !== workspace.id)
    setWorkspaces(updatedWorkspaces)
    setUserWorkspaces(userEmail, updatedWorkspaces)

    // Remove from global registry
    const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
    const updatedGlobalWorkspaces = globalWorkspaces.filter((w: Workspace) => w.id !== workspace.id)
    localStorage.setItem("taskflow_global_workspaces", JSON.stringify(updatedGlobalWorkspaces))

    toast({
      title: "Workspace Deleted! 🗑️",
      description: `"${workspace.name}" has been deleted successfully`,
    })
  }

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
      description: "Workspace data has been downloaded successfully",
    })
  }

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

          // Update local workspaces
          const userEmail = getCurrentUserEmail()
          if (!userEmail) return

          const updatedWorkspaces = workspaces.map((w) => (w.id === workspace.id ? updatedWorkspace : w))
          setWorkspaces(updatedWorkspaces)
          setUserWorkspaces(userEmail, updatedWorkspaces)

          // Update global registry
          const globalWorkspaces = JSON.parse(localStorage.getItem("taskflow_global_workspaces") || "[]")
          const updatedGlobalWorkspaces = globalWorkspaces.map((w: Workspace) =>
            w.id === workspace.id ? updatedWorkspace : w,
          )
          localStorage.setItem("taskflow_global_workspaces", JSON.stringify(updatedGlobalWorkspaces))

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

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
            <p className="text-gray-600 mt-2">Create workspaces and collaborate with your team</p>
          </div>

          {/* Create/Join Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Workspace
                </CardTitle>
                <CardDescription>Start a new workspace for your team</CardDescription>
              </CardHeader>
              <CardContent>
                {!isCreating ? (
                  <Button onClick={() => setIsCreating(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Workspace
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Workspace Name</label>
                      <Input
                        placeholder="Enter workspace name"
                        value={newWorkspace.name}
                        onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description (Optional)</label>
                      <Input
                        placeholder="Enter workspace description"
                        value={newWorkspace.description}
                        onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={createWorkspace} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Create
                      </Button>
                      <Button onClick={() => setIsCreating(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Join Workspace
                </CardTitle>
                <CardDescription>Enter an invite code to join a workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invite Code</label>
                    <Input
                      placeholder="Enter 6-character code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={joinWorkspace} className="w-full bg-green-600 hover:bg-green-700">
                    Join Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Workspaces */}
          <Card>
            <CardHeader>
              <CardTitle>My Workspaces</CardTitle>
              <CardDescription>Workspaces you've created or joined</CardDescription>
            </CardHeader>
            <CardContent>
              {workspaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workspaces.map((workspace) => (
                    <Card key={workspace.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{workspace.name}</CardTitle>
                            {workspace.description && (
                              <CardDescription className="mt-1">{workspace.description}</CardDescription>
                            )}
                          </div>
                          {workspace.createdBy === getCurrentUserEmail() && (
                            <Badge variant="outline" className="text-xs">
                              Owner
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                          </span>
                          <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                        </div>

                        {workspace.createdBy === getCurrentUserEmail() && (
                          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">Invite Code:</span>
                            <code className="text-sm bg-white px-2 py-1 rounded border">{workspace.inviteCode}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyInviteCode(workspace.inviteCode)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedCode === workspace.inviteCode ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => openWorkspaceChat(workspace)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Open Chat
                          </Button>
                          {workspace.createdBy === getCurrentUserEmail() && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Workspace Settings</DialogTitle>
                                  <DialogDescription>Manage your workspace settings and data</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {/* Rename Workspace */}
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start"
                                      onClick={() => startEditWorkspace(workspace)}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Rename Workspace
                                    </Button>
                                  </div>

                                  {/* Export Data */}
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start"
                                      onClick={() => exportWorkspaceData(workspace)}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Export Chat Data
                                    </Button>
                                  </div>

                                  {/* Import Data */}
                                  <div className="space-y-2">
                                    <label htmlFor={`import-${workspace.id}`}>
                                      <Button variant="outline" className="w-full justify-start" asChild>
                                        <span>
                                          <Upload className="w-4 h-4 mr-2" />
                                          Import Chat Data
                                        </span>
                                      </Button>
                                    </label>
                                    <input
                                      id={`import-${workspace.id}`}
                                      type="file"
                                      accept=".json"
                                      className="hidden"
                                      onChange={(e) => importWorkspaceData(workspace, e)}
                                    />
                                  </div>

                                  {/* Delete Workspace */}
                                  <div className="space-y-2 pt-4 border-t">
                                    <Button
                                      variant="destructive"
                                      className="w-full justify-start"
                                      onClick={() => deleteWorkspace(workspace)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Workspace
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
                  <p className="text-gray-600 mb-4">Create a workspace or join one with an invite code</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Workspace Dialog */}
          {editingWorkspace && (
            <Dialog open={!!editingWorkspace} onOpenChange={() => setEditingWorkspace(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Workspace</DialogTitle>
                  <DialogDescription>Update workspace name and description</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workspace Name</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={saveWorkspaceEdit} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingWorkspace(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
