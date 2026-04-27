export interface Student {
  id: string
  name: string
  avatar: string
  currentModule: number
  totalModules: number
  lastUpdate: string
  updateStatus: "on-track" | "needs-attention" | "at-risk"
  telegramUpdate: {
    date: string
    message: string
    type: "monday" | "thursday"
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

export const curriculumPath = [
  "Express Fundamentals",
  "REST API Design",
  "Database Integration",
  "Authentication & Auth",
  "NestJS Architecture",
  "Testing Strategies",
  "Docker & Containers",
  "CI/CD Pipeline",
  "Deployment & DevOps",
  "System Design Basics",
]

export const students: Student[] = [
  {
    id: "1",
    name: "Solomon",
    avatar: "S",
    currentModule: 5,
    totalModules: 10,
    lastUpdate: "2 hours ago",
    updateStatus: "on-track",
    telegramUpdate: {
      date: "Monday, Jan 15",
      message: "Completed the NestJS module setup. Working through dependency injection patterns. Found the providers concept a bit tricky but getting clearer now. Planning to finish the services layer by Thursday.",
      type: "monday",
    },
    githubCommits: [
      { sha: "a1b2c3d", message: "feat: implement user service with DI", date: "2h ago", codeQuality: "excellent" },
      { sha: "e4f5g6h", message: "refactor: extract validation logic", date: "5h ago", codeQuality: "good" },
      { sha: "i7j8k9l", message: "fix: resolve circular dependency", date: "1d ago", codeQuality: "good" },
    ],
    curriculum: curriculumPath.map((name, i) => ({
      name,
      completed: i < 4,
      current: i === 4,
    })),
    weeklyConsistency: [
      { week: "W1", sent: 2, expected: 2 },
      { week: "W2", sent: 2, expected: 2 },
      { week: "W3", sent: 2, expected: 2 },
      { week: "W4", sent: 1, expected: 2 },
      { week: "W5", sent: 2, expected: 2 },
      { week: "W6", sent: 2, expected: 2 },
    ],
  },
  {
    id: "2",
    name: "Elias",
    avatar: "E",
    currentModule: 3,
    totalModules: 10,
    lastUpdate: "1 day ago",
    updateStatus: "needs-attention",
    telegramUpdate: {
      date: "Thursday, Jan 11",
      message: "Still working on PostgreSQL integration. Had some issues with connection pooling but resolved it. Need to catch up on the migration scripts.",
      type: "thursday",
    },
    githubCommits: [
      { sha: "m1n2o3p", message: "feat: add postgres connection config", date: "1d ago", codeQuality: "good" },
      { sha: "q4r5s6t", message: "wip: database migrations setup", date: "2d ago", codeQuality: "needs-improvement" },
      { sha: "u7v8w9x", message: "chore: add pg dependencies", date: "3d ago", codeQuality: "good" },
    ],
    curriculum: curriculumPath.map((name, i) => ({
      name,
      completed: i < 2,
      current: i === 2,
    })),
    weeklyConsistency: [
      { week: "W1", sent: 2, expected: 2 },
      { week: "W2", sent: 1, expected: 2 },
      { week: "W3", sent: 2, expected: 2 },
      { week: "W4", sent: 1, expected: 2 },
      { week: "W5", sent: 1, expected: 2 },
      { week: "W6", sent: 1, expected: 2 },
    ],
  },
  {
    id: "3",
    name: "Miriam",
    avatar: "M",
    currentModule: 7,
    totalModules: 10,
    lastUpdate: "4 hours ago",
    updateStatus: "on-track",
    telegramUpdate: {
      date: "Monday, Jan 15",
      message: "Docker container is running perfectly! Set up multi-stage builds and optimized the image size from 1.2GB to 180MB. Moving on to docker-compose for local dev environment.",
      type: "monday",
    },
    githubCommits: [
      { sha: "y1z2a3b", message: "feat: multi-stage Dockerfile", date: "4h ago", codeQuality: "excellent" },
      { sha: "c4d5e6f", message: "feat: docker-compose setup", date: "6h ago", codeQuality: "excellent" },
      { sha: "g7h8i9j", message: "docs: add container docs", date: "1d ago", codeQuality: "good" },
    ],
    curriculum: curriculumPath.map((name, i) => ({
      name,
      completed: i < 6,
      current: i === 6,
    })),
    weeklyConsistency: [
      { week: "W1", sent: 2, expected: 2 },
      { week: "W2", sent: 2, expected: 2 },
      { week: "W3", sent: 2, expected: 2 },
      { week: "W4", sent: 2, expected: 2 },
      { week: "W5", sent: 2, expected: 2 },
      { week: "W6", sent: 2, expected: 2 },
    ],
  },
  {
    id: "4",
    name: "David",
    avatar: "D",
    currentModule: 4,
    totalModules: 10,
    lastUpdate: "3 days ago",
    updateStatus: "at-risk",
    telegramUpdate: {
      date: "Monday, Jan 8",
      message: "Sorry for the late update. Been dealing with some personal stuff. Will try to catch up on JWT implementation this week.",
      type: "monday",
    },
    githubCommits: [
      { sha: "k1l2m3n", message: "wip: jwt auth middleware", date: "3d ago", codeQuality: "needs-improvement" },
      { sha: "o4p5q6r", message: "feat: add bcrypt for hashing", date: "5d ago", codeQuality: "good" },
      { sha: "s7t8u9v", message: "chore: auth module scaffold", date: "1w ago", codeQuality: "good" },
    ],
    curriculum: curriculumPath.map((name, i) => ({
      name,
      completed: i < 3,
      current: i === 3,
    })),
    weeklyConsistency: [
      { week: "W1", sent: 2, expected: 2 },
      { week: "W2", sent: 2, expected: 2 },
      { week: "W3", sent: 1, expected: 2 },
      { week: "W4", sent: 0, expected: 2 },
      { week: "W5", sent: 1, expected: 2 },
      { week: "W6", sent: 0, expected: 2 },
    ],
  },
  {
    id: "5",
    name: "Sarah",
    avatar: "S",
    currentModule: 8,
    totalModules: 10,
    lastUpdate: "6 hours ago",
    updateStatus: "on-track",
    telegramUpdate: {
      date: "Monday, Jan 15",
      message: "GitHub Actions workflow is set up! Tests run on every PR now. Also added code coverage reporting. Working on the deployment stage next.",
      type: "monday",
    },
    githubCommits: [
      { sha: "w1x2y3z", message: "feat: GitHub Actions CI pipeline", date: "6h ago", codeQuality: "excellent" },
      { sha: "a4b5c6d", message: "feat: add jest coverage", date: "8h ago", codeQuality: "excellent" },
      { sha: "e7f8g9h", message: "test: increase coverage to 85%", date: "1d ago", codeQuality: "excellent" },
    ],
    curriculum: curriculumPath.map((name, i) => ({
      name,
      completed: i < 7,
      current: i === 7,
    })),
    weeklyConsistency: [
      { week: "W1", sent: 2, expected: 2 },
      { week: "W2", sent: 2, expected: 2 },
      { week: "W3", sent: 2, expected: 2 },
      { week: "W4", sent: 2, expected: 2 },
      { week: "W5", sent: 2, expected: 2 },
      { week: "W6", sent: 2, expected: 2 },
    ],
  },
  {
    id: "6",
    name: "James",
    avatar: "J",
    currentModule: 2,
    totalModules: 10,
    lastUpdate: "12 hours ago",
    updateStatus: "on-track",
    telegramUpdate: {
      date: "Thursday, Jan 11",
      message: "REST API is coming along nicely. Implemented proper error handling and status codes. Learning about HATEOAS - should I dive deeper into this?",
      type: "thursday",
    },
    githubCommits: [
      { sha: "i1j2k3l", message: "feat: global error handler", date: "12h ago", codeQuality: "good" },
      { sha: "m4n5o6p", message: "feat: CRUD endpoints for users", date: "1d ago", codeQuality: "good" },
      { sha: "q7r8s9t", message: "refactor: route organization", date: "2d ago", codeQuality: "good" },
    ],
    curriculum: curriculumPath.map((name, i) => ({
      name,
      completed: i < 1,
      current: i === 1,
    })),
    weeklyConsistency: [
      { week: "W1", sent: 2, expected: 2 },
      { week: "W2", sent: 2, expected: 2 },
      { week: "W3", sent: 2, expected: 2 },
      { week: "W4", sent: 2, expected: 2 },
      { week: "W5", sent: 1, expected: 2 },
      { week: "W6", sent: 2, expected: 2 },
    ],
  },
]

export const agentSteps = [
  { id: 1, name: "Data Ingest", description: "Scanning data sources..." },
  { id: 2, name: "Reasoning", description: "Analyzing student progress..." },
  { id: 3, name: "Reviewing Code", description: "Evaluating code quality..." },
  { id: 4, name: "Drafting Feedback", description: "Generating personalized feedback..." },
]

export function generateAgentFeedback(student: Student): string {
  const progressPercent = Math.round((student.currentModule / student.totalModules) * 100)
  const latestCommit = student.githubCommits[0]
  
  if (student.updateStatus === "at-risk") {
    return `Hi ${student.name},\n\nI noticed it's been a few days since your last update. I understand things can get busy, but consistent communication helps us stay on track together.\n\nYour current progress (${progressPercent}%) shows you're working on ${student.curriculum.find(c => c.current)?.name}. Let me know if you're facing any blockers - I'm here to help!\n\nLooking forward to your next update.\n\nBest,\nYour Mentor`
  }
  
  if (student.updateStatus === "needs-attention") {
    return `Hi ${student.name},\n\nThanks for your recent update on ${student.curriculum.find(c => c.current)?.name}. I see you've been making progress but might need some guidance.\n\nYour latest commit "${latestCommit.message}" looks good. A few suggestions:\n- Consider adding more descriptive commit messages\n- Don't forget to write tests as you go\n\nKeep up the momentum! You're ${progressPercent}% through the curriculum.\n\nBest,\nYour Mentor`
  }
  
  return `Hi ${student.name},\n\nExcellent work this week! Your progress on ${student.curriculum.find(c => c.current)?.name} is impressive.\n\nI particularly liked your commit "${latestCommit.message}" - the code quality is ${latestCommit.codeQuality}. You're maintaining great consistency with your updates.\n\nAt ${progressPercent}% completion, you're right on track. Ready to tackle the next challenge?\n\nKeep it up!\n\nBest,\nYour Mentor`
}
