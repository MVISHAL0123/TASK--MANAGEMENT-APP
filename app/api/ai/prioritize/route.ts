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

// Local AI prioritization algorithm
function prioritizeTasks(tasks: Task[]) {
  const incompleteTasks = tasks.filter((task) => task.status !== "completed")

  // Calculate priority scores
  const scoredTasks = incompleteTasks.map((task) => {
    let score = 0

    // Priority weight (40% of score)
    const priorityWeights = { high: 40, medium: 25, low: 10 }
    score += priorityWeights[task.priority]

    // Due date urgency (30% of score)
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDue <= 1) score += 30
      else if (daysUntilDue <= 3) score += 20
      else if (daysUntilDue <= 7) score += 10
      else score += 5
    }

    // Time investment (20% of score) - tasks with more time invested get higher priority
    const timeBonus = Math.min((task.timeSpent / 60) * 2, 20)
    score += timeBonus

    // In-progress tasks get bonus (10% of score)
    if (task.status === "in-progress") score += 10

    return { ...task, score }
  })

  // Sort by score (highest first)
  return scoredTasks.sort((a, b) => b.score - a.score)
}

function generateRecommendations(tasks: Task[]) {
  const recommendations = []
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "completed")
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "completed") return false
    return new Date(t.dueDate) < new Date()
  })
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress")

  if (overdueTasks.length > 0) {
    recommendations.push(
      `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}. Consider tackling these first.`,
    )
  }

  if (highPriorityTasks.length > 0) {
    recommendations.push(
      `Focus on your ${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? "s" : ""} to maximize impact.`,
    )
  }

  if (inProgressTasks.length > 3) {
    recommendations.push("You have many tasks in progress. Consider completing some before starting new ones.")
  }

  if (inProgressTasks.length > 0) {
    recommendations.push("Continue with your in-progress tasks to maintain momentum.")
  }

  if (recommendations.length === 0) {
    recommendations.push("Great job staying organized! Start with your highest priority tasks.")
  }

  return recommendations
}

function generateInsights(tasks: Task[]) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const insights = [
    `You have a ${completionRate}% task completion rate.`,
    `${tasks.filter((t) => t.priority === "high").length} high-priority tasks need attention.`,
    `Your most active project is "${tasks.reduce(
      (acc, task) => {
        acc[task.project] = (acc[task.project] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )}".`,
  ]

  if (completionRate >= 80) {
    insights.push("Excellent productivity! You're staying on top of your tasks.")
  } else if (completionRate >= 60) {
    insights.push("Good progress! Consider focusing on completing existing tasks.")
  } else {
    insights.push("Focus on completing tasks to improve your productivity momentum.")
  }

  return insights.join(" ")
}

export async function POST(request: NextRequest) {
  try {
    const { tasks } = await request.json()

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Invalid tasks data" }, { status: 400 })
    }

    // Use local AI algorithm
    const prioritizedTasks = prioritizeTasks(tasks)
    const recommendations = generateRecommendations(tasks)
    const insights = generateInsights(tasks)

    const response = {
      prioritizedTasks: prioritizedTasks.map((t) => t.id),
      recommendations,
      insights,
      method: "local-ai",
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("AI prioritization error:", error)
    return NextResponse.json({ error: "Failed to generate AI recommendations" }, { status: 500 })
  }
}
