"use client"

import { Student } from "@/lib/mock-data"
import { Map, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CurriculumMapProps {
  student: Student
}

export function CurriculumMap({ student }: CurriculumMapProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Map className="h-4 w-4 text-primary" />
          <span className="font-mono">CURRICULUM_MAP</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <ScrollArea className="w-full pb-4">
          <div className="flex items-center gap-1 min-w-max py-2">
            {student.curriculum.map((module, index) => (
              <div key={module.name} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                      module.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : module.current
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    )}
                  >
                    {module.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 text-[10px] text-center max-w-[60px] leading-tight",
                      module.completed || module.current
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {module.name}
                  </span>
                </div>
                {index < student.curriculum.length - 1 && (
                  <ArrowRight
                    className={cn(
                      "mx-1 h-3 w-3",
                      module.completed ? "text-primary" : "text-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
