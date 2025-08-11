"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { HelpCircle, Search, MessageCircle, Book, Mail, ExternalLink, Zap, Send } from "lucide-react"

export default function HelpPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    email: "",
  })

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("taskflow_user")
    if (!userData) {
      router.push("/")
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "n":
            event.preventDefault()
            router.push("/tasks")
            break
          case " ":
            event.preventDefault()
            router.push("/timer")
            break
          case "k":
            event.preventDefault()
            const searchInput = document.querySelector<HTMLInputElement>(
              'input[placeholder="Search frequently asked questions..."]',
            )
            if (searchInput) {
              searchInput.focus()
              searchInput.select()
            }
            break
          case "b":
            event.preventDefault()
            // Toggle sidebar functionality would go here
            break
          default:
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

  const faqItems = [
    {
      question: "How do I create a new task?",
      answer:
        "You can create a new task by clicking the 'New Task' button on the dashboard or tasks page. Fill in the task details including title, description, priority, project, and due date.",
    },
    {
      question: "How does the AI prioritization work?",
      answer:
        "Our AI analyzes your tasks based on deadlines, priority levels, time already invested, and current status to suggest the optimal order for completing your tasks.",
    },
    {
      question: "Can I customize the Pomodoro timer?",
      answer:
        "Yes! Go to Settings > Focus Timer to customize the length of focus sessions, short breaks, and long breaks. You can also enable auto-start features.",
    },
    {
      question: "How do I organize tasks into projects?",
      answer:
        "When creating a task, select or create a project from the dropdown. You can also manage projects from the Projects page where you can create new projects with custom colors and descriptions.",
    },
    {
      question: "What data is stored locally?",
      answer:
        "All your tasks, projects, settings, and notifications are stored locally in your browser. You can export this data as a backup from the Settings page.",
    },
    {
      question: "How do I enable sound effects?",
      answer:
        "Go to Settings > Sound & Audio and toggle on 'Sound Effects'. You can also adjust the volume level to your preference.",
    },
    {
      question: "Can I change the app theme?",
      answer: "Yes! In Settings > Theme, you can choose between Light, Dark, or System theme to match your preference.",
    },
    {
      question: "How does the daily review work?",
      answer:
        "The daily review uses AI to analyze your productivity patterns and provides insights, achievements, and recommendations for improvement based on your completed tasks and focus time.",
    },
  ]

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate sending email
    const mailtoLink = `mailto:support@taskflow.com?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(contactForm.message)}`
    window.open(mailtoLink, "_blank")

    showToast("Email client opened! Your message has been prepared.", "success")
    setContactForm({ subject: "", message: "", email: "" })
  }

  const openLiveChat = () => {
    // Simulate opening live chat
    const chatWindow = window.open("", "TaskFlowChat", "width=400,height=600,scrollbars=yes,resizable=yes")
    if (chatWindow) {
      chatWindow.document.write(`
        <html>
          <head>
            <title>TaskFlow Live Chat</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
              .chat-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .message { margin: 10px 0; padding: 10px; background: #e3f2fd; border-radius: 5px; }
              .support { background: #f3e5f5; }
              input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
              button { background: #333; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="chat-container">
              <h3>TaskFlow Live Chat</h3>
              <div class="message support">
                <strong>Support Agent:</strong> Hello! Welcome to TaskFlow support. How can I help you today?
              </div>
              <div class="message support">
                <strong>Support Agent:</strong> I'm here to help with any questions about task management, AI features, or technical issues.
              </div>
              <div style="margin-top: 20px;">
                <textarea placeholder="Type your message here..." rows="3"></textarea>
                <button onclick="sendMessage()">Send Message</button>
              </div>
            </div>
            <script>
              function sendMessage() {
                const textarea = document.querySelector('textarea');
                if (textarea.value.trim()) {
                  const chatContainer = document.querySelector('.chat-container');
                  const userMessage = document.createElement('div');
                  userMessage.className = 'message';
                  userMessage.innerHTML = '<strong>You:</strong> ' + textarea.value;
                  chatContainer.insertBefore(userMessage, chatContainer.lastElementChild);
                  
                  // Simulate response
                  setTimeout(() => {
                    const response = document.createElement('div');
                    response.className = 'message support';
                    response.innerHTML = '<strong>Support Agent:</strong> Thank you for your message. Our team will get back to you shortly with a detailed response.';
                    chatContainer.insertBefore(response, chatContainer.lastElementChild);
                  }, 1000);
                  
                  textarea.value = '';
                }
              }
            </script>
          </body>
        </html>
      `)
      chatWindow.document.close()
    }
    showToast("Live chat opened in new window!", "success")
  }

  const openDocumentation = (section: string) => {
    // Create a documentation viewer
    const docWindow = window.open("", "TaskFlowDocs", "width=800,height=600,scrollbars=yes,resizable=yes")
    if (docWindow) {
      const docContent = getDocumentationContent(section)
      docWindow.document.write(`
        <html>
          <head>
            <title>TaskFlow Documentation - ${section}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1, h2, h3 { color: #333; }
              code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
              pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
              .nav { background: #333; color: white; padding: 10px; margin: -20px -20px 20px -20px; }
              .nav a { color: white; text-decoration: none; margin-right: 20px; }
            </style>
          </head>
          <body>
            <div class="nav">
              <strong>TaskFlow Documentation</strong>
              <a href="#" onclick="window.close()">Close</a>
            </div>
            ${docContent}
          </body>
        </html>
      `)
      docWindow.document.close()
    }
    showToast(`${section} documentation opened!`, "success")
  }

  const getDocumentationContent = (section: string) => {
    const docs = {
      "Getting Started": `
        <h1>Getting Started with TaskFlow</h1>
        <h2>Welcome to TaskFlow!</h2>
        <p>TaskFlow is a powerful task management application with AI-powered features to boost your productivity.</p>
        
        <h3>Quick Start</h3>
        <ol>
          <li><strong>Create your first task:</strong> Click the "New Task" button and fill in the details</li>
          <li><strong>Set priorities:</strong> Use High, Medium, or Low priority levels</li>
          <li><strong>Organize with projects:</strong> Group related tasks together</li>
          <li><strong>Use the timer:</strong> Start a focus session with the Pomodoro timer</li>
        </ol>

        <h3>Key Features</h3>
        <ul>
          <li>Task management with priorities and due dates</li>
          <li>AI-powered task prioritization</li>
          <li>Pomodoro timer for focused work sessions</li>
          <li>Project organization</li>
          <li>Analytics and progress tracking</li>
          <li>Notifications and reminders</li>
        </ul>
      `,
      "Task Management": `
        <h1>Task Management Guide</h1>
        
        <h2>Creating Tasks</h2>
        <p>Tasks are the core of TaskFlow. Each task can have:</p>
        <ul>
          <li><strong>Title:</strong> A clear, descriptive name</li>
          <li><strong>Description:</strong> Additional details or notes</li>
          <li><strong>Priority:</strong> High, Medium, or Low</li>
          <li><strong>Status:</strong> To Do, In Progress, or Completed</li>
          <li><strong>Due Date:</strong> When the task should be completed</li>
          <li><strong>Project:</strong> Group related tasks together</li>
        </ul>

        <h2>Task Actions</h2>
        <p>You can perform various actions on tasks:</p>
        <ul>
          <li><strong>Edit:</strong> Modify task details</li>
          <li><strong>Rename:</strong> Quickly change the task title</li>
          <li><strong>Mark Complete:</strong> Update task status</li>
          <li><strong>Delete:</strong> Remove tasks you no longer need</li>
        </ul>

        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li><code>Ctrl + N</code> - Create new task</li>
          <li><code>Ctrl + K</code> - Search tasks</li>
          <li><code>Enter</code> - Save task when editing</li>
          <li><code>Escape</code> - Cancel editing</li>
        </ul>
      `,
      "AI Features": `
        <h1>AI Features Guide</h1>
        
        <h2>AI Task Prioritization</h2>
        <p>TaskFlow's AI analyzes your tasks and suggests the optimal order for completion based on:</p>
        <ul>
          <li>Due dates and deadlines</li>
          <li>Task priority levels</li>
          <li>Time already invested</li>
          <li>Task dependencies</li>
          <li>Your productivity patterns</li>
        </ul>

        <h2>Daily Review</h2>
        <p>The AI-powered daily review provides:</p>
        <ul>
          <li>Productivity insights</li>
          <li>Achievement summaries</li>
          <li>Recommendations for improvement</li>
          <li>Focus time analysis</li>
          <li>Task completion patterns</li>
        </ul>

        <h2>Smart Notifications</h2>
        <p>AI helps determine when to send notifications based on:</p>
        <ul>
          <li>Your work patterns</li>
          <li>Task urgency</li>
          <li>Optimal reminder timing</li>
          <li>Break suggestions</li>
        </ul>
      `,
      "Focus Timer": `
        <h1>Focus Timer & Pomodoro Guide</h1>
        
        <h2>What is the Pomodoro Technique?</h2>
        <p>The Pomodoro Technique is a time management method that uses focused work sessions followed by short breaks.</p>

        <h2>How to Use the Timer</h2>
        <ol>
          <li>Choose a task to work on</li>
          <li>Start a 25-minute focus session</li>
          <li>Work on the task until the timer rings</li>
          <li>Take a 5-minute break</li>
          <li>Repeat the cycle</li>
          <li>After 4 cycles, take a longer 15-30 minute break</li>
        </ol>

        <h2>Customizing Timer Settings</h2>
        <p>You can customize the timer in Settings:</p>
        <ul>
          <li><strong>Focus Length:</strong> 15-60 minutes (default: 25)</li>
          <li><strong>Short Break:</strong> 1-30 minutes (default: 5)</li>
          <li><strong>Long Break:</strong> 1-60 minutes (default: 15)</li>
          <li><strong>Auto-start:</strong> Automatically start breaks or focus sessions</li>
        </ul>

        <h2>Timer Controls</h2>
        <ul>
          <li><code>Ctrl + Space</code> - Start/pause timer</li>
          <li><code>Ctrl + R</code> - Reset timer</li>
          <li>Click the timer to see remaining time</li>
        </ul>
      `,
    }
    return docs[section as keyof typeof docs] || "<h1>Documentation not found</h1>"
  }

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground mt-2">
              Get help with TaskFlow and learn how to maximize your productivity
            </p>
          </div>

          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search frequently asked questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>Find answers to common questions about TaskFlow</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQ.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {filteredFAQ.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No FAQ items found matching your search.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Book className="w-5 h-5 mr-2" />
                      User Guides
                    </CardTitle>
                    <CardDescription>Complete guides and tutorials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => openDocumentation("Getting Started")}
                      >
                        <Book className="w-4 h-4 mr-2" />
                        Getting Started Guide
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => openDocumentation("Task Management")}
                      >
                        <Book className="w-4 h-4 mr-2" />
                        Task Management
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => openDocumentation("AI Features")}
                      >
                        <Book className="w-4 h-4 mr-2" />
                        AI Features Guide
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => openDocumentation("Focus Timer")}
                      >
                        <Book className="w-4 h-4 mr-2" />
                        Focus Timer & Pomodoro
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Quick Reference
                    </CardTitle>
                    <CardDescription>Shortcuts and tips</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Create new task</span>
                            <code className="bg-muted px-2 py-1 rounded">Ctrl + N</code>
                          </div>
                          <div className="flex justify-between">
                            <span>Start focus timer</span>
                            <code className="bg-muted px-2 py-1 rounded">Ctrl + Space</code>
                          </div>
                          <div className="flex justify-between">
                            <span>Search tasks</span>
                            <code className="bg-muted px-2 py-1 rounded">Ctrl + K</code>
                          </div>
                          <div className="flex justify-between">
                            <span>Toggle sidebar</span>
                            <code className="bg-muted px-2 py-1 rounded">Ctrl + B</code>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Pro Tips</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Use AI prioritization to optimize your daily workflow</li>
                          <li>• Set realistic due dates to improve completion rates</li>
                          <li>• Break large tasks into smaller, manageable subtasks</li>
                          <li>• Use the Pomodoro timer for better focus sessions</li>
                          <li>• Review your analytics weekly to track progress</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Support
                    </CardTitle>
                    <CardDescription>Send us a message and we'll get back to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input
                          id="subject"
                          placeholder="How can we help?"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Describe your issue or question..."
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Other Ways to Get Help</CardTitle>
                    <CardDescription>Additional support resources</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div
                        className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => {
                          const mailtoLink = "mailto:support@taskflow.com?subject=TaskFlow Support Request"
                          window.open(mailtoLink, "_blank")
                          showToast("Email client opened!", "success")
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Email Support</p>
                            <p className="text-sm text-muted-foreground">support@taskflow.com</p>
                          </div>
                        </div>
                        <Badge variant="outline">24h response</Badge>
                      </div>

                      <div
                        className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={openLiveChat}
                      >
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Live Chat</p>
                            <p className="text-sm text-muted-foreground">Available 9 AM - 5 PM EST</p>
                          </div>
                        </div>
                        <Badge variant="outline">Online</Badge>
                      </div>

                      <div
                        className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => openDocumentation("Getting Started")}
                      >
                        <div className="flex items-center space-x-3">
                          <Book className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Documentation</p>
                            <p className="text-sm text-muted-foreground">Comprehensive guides</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
