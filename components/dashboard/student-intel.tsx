"use client"

import { DashboardStudent } from "@/lib/mock-data"
import { MessageCircle, Github, Database, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface StudentIntelProps {
  student: DashboardStudent | null
}

export function StudentIntel({ student }: StudentIntelProps) {
  const progressPercent = Math.round((student.currentModule / student.totalModules) * 100)

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "bg-primary/10 text-primary border-primary/20"
      case "good":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "needs-improvement":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Database className="h-4 w-4 text-primary" />
            <span className="font-mono">SHEETS_PROGRESS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Module Progress</span>
              <span className="font-mono text-foreground">{student.currentModule}/{student.totalModules}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {student.curriculum.find(c => c.current)?.name}
              </span>
              <span className="text-xs font-mono text-primary">{progressPercent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="h-4 w-4 text-chart-2" />
            <span className="font-mono">TELEGRAM_UPDATE</span>
            <Badge variant="outline" className="ml-auto text-xs capitalize">
              {student.telegramUpdate.type}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{student.telegramUpdate.date}</p>
            <div className="rounded-lg bg-secondary/50 p-3 border border-border">
              <p className="text-sm leading-relaxed text-foreground">
                {student.telegramUpdate.message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Github className="h-4 w-4 text-chart-5" />
            <span className="font-mono">GITHUB_COMMITS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[180px]">
            <div className="space-y-1 p-4 pt-0">
              {student.githubCommits.map((commit, i) => (
                <div
                  key={commit.sha}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-secondary/50",
                    i === 0 && "bg-secondary/30"
                  )}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary font-mono text-xs text-muted-foreground">
                    {commit.sha.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{commit.date}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", getQualityColor(commit.codeQuality))}
                      >
                        {commit.codeQuality.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
