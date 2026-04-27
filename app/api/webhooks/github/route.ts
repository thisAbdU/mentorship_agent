import { NextRequest, NextResponse } from "next/server"
import { getGitHubService } from "@/lib/services/github"
import { getGoogleSheetsService } from "@/lib/services/google-sheets"

/**
 * GitHub Webhook Handler
 * 
 * This endpoint receives push events from GitHub when students commit code.
 * 
 * To set up:
 * 1. Go to your GitHub repo > Settings > Webhooks
 * 2. Add webhook with URL: https://your-domain.com/api/webhooks/github
 * 3. Content type: application/json
 * 4. Select "Just the push event"
 * 5. Optionally add a secret and verify it here
 */

interface GitHubPushEvent {
  ref: string
  commits: {
    id: string
    message: string
    author: {
      name: string
      email: string
      username?: string
    }
    timestamp: string
  }[]
  pusher: {
    name: string
    email: string
  }
  repository: {
    name: string
    full_name: string
    owner: {
      login: string
    }
  }
  sender: {
    login: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = request.headers.get("x-github-event")
    
    if (event !== "push") {
      return NextResponse.json({ ok: true, message: "Ignored non-push event" })
    }

    const payload: GitHubPushEvent = await request.json()
    
    // Verify webhook secret if configured
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret) {
      const signature = request.headers.get("x-hub-signature-256")
      // TODO: Implement signature verification
      // const isValid = verifySignature(payload, signature, secret)
      // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const github = getGitHubService()
    const sheets = getGoogleSheetsService()
    const senderUsername = payload.sender.login

    // Find the student by GitHub username
    const student = await sheets.findStudentByGitHub(senderUsername)
    
    if (student) {
      // Update last activity
      await sheets.updateStudentRow(student.rowIndex, {
        lastUpdate: new Date().toISOString().split("T")[0],
      })
    }

    // Analyze code quality for each commit
    const commitAnalysis = payload.commits.map((commit) => ({
      sha: commit.id.substring(0, 7),
      message: commit.message,
      quality: github.analyzeCommitMessage(commit.message),
    }))

    console.log(`[Webhook] GitHub push from ${senderUsername}:`, {
      repo: payload.repository.full_name,
      commits: commitAnalysis,
    })

    // TODO: Trigger agent processing for code review
    // This could emit an event to your agent service

    return NextResponse.json({ 
      ok: true, 
      processed: commitAnalysis.length 
    })
  } catch (error) {
    console.error("[Webhook] GitHub error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ status: "GitHub webhook is active" })
}
