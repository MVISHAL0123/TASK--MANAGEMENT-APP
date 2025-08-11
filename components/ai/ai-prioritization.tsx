"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Loader2, CheckCircle } from "lucide-react"

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

interface AIPrioritizationProps {
  tasks: Task[]
  onTasksReordered: (taskIds: string[]) => void
}

export function AIPrioritization({ tasks, onTasksReordered }: AIPrioritizationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate recommendations")
      }

      const data = await response.json()
      setRecommendations(data)

      // Apply the prioritized order
      if (data.prioritizedTasks) {
        onTasksReordered(data.prioritizedTasks)
      }
    } catch (err) {
      setError("Failed to generate AI recommendations. Please try again.")
      console.error("AI prioritization error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Task Prioritization
          </CardTitle>
          <CardDescription>Get intelligent suggestions based on deadlines, importance, and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          {!recommendations && !isLoading && (
            <div className="text-center py-8">
              <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">AI Task Analysis</h3>
              <p className="text-muted-foreground mb-6">
                Click "Get AI Suggestions" to analyze your tasks and receive intelligent prioritization recommendations.
              </p>

              <div className="bg-primary/10 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-primary mb-2">AI considers:</h4>
                <ul className="text-sm text-primary/80 space-y-1">
                  <li>• Deadline urgency</li>
                  <li>• Time already invested</li>
                  <li>• Current task status</li>
                  <li>• Project completion rates</li>
                </ul>
              </div>

              <Button
                onClick={generateRecommendations}
                disabled={tasks.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                <Brain className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing your tasks...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-destructive">{error}</p>
              </div>
              <Button onClick={generateRecommendations} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {recommendations && (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary">AI Insights</h4>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Local AI</span>
                </div>
                <p className="text-sm text-primary/80">{recommendations.insights}</p>
              </div>

              {recommendations.recommendations && (
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {recommendations.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={generateRecommendations} variant="outline">
                  <Brain className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
