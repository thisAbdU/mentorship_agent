"use client"

import { useEffect, useState } from "react"
import { Student, agentSteps } from "@/lib/mock-data"
import { Bot, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AgentTerminalProps {
  student: Student
  onProcessingComplete: () => void
}

const terminalLogs: Record<number, string[]> = {
  1: [
    "> Connecting to Telegram API...",
    "> Fetching latest updates for student...",
    "> Pulling GitHub commit history...",
    "> Syncing Google Sheets data...",
    "> Data ingestion complete.",
  ],
  2: [
    "> Analyzing update frequency patterns...",
    "> Comparing progress against curriculum timeline...",
    "> Evaluating learning velocity...",
    "> Identifying potential blockers...",
    "> Reasoning phase complete.",
  ],
  3: [
    "> Scanning latest commits...",
    "> Running static code analysis...",
    "> Checking for best practices...",
    "> Evaluating code structure...",
    "> Code review complete.",
  ],
  4: [
    "> Synthesizing insights...",
    "> Personalizing feedback tone...",
    "> Generating actionable suggestions...",
    "> Formatting message...",
    "> Draft ready for review.",
  ],
}

export function AgentTerminal({ student, onProcessingComplete }: AgentTerminalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    setCurrentStep(1)
    setLogs([])
    setIsProcessing(true)

    let stepIndex = 1
    let logIndex = 0

    const processStep = () => {
      if (stepIndex > 4) {
        setIsProcessing(false)
        onProcessingComplete()
        return
      }

      const currentLogs = terminalLogs[stepIndex]
      if (logIndex < currentLogs.length) {
        setLogs((prev) => [...prev, currentLogs[logIndex]])
        logIndex++
        setTimeout(processStep, 300 + Math.random() * 200)
      } else {
        stepIndex++
        logIndex = 0
        setCurrentStep(stepIndex)
        setTimeout(processStep, 500)
      }
    }

    const timeout = setTimeout(processStep, 500)
    return () => clearTimeout(timeout)
  }, [student.id, onProcessingComplete])

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-mono">AGENT_PIPELINE</span>
            {isProcessing && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {agentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : currentStep === step.id && isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium text-center max-w-[70px]",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < agentSteps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-8 transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <span className="font-mono text-primary">$</span>
            <span className="font-mono">LIVE_TERMINAL</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="bg-sidebar rounded-b-lg p-4 font-mono text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">
                  {"// Initializing agent for "}{student.name}...
                </div>
                {logs.filter(Boolean).map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      "transition-opacity",
                      (log && (log.includes("complete") || log.includes("ready")))
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {log}
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="animate-pulse">_</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
