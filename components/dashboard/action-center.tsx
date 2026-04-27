"use client"

import { useState } from "react"
import { Student, generateAgentFeedback } from "@/lib/mock-data"
import { Send, RefreshCw, Pencil, Check, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ActionCenterProps {
  student: Student
  isReady: boolean
}

export function ActionCenter({ student, isReady }: ActionCenterProps) {
  const [feedback, setFeedback] = useState(generateAgentFeedback(student))
  const [isEditing, setIsEditing] = useState(false)
  const [isAutonomous, setIsAutonomous] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleRegenerate = () => {
    setFeedback(generateAgentFeedback(student))
    setSent(false)
  }

  const handleSend = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setSent(true)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-chart-3" />
              <span className="font-mono">AGENT_MODE</span>
            </div>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="autonomous"
                className={cn(
                  "text-xs transition-colors",
                  isAutonomous ? "text-muted-foreground" : "text-foreground"
                )}
              >
                Manual
              </Label>
              <Switch
                id="autonomous"
                checked={isAutonomous}
                onCheckedChange={setIsAutonomous}
              />
              <Label
                htmlFor="autonomous"
                className={cn(
                  "text-xs transition-colors",
                  isAutonomous ? "text-primary" : "text-muted-foreground"
                )}
              >
                Auto
              </Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {isAutonomous
              ? "Agent will automatically send approved feedback to students."
              : "Agent will wait for your approval before sending feedback."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Send className="h-4 w-4 text-chart-2" />
            <span className="font-mono">DRAFT_FEEDBACK</span>
            {sent && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-primary">
                <Check className="h-3 w-3" />
                Sent
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex-1 relative">
            {isEditing ? (
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-full min-h-[300px] resize-none font-mono text-sm bg-secondary/30 border-border"
              />
            ) : (
              <div
                className={cn(
                  "h-full min-h-[300px] rounded-lg border border-border bg-secondary/30 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto",
                  !isReady && "opacity-50"
                )}
              >
                {isReady ? feedback : "Generating feedback..."}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={!isReady}
              className="gap-2"
            >
              <Pencil className="h-3.5 w-3.5" />
              {isEditing ? "Preview" : "Edit"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={!isReady}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!isReady || isSending || sent}
              className="ml-auto gap-2"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Sent
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Approve & Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
