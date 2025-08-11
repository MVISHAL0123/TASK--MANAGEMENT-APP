"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
  FolderOpen,
  Plus,
  Zap,
  LogOut,
  HelpCircle,
  Users,
  Shield,
} from "lucide-react"
import { isAdmin } from "@/lib/admin"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "All Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Timer", href: "/timer", icon: Timer },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "People", href: "/people", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

const adminNavigation = [{ name: "Admin Panel", href: "/admin", icon: Shield }]

const projects = [
  { name: "Personal", color: "bg-blue-500" },
  { name: "Work", color: "bg-green-500" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only access localStorage after component mounts to prevent hydration mismatch
    const userData = localStorage.getItem("taskflow_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setMounted(true)
  }, [])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("taskflow_user")
      localStorage.removeItem("taskflow_tasks")
      localStorage.removeItem("taskflow_settings")
      router.push("/")
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const userIsAdmin = user?.email && isAdmin(user.email)

  // Don't render user-specific content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Time & Task Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Projects */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-card-foreground">Projects</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1">
            <Link
              href="/projects"
              className="flex items-center px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <FolderOpen className="w-4 h-4 mr-3" />
              All Projects
            </Link>
            {projects.map((project) => (
              <Link
                key={project.name}
                href={`/projects/${project.name.toLowerCase()}`}
                className="flex items-center px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground"
              >
                <div className={cn("w-3 h-3 rounded-full mr-3", project.color)} />
                {project.name}
              </Link>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
              <span className="text-primary-foreground text-sm font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1">
            <Link href="/help">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-accent-foreground"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-card-foreground">TaskFlow</h1>
            <p className="text-xs text-muted-foreground">{userIsAdmin ? "Admin Panel" : "Time & Task Manager"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}

        {/* Admin Navigation */}
        {userIsAdmin && (
          <>
            <div className="border-t border-border my-4"></div>
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950",
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Projects */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-card-foreground">Projects</h3>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <Link
            href="/projects"
            className="flex items-center px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground"
          >
            <FolderOpen className="w-4 h-4 mr-3" />
            All Projects
          </Link>
          {projects.map((project) => (
            <Link
              key={project.name}
              href={`/projects/${project.name.toLowerCase()}`}
              className="flex items-center px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <div className={cn("w-3 h-3 rounded-full mr-3", project.color)} />
              {project.name}
            </Link>
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        {/* User Info */}
        <div className="flex items-center space-x-3 px-3 py-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              userIsAdmin ? "bg-red-600" : "bg-primary",
            )}
          >
            <span className="text-primary-foreground text-sm font-medium">
              {user?.name ? getUserInitials(user.name) : "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground truncate">
              {user?.name || "User"}
              {userIsAdmin && <span className="text-red-600 ml-1">(Admin)</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1">
          <Link href="/help">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}
