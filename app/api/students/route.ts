import { NextResponse } from "next/server"
import { getGoogleSheetsService } from "@/lib/services/google-sheets"
import { getGitHubService } from "@/lib/services/github"

/**
 * GET /api/students
 * 
 * Fetches all students from Google Sheets and enriches with GitHub data
 */
export async function GET() {
  try {
    // Check if services are configured
    const hasSheets = !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_ID
    )
    const hasGitHub = !!process.env.GITHUB_TOKEN

    if (!hasSheets) {
      // Return mock data if not configured
      return NextResponse.json({
        source: "mock",
        message: "Google Sheets not configured. Using mock data.",
        students: [],
      })
    }

    const sheets = getGoogleSheetsService()
    const students = await sheets.getStudentData()

    // Optionally enrich with GitHub data
    if (hasGitHub) {
      const github = getGitHubService()
      
      const enrichedStudents = await Promise.all(
        students.map(async (student) => {
          if (!student.githubUsername) {
            return { ...student, githubData: null }
          }

          try {
            const repos = await github.getUserRepositories(student.githubUsername)
            const latestRepo = repos[0] // Most recently pushed repo
            
            let commits: Awaited<ReturnType<typeof github.getCommits>> = []
            let codeQuality = null

            if (latestRepo) {
              commits = await github.getCommits(
                latestRepo.owner.login,
                latestRepo.name,
                { perPage: 5 }
              )
              codeQuality = await github.getCodeQualityMetrics(
                latestRepo.owner.login,
                latestRepo.name
              )
            }

            return {
              ...student,
              githubData: {
                latestRepo: latestRepo?.full_name || null,
                recentCommits: commits.slice(0, 3).map((c) => ({
                  sha: c.sha.substring(0, 7),
                  message: c.commit.message.split("\n")[0],
                  date: c.commit.author.date,
                  quality: github.analyzeCommitMessage(c.commit.message),
                })),
                codeQuality,
              },
            }
          } catch (error) {
            console.error(`Failed to fetch GitHub data for ${student.githubUsername}:`, error)
            return { ...student, githubData: null }
          }
        })
      )

      return NextResponse.json({
        source: "live",
        students: enrichedStudents,
      })
    }

    return NextResponse.json({
      source: "sheets-only",
      students,
    })
  } catch (error) {
    console.error("[API] Failed to fetch students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
