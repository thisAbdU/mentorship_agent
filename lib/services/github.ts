/**
 * GitHub API Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a GitHub Personal Access Token (classic) or Fine-grained token
 *    - Go to GitHub Settings > Developer settings > Personal access tokens
 *    - Required scopes: repo (read access to repositories)
 * 2. Set GITHUB_TOKEN in your environment variables
 * 3. Optionally set GITHUB_ORG for organization repositories
 * 
 * For webhooks (real-time commit notifications):
 * - Set up a webhook in each student repo pointing to: https://your-domain.com/api/webhooks/github
 * - Select "Push" events
 */

const GITHUB_API_BASE = "https://api.github.com"

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
  }
  default_branch: string
  pushed_at: string
}

export interface CodeQualityMetrics {
  hasTests: boolean
  hasReadme: boolean
  hasLinting: boolean
  commitMessageQuality: "excellent" | "good" | "needs-improvement"
  overallScore: "excellent" | "good" | "needs-improvement"
}

export class GitHubService {
  private token: string
  private headers: HeadersInit

  constructor() {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is required")
    }
    this.token = token
    this.headers = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    }
  }

  /**
   * Get commits for a repository
   */
  async getCommits(owner: string, repo: string, options?: {
    author?: string
    since?: string
    until?: string
    perPage?: number
  }): Promise<GitHubCommit[]> {
    const params = new URLSearchParams()
    if (options?.author) params.set("author", options.author)
    if (options?.since) params.set("since", options.since)
    if (options?.until) params.set("until", options.until)
    params.set("per_page", (options?.perPage || 30).toString())

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`,
      { headers: this.headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { headers: this.headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * List repositories for a user
   */
  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?sort=pushed&per_page=100`,
      { headers: this.headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Check repository contents for quality indicators
   */
  async checkRepoContents(owner: string, repo: string): Promise<{
    hasTests: boolean
    hasReadme: boolean
    hasLinting: boolean
  }> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents`,
      { headers: this.headers }
    )

    if (!response.ok) {
      return { hasTests: false, hasReadme: false, hasLinting: false }
    }

    const contents = await response.json()
    const fileNames = contents.map((f: { name: string }) => f.name.toLowerCase())

    return {
      hasTests: fileNames.some((f: string) => 
        f.includes("test") || f.includes("spec") || f === "__tests__"
      ),
      hasReadme: fileNames.some((f: string) => f.startsWith("readme")),
      hasLinting: fileNames.some((f: string) => 
        f.includes("eslint") || f.includes("prettier") || f === ".lintstagedrc"
      ),
    }
  }

  /**
   * Analyze commit message quality
   */
  analyzeCommitMessage(message: string): "excellent" | "good" | "needs-improvement" {
    const firstLine = message.split("\n")[0]
    
    // Check for conventional commits format
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?!?:\s.+/
    if (conventionalPattern.test(firstLine)) {
      return "excellent"
    }

    // Check for reasonable length and clarity
    if (firstLine.length >= 10 && firstLine.length <= 72 && !firstLine.startsWith("wip")) {
      return "good"
    }

    return "needs-improvement"
  }

  /**
   * Get overall code quality metrics for a student's repository
   */
  async getCodeQualityMetrics(owner: string, repo: string): Promise<CodeQualityMetrics> {
    const [repoContents, commits] = await Promise.all([
      this.checkRepoContents(owner, repo),
      this.getCommits(owner, repo, { perPage: 10 }),
    ])

    // Analyze recent commit messages
    const commitQualities = commits.map(c => this.analyzeCommitMessage(c.commit.message))
    const excellentCount = commitQualities.filter(q => q === "excellent").length
    const goodCount = commitQualities.filter(q => q === "good").length

    let commitMessageQuality: "excellent" | "good" | "needs-improvement"
    if (excellentCount >= 5) {
      commitMessageQuality = "excellent"
    } else if (excellentCount + goodCount >= 7) {
      commitMessageQuality = "good"
    } else {
      commitMessageQuality = "needs-improvement"
    }

    // Calculate overall score
    const scores = [
      repoContents.hasTests ? 2 : 0,
      repoContents.hasReadme ? 1 : 0,
      repoContents.hasLinting ? 1 : 0,
      commitMessageQuality === "excellent" ? 2 : commitMessageQuality === "good" ? 1 : 0,
    ]
    const totalScore = scores.reduce((a, b) => a + b, 0)

    let overallScore: "excellent" | "good" | "needs-improvement"
    if (totalScore >= 5) {
      overallScore = "excellent"
    } else if (totalScore >= 3) {
      overallScore = "good"
    } else {
      overallScore = "needs-improvement"
    }

    return {
      ...repoContents,
      commitMessageQuality,
      overallScore,
    }
  }
}

// Singleton instance
let githubService: GitHubService | null = null

export function getGitHubService(): GitHubService {
  if (!githubService) {
    githubService = new GitHubService()
  }
  return githubService
}
