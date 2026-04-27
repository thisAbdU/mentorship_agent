"use client"

import { useState, useCallback } from "react"
import { students } from "@/lib/mock-data"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StudentIntel } from "@/components/dashboard/student-intel"
import { AgentTerminal } from "@/components/dashboard/agent-terminal"
import { ActionCenter } from "@/components/dashboard/action-center"
import { CurriculumMap } from "@/components/dashboard/curriculum-map"
import { StudentAnalytics } from "@/components/dashboard/student-analytics"

export default function Dashboard() {
  const [selectedStudent, setSelectedStudent] = useState(students[0])
  const [isAgentReady, setIsAgentReady] = useState(false)

  const handleStudentSelect = (student: typeof selectedStudent) => {
    setSelectedStudent(student)
    setIsAgentReady(false)
  }

  const handleProcessingComplete = useCallback(() => {
    setIsAgentReady(true)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar
        students={students}
        selectedStudent={selectedStudent}
        onSelectStudent={handleStudentSelect}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader student={selectedStudent} />

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <CurriculumMap student={selectedStudent} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <StudentIntel student={selectedStudent} />
                <StudentAnalytics student={selectedStudent} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <AgentTerminal
                student={selectedStudent}
                onProcessingComplete={handleProcessingComplete}
              />
            </div>

            <div className="lg:col-span-1">
              <ActionCenter student={selectedStudent} isReady={isAgentReady} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
