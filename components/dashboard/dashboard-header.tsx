"use client"

import Link from "next/link"
import { Student } from "@/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Settings } from "lucide-react"

interface DashboardHeaderProps {
  student: Student
}

export function DashboardHeader({ student }: DashboardHeaderProps) {
  const getStatusConfig = (status: Student["updateStatus"]) => {
    switch (status) {
      case "on-track":
        return { label: "On Track", className: "bg-primary/10 text-primary border-primary/20" }
      case "needs-attention":
        return { label: "Needs Attention", className: "bg-chart-3/10 text-chart-3 border-chart-3/20" }
      case "at-risk":
        return { label: "At Risk", className: "bg-destructive/10 text-destructive border-destructive/20" }
    }
  }

  const statusConfig = getStatusConfig(student.updateStatus)

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-medium">
            {student.avatar}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{student.name}</h1>
            <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Last update: {student.lastUpdate} | Module: {student.curriculum.find(c => c.current)?.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-foreground">
            {student.currentModule}/{student.totalModules}
          </p>
          <p className="text-xs text-muted-foreground">Modules Completed</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
