// Student data from real integrations
export interface LiveStudent {
  id: string
  name: string
  avatar: string
  telegramUsername: string
  telegramChatId?: string
  githubUsername: string
  currentModule: number
  totalModules: number
  lastUpdate: string
  updateStatus: "on-track" | "needs-attention" | "at-risk"
  telegramUpdate?: {
    date: string
    message: string
    type: "monday" | "thursday" | "other"
  }
  githubCommits: {
    sha: string
    message: string
    date: string
    codeQuality: "excellent" | "good" | "needs-improvement"
  }[]
  curriculum: {
    name: string
    completed: boolean
    current: boolean
  }[]
  weeklyConsistency: {
    week: string
    sent: number
    expected: number
  }[]
}

export interface IntegrationStatus {
  telegram: {
    configured: boolean
    botUsername?: string
    webhookUrl?: string
  }
  github: {
    configured: boolean
    rateLimit?: {
      remaining: number
      reset: Date
    }
  }
  googleSheets: {
    configured: boolean
    spreadsheetId?: string
    studentCount?: number
  }
}

export interface AgentConfig {
  mode: "manual" | "autonomous"
  autoSendDelay: number // minutes to wait before auto-sending in autonomous mode
  feedbackTone: "encouraging" | "direct" | "technical"
  includeCodeReview: boolean
  maxFeedbackLength: number
}
