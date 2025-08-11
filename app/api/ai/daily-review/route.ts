import { type NextRequest, NextResponse } from "next/server"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  project: string
  dueDate: string
  timeSpent: number
}

function generateDailyReview(tasks: Task[], completedTasks: number, timeSpent: number, focusSessions: number) {
  // Calculate productivity score
  let score = 0

  // Completion rate (40 points)
  const completionRate = tasks.length > 0 ? completedTasks / tasks.length : 0
  score += Math.round(completionRate * 40)

  // Focus time (30 points) - 1 point per 5 minutes, max 30
  score += Math.min(Math.round(timeSpent / 5), 30)

  // Focus sessions (20 points) - 5 points per session, max 20
  score += Math.min(focusSessions * 5, 20)

  // Task variety (10 points) - bonus for working on different projects
  const projects = new Set(tasks.map((t) => t.project))
  score += Math.min(projects.size * 5, 10)

  // Generate summary
  const summaryParts = []
  if (completedTasks > 0) {
    summaryParts.push(`You completed ${completedTasks} task${completedTasks > 1 ? "s" : ""}`)
  }
  if (timeSpent > 0) {
    summaryParts.push(`spent ${Math.floor(timeSpent / 60)} hours and ${timeSpent % 60} minutes in focused work`)
  }
  if (focusSessions > 0) {
    summaryParts.push(`completed ${focusSessions} focus session${focusSessions > 1 ? "s" : ""}`)
  }

  const summary =
    summaryParts.length > 0
      ? `Today you ${summaryParts.join(", ")}. ${score >= 70 ? "Great productivity day!" : score >= 50 ? "Solid progress made!" : "Every step counts - keep building momentum!"}`
      : "Today was a planning day. Tomorrow is a great opportunity to dive into your tasks!"

  // Generate achievements
  const achievements = []
  if (completedTasks >= 3) achievements.push("Completed multiple tasks in one day")
  if (timeSpent >= 120) achievements.push("Maintained focus for over 2 hours")
  if (focusSessions >= 3) achievements.push("Consistent use of focus sessions")
  if (tasks.some((t) => t.priority === "high" && t.status === "completed")) {
    achievements.push("Tackled high-priority tasks")
  }
  if (achievements.length === 0) {
    achievements.push("Stayed organized and planned your work")
  }

  // Generate improvements
  const improvements = []
  if (completedTasks === 0) improvements.push("Try completing at least one small task tomorrow")
  if (timeSpent < 60) improvements.push("Consider using focus sessions to increase deep work time")
  if (focusSessions === 0) improvements.push("Use the Pomodoro timer to maintain focus")
  if (tasks.filter((t) => t.status === "in-progress").length > 3) {
    improvements.push("Focus on completing existing tasks before starting new ones")
  }

  // Generate tomorrow's focus
  const tomorrowFocus = []
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "completed")
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "completed") return false
    return new Date(t.dueDate) <= new Date()
  })

  if (overdueTasks.length > 0) {
    tomorrowFocus.push("Address overdue tasks first thing in the morning")
  }
  if (highPriorityTasks.length > 0) {
    tomorrowFocus.push(`Focus on high-priority tasks: ${highPriorityTasks[0]?.title}`)
  }
  tomorrowFocus.push("Use focus sessions to maintain concentration")
  tomorrowFocus.push("Take regular breaks to maintain energy levels")

  // Generate insights
  const insights = []
  if (score >= 80) {
    insights.push("You're in an excellent productivity flow! Your focus and completion rate are outstanding.")
  } else if (score >= 60) {
    insights.push(
      "You're making solid progress with good focus habits. Consider increasing your daily task completion rate.",
    )
  } else if (score >= 40) {
    insights.push("You're building good habits. Focus on completing more tasks and using focus sessions consistently.")
  } else {
    insights.push(
      "Every journey starts with a single step. Tomorrow is a fresh opportunity to build productive momentum.",
    )
  }

  if (focusSessions > 0 && timeSpent > 0) {
    const avgSessionTime = timeSpent / focusSessions
    if (avgSessionTime >= 20) {
      insights.push("Your focus sessions are well-structured and productive.")
    } else {
      insights.push("Consider extending your focus sessions for deeper concentration.")
    }
  }

  return {
    summary,
    achievements,
    improvements: improvements.length > 0 ? improvements : ["Keep up the great work!"],
    tomorrowFocus,
    insights: insights.join(" "),
    score: Math.min(score, 100),
    method: "local-ai",
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tasks, completedTasks, timeSpent, focusSessions } = await request.json()

    const review = generateDailyReview(tasks || [], completedTasks || 0, timeSpent || 0, focusSessions || 0)

    return NextResponse.json(review)
  } catch (error) {
    console.error("Daily review error:", error)
    return NextResponse.json({ error: "Failed to generate daily review" }, { status: 500 })
  }
}
