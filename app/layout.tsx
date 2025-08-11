import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SoundProvider } from "@/contexts/sound-context"
import { NotificationManager } from "@/components/notifications/notification-manager"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskFlow - AI-Powered Time & Task Manager",
  description: "Transform your productivity with intelligent task prioritization, focus modes, and AI-driven insights.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SoundProvider>
            <NotificationManager />
            {children}
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
