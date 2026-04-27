"use client"

import { Student } from "@/lib/mock-data"
import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

interface StudentAnalyticsProps {
  student: Student
}

export function StudentAnalytics({ student }: StudentAnalyticsProps) {
  const consistencyRate = Math.round(
    (student.weeklyConsistency.reduce((acc, w) => acc + w.sent, 0) /
      student.weeklyConsistency.reduce((acc, w) => acc + w.expected, 0)) *
      100
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4 text-chart-2" />
            <span className="font-mono">STUDENT_PULSE</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Consistency: <span className="font-mono text-foreground">{consistencyRate}%</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={student.weeklyConsistency}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <YAxis
                domain={[0, 2]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                ticks={[0, 1, 2]}
              />
              <Bar dataKey="sent" radius={[4, 4, 0, 0]}>
                {student.weeklyConsistency.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.sent === entry.expected
                        ? "hsl(var(--primary))"
                        : entry.sent > 0
                        ? "hsl(var(--chart-3))"
                        : "hsl(var(--destructive))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-chart-3" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span>Missed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
