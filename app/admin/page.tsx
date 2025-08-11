"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Activity,
  Database,
  Shield,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Settings,
  UserX,
  UserCheck,
} from "lucide-react"
import { isAdmin } from "@/lib/admin"
import {
  getSystemStats,
  getAllUsers,
  getSystemAlerts,
  getRecentActivityAPI,
  createDatabaseBackup,
  suspendUser,
  activateUser,
  resolveAlert,
  getSystemUptimePercentage,
  type UserData,
  type SystemAlert,
} from "@/lib/admin-functions"
import { useToast } from "@/hooks/use-toast"

export default function AdminPanel() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({})
  const [users, setUsers] = useState<UserData[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (!isAdmin(parsedUser.email)) {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
    loadAdminData()

    // Poll for recent activity every 5 seconds
    const interval = setInterval(() => {
      getRecentActivityAPI().then(setRecentActivity)
    }, 5000)
    return () => clearInterval(interval)
  }, [router])

  const loadAdminData = () => {
    setStats(getSystemStats())
    setUsers(getAllUsers())
    setAlerts(getSystemAlerts())
    getRecentActivityAPI().then(setRecentActivity)
  }

  const handleDatabaseBackup = () => {
    try {
      createDatabaseBackup()
      toast({
        title: "Backup Created!",
        description: "Database backup has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive",
      })
    }
  }

  const handleSuspendUser = (userId: string) => {
    suspendUser(userId)
    loadAdminData()
    toast({
      title: "User Suspended",
      description: "User has been suspended successfully.",
    })
  }

  const handleActivateUser = (userId: string) => {
    activateUser(userId)
    loadAdminData()
    toast({
      title: "User Activated",
      description: "User has been activated successfully.",
    })
  }

  const handleResolveAlert = (alertId: string) => {
    resolveAlert(alertId)
    loadAdminData()
    toast({
      title: "Alert Resolved",
      description: "System alert has been marked as resolved.",
    })
  }

  if (!user || !isAdmin(user.email)) {
    return <div>Loading...</div>
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
  const activeUserRate = stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0
  const systemUptimePercentage = getSystemUptimePercentage()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Shield className="w-8 h-8 mr-3 text-red-600" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">System overview and user management</p>
            </div>
            <Badge variant="destructive" className="px-3 py-1">
              Administrator
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active ({activeUserRate}%)
                </p>
                <Progress value={activeUserRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTasks} completed ({completionRate}%)
                </p>
                <Progress value={completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemUptimePercentage}%</div>
                <p className="text-xs text-muted-foreground">{stats.systemUptime}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.storageUsed.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">of allocated space</p>
                <Progress value={stats.storageUsed} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Performance & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  System Performance
                </CardTitle>
                <CardDescription>Real-time performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-muted-foreground">127ms avg</span>
                </div>
                <Progress value={85} />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Performance</span>
                  <span className="text-sm text-muted-foreground">92% optimal</span>
                </div>
                <Progress value={92} />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Server Load</span>
                  <span className="text-sm text-muted-foreground">{Math.round(stats.storageUsed)}% usage</span>
                </div>
                <Progress value={stats.storageUsed} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Admin Actions
              </CardTitle>
              <CardDescription>System management and user controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Users className="w-6 h-6 mb-2" />
                      Manage Users
                      {users.length > 0 && (
                        <Badge variant="secondary" className="mt-1">
                          {users.length}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>User Management</DialogTitle>
                      <DialogDescription>Manage system users and their permissions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.tasksCount} tasks • {user.projectsCount} projects
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                              {user.status === "active" ? (
                                <Button variant="outline" size="sm" onClick={() => handleSuspendUser(user.id)}>
                                  <UserX className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleActivateUser(user.id)}>
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No registered users yet</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleDatabaseBackup}
                >
                  <Database className="w-6 h-6 mb-2" />
                  Database Backup
                </Button>

                <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <AlertTriangle className="w-6 h-6 mb-2" />
                      System Alerts
                      {alerts.filter((a) => !a.resolved).length > 0 && (
                        <Badge variant="destructive" className="mt-1">
                          {alerts.filter((a) => !a.resolved).length}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>System Alerts</DialogTitle>
                      <DialogDescription>Monitor and resolve system issues</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle
                                className={`w-4 h-4 ${
                                  alert.type === "error"
                                    ? "text-red-500"
                                    : alert.type === "warning"
                                      ? "text-yellow-500"
                                      : "text-blue-500"
                                }`}
                              />
                              <h3 className="font-medium">{alert.title}</h3>
                              {alert.resolved && <Badge variant="secondary">Resolved</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!alert.resolved && (
                            <Button variant="outline" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
