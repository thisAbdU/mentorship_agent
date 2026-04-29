import { NextResponse } from 'next/server'

// In-memory database for demo - replace with real DB in production
let studentDatabase: any[] = []
let lastSyncTime: string | null = null

/**
 * GET /api/students - Fetches all students with dynamic field mapping
 */
export async function GET() {
  try {
    return NextResponse.json({
      source: "database",
      students: studentDatabase,
      lastSync: lastSyncTime,
      count: studentDatabase.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

/**
 * POST /api/students - Updates student database with AI-mapped data
 */
export async function POST(request: Request) {
  try {
    const { students, source, fileId, tabName } = await request.json()
    
    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid students data' }, { status: 400 })
    }

    // Update database with new data
    studentDatabase = students.map((student: any) => ({
      id: student.name?.toLowerCase().replace(/\s+/g, '-') || Date.now().toString(),
      name: student.name || '',
      email: student.email || '',
      githubUsername: student.githubUsername || '',
      githubStatus: student.githubStatus || 'no-username',
      avatar: student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || '')}&background=random`,
      currentModule: student.currentModule || 'Getting Started',
      totalModules: student.totalModules || 10,
      lastUpdate: new Date().toISOString(),
      updateStatus: student.githubStatus === 'connected' ? 'on-track' : 'needs-attention',
      telegramUpdate: {
        date: new Date().toISOString(),
        message: `Synced from ${source || 'unknown'}`,
        type: 'sync'
      },
      githubCommits: student.githubActivity || [],
      curriculum: generateCurriculum(student),
      weeklyConsistency: generateWeeklyData(student),
      metadata: {
        source,
        fileId,
        tabName,
        syncedAt: new Date().toISOString()
      }
    }))

    lastSyncTime = new Date().toISOString()

    return NextResponse.json({ 
      success: true, 
      count: studentDatabase.length,
      students: studentDatabase,
      source: 'database-updated'
    })
  } catch (error) {
    console.error('Failed to update students:', error)
    return NextResponse.json({ error: 'Failed to update students' }, { status: 500 })
  }
}

// Helper functions to generate realistic demo data
function generateCurriculum(student: any) {
  const modules = [
    'Getting Started', 'Environment Setup', 'Basic Concepts', 
    'Advanced Topics', 'Project Work', 'Code Review',
    'Final Assessment', 'Next Steps'
  ]
  
  const currentModuleIndex = Math.floor(Math.random() * modules.length)
  
  return modules.map((module, index) => ({
    id: `module-${index}`,
    name: module,
    completed: index < currentModuleIndex,
    current: index === currentModuleIndex
  }))
}

function generateWeeklyData(student: any) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  return weeks.map(week => ({
    week,
    sent: Math.random() > 0.3 ? 1 : 0,
    expected: 1
  }))
}
