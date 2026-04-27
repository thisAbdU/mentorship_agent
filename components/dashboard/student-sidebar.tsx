"use client"

import { cn } from "@/lib/utils"
import { Student } from "@/lib/mock-data"
import { Users, Bot, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentSidebarProps {
  students: Student[]
  selectedStudent: Student
  onSelectStudent: (student: Student) => void
}

export function StudentSidebar({ students, selectedStudent, onSelectStudent }: StudentSidebarProps) {
  const getStatusColor = (status: Student["updateStatus"]) => {
    switch (status) {
      case "on-track":
        return "bg-primary"
      case "needs-attention":
        return "bg-chart-3"
      case "at-risk":
        return "bg-destructive"
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-semibold text-sidebar-foreground">MENTOR.AI</h1>
          <p className="text-xs text-muted-foreground">Agent Dashboard</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Students ({students.length})
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                selectedStudent.id === student.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  {student.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{student.name}</span>
                  <span className={cn("h-2 w-2 rounded-full", getStatusColor(student.updateStatus))} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{student.curriculum.find(c => c.current)?.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </div>
  )
}
