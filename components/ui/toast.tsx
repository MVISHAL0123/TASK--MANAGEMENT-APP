"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center space-x-3 p-4 rounded-lg border shadow-lg max-w-sm",
        getStyles(),
      )}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
