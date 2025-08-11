"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Loader2, CheckCircle, TrendingUp, Target, Calendar } from "lucide-react"

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

interface DailyReviewProps {
  tasks: Task[]
  completedTasks: number
  timeSpent: number
  focusSessions: number
}

export function DailyReview({ tasks, completedTasks, timeSpent, focusSessions }: DailyReviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [review, setReview] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generateReview = async () => {
    setIsLoading(true)
    setError(null)
    setReview(null) // Reset previous review

    try {
      const response = await fetch("/api/ai/daily-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks, completedTasks, timeSpent, focusSessions }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate daily review")
      }

      const data = await response.json()
      setReview(data)
    } catch (err) {
      setError("Failed to generate daily review. Please try again.")
      console.error("Daily review error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Daily Review Assistant
          </CardTitle>
          <CardDescription>AI-powered insights about your productivity</CardDescription>
        </CardHeader>
        <CardContent>
          {!review && !isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{completedTasks}</div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{focusSessions}</div>
                  <p className="text-sm text-muted-foreground">Focus Sessions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{Math.floor(timeSpent / 60)}h</div>
                  <p className="text-sm text-muted-foreground">Focus Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
              </div>

              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Generate Daily Review</h3>
                <p className="text-muted-foreground mb-6">
                  Generate your daily review to get AI-powered insights about your productivity.
                </p>

                <div className="bg-primary/10 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-primary mb-2">The review includes:</h4>
                  <ul className="text-sm text-primary/80 space-y-1">
                    <li>• Summary of today's work</li>
                    <li>• Key achievements</li>
                    <li>• Personalized recommendations</li>
                    <li>• Tomorrow's focus suggestions</li>
                  </ul>
                </div>

                <Button onClick={generateReview} className="bg-primary hover:bg-primary/90">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Review
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Generating your daily review...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-destructive">{error}</p>
              </div>
              <Button onClick={generateReview} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {review && (
            <div className="space-y-6">
              {/* Productivity Score */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="text-4xl font-bold text-primary">{review.score}/100</div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Local AI</span>
                </div>
                <p className="text-muted-foreground">Productivity Score</p>
                <Progress value={review.score} className="mt-2" />
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    Today's Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.summary}</p>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {review.achievements?.map((achievement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tomorrow's Focus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="w-5 h-5 mr-2" />
                    Tomorrow's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {review.tomorrowFocus?.map((focus: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{focus}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Productivity Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.insights}</p>
                </CardContent>
              </Card>

              <Button onClick={generateReview} variant="outline" className="w-full">
                <Brain className="w-4 h-4 mr-2" />
                Generate New Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
