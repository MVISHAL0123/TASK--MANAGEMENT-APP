"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, CheckCircle, Users, BarChart3, Timer, AlertCircle } from "lucide-react"
import { registerUser, logRecentActivityAPI } from "@/lib/admin-functions"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  // Get registered users from localStorage
  const getRegisteredUsers = () => {
    const users = localStorage.getItem("taskflow_registered_users")
    return users ? JSON.parse(users) : []
  }

  // Predefined demo users
  const demoUsers = [
    { email: "sri@example.com", password: "password123", name: "Sri" },
    { email: "suba@example.com", password: "password123", name: "Suba" },
    { email: "admin@taskflow.com", password: "admin123", name: "Admin" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isLogin) {
      // Login validation
      const registeredUsers = getRegisteredUsers()
      const allUsers = [...demoUsers, ...registeredUsers]

      const user = allUsers.find((u) => u.email === formData.email)

      if (!user) {
        setError("No account found with this email address. Please sign up first.")
        return
      }

      if (user.password !== formData.password) {
        setError("Incorrect password. Please try again.")
        return
      }

      // Store user data
      localStorage.setItem("taskflow_user", JSON.stringify(user))

      // Register user for admin tracking if not already registered
      registerUser(user)
      await logRecentActivityAPI(user.name, "Logged in")

      toast({
        title: "Login Successful! 🎉",
        description: `Welcome back, ${user.name}!`,
      })

      // Redirect based on user type
      if (user.email === "admin@taskflow.com") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      // Signup validation
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all fields.")
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.")
        return
      }

      // Check if user already exists
      const registeredUsers = getRegisteredUsers()
      const allUsers = [...demoUsers, ...registeredUsers]

      if (allUsers.find((u) => u.email === formData.email)) {
        setError("An account with this email already exists. Please login instead.")
        return
      }

      // Create new user
      const newUser = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }

      // Add to registered users
      const updatedUsers = [...registeredUsers, newUser]
      localStorage.setItem("taskflow_registered_users", JSON.stringify(updatedUsers))
      localStorage.setItem("taskflow_user", JSON.stringify(newUser))

      // Register user for admin tracking
      registerUser(newUser)
      await logRecentActivityAPI(newUser.name, "Signed up")

      toast({
        title: "Account Created! 🎉",
        description: `Welcome to TaskFlow, ${newUser.name}!`,
      })

      router.push("/dashboard")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Background Illustration */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <img
          src="/dashboard-sample.png"
          alt="TaskFlow Illustration"
          className="w-full h-full object-cover object-center opacity-30 blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-100/80" />
      </div>
      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-10">
        {/* Left side - Welcome and Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">
            Welcome to <span className="text-green-600">TaskFlow</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-6 drop-shadow">
            The ultimate productivity platform for teams and individuals
          </p>
          {/* Features (existing code) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Smart Task Management</h3>
                <p className="text-gray-600 text-sm">AI-powered prioritization and organization</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Timer className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Focus Timer</h3>
                <p className="text-gray-600 text-sm">Pomodoro technique with analytics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
                <p className="text-gray-600 text-sm">Real-time chat and project sharing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                <p className="text-gray-600 text-sm">Track productivity and progress</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8 max-w-md">
            <h4 className="font-medium text-green-900 mb-2">Demo Accounts:</h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>
                <strong>User 1:</strong> sri@example.com / password123
              </p>
              <p>
                <strong>User 2:</strong> suba@example.com / password123
              </p>
              <p>
                <strong>Admin:</strong> admin@taskflow.com / admin123
              </p>
            </div>
          </div>
        </div>
        {/* Right side - Login/Signup Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-green-100">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
              <CardDescription>{isLogin ? "Sign in to your TaskFlow account" : "Join TaskFlow today"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? "login" : "signup"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="login"
                    onClick={() => {
                      setIsLogin(true)
                      setError("")
                    }}
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    onClick={() => {
                      setIsLogin(false)
                      setError("")
                    }}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min 6 characters)"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  )
}
