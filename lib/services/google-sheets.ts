/**
 * Google Sheets API Integration (for Google Classroom-style progress tracking)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 * 2. Create a new project or select existing one
 * 3. Enable the Google Sheets API
 * 4. Create a Service Account:
 *    - Go to IAM & Admin > Service Accounts
 *    - Create service account
 *    - Download the JSON key file
 * 5. Share your Google Sheet with the service account email
 * 6. Set these environment variables:
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL: The service account email
 *    - GOOGLE_PRIVATE_KEY: The private key from the JSON file (include the -----BEGIN/END----- parts)
 *    - GOOGLE_SHEETS_ID: The ID of your progress tracking spreadsheet
 * 
 * SPREADSHEET STRUCTURE (expected):
 * Row 1: Headers - StudentName, TelegramUsername, GitHubUsername, CurrentModule, StartDate, LastUpdate, Status, Notes
 * Row 2+: Student data
 */

import { SignJWT, importPKCS8 } from "jose"

const GOOGLE_SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets"
const GOOGLE_AUTH_URL = "https://oauth2.googleapis.com/token"
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

export interface StudentSheetRow {
  studentName: string
  telegramUsername: string
  githubUsername: string
  currentModule: number
  startDate: string
  lastUpdate: string
  status: "on-track" | "needs-attention" | "at-risk"
  notes: string
}

export class GoogleSheetsService {
  private serviceAccountEmail: string
  private privateKey: string
  private spreadsheetId: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const key = process.env.GOOGLE_PRIVATE_KEY
    const sheetId = process.env.GOOGLE_SHEETS_ID

    if (!email || !key || !sheetId) {
      throw new Error(
        "Missing required environment variables: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID"
      )
    }

    this.serviceAccountEmail = email
    // Handle escaped newlines in private key
    this.privateKey = key.replace(/\\n/g, "\n")
    this.spreadsheetId = sheetId
  }

  /**
   * Generate a JWT and exchange it for an access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken
    }

    const now = Math.floor(Date.now() / 1000)
    const privateKey = await importPKCS8(this.privateKey, "RS256")

    const jwt = await new SignJWT({
      scope: SCOPES.join(" "),
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setIssuer(this.serviceAccountEmail)
      .setAudience(GOOGLE_AUTH_URL)
      .setSubject(this.serviceAccountEmail)
      .sign(privateKey)

    const response = await fetch(GOOGLE_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get access token: ${error}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + data.expires_in * 1000

    return this.accessToken!
  }

  /**
   * Get all student data from the spreadsheet
   */
  async getStudentData(sheetName = "Students"): Promise<StudentSheetRow[]> {
    const token = await this.getAccessToken()
    const range = `${sheetName}!A2:H` // Skip header row

    const response = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Sheets API error: ${error}`)
    }

    const data = await response.json()
    const rows = data.values || []

    return rows.map((row: string[]) => ({
      studentName: row[0] || "",
      telegramUsername: row[1] || "",
      githubUsername: row[2] || "",
      currentModule: parseInt(row[3] || "0", 10),
      startDate: row[4] || "",
      lastUpdate: row[5] || "",
      status: (row[6] as StudentSheetRow["status"]) || "on-track",
      notes: row[7] || "",
    }))
  }

  /**
   * Update a student's data in the spreadsheet
   */
  async updateStudentRow(
    rowIndex: number,
    data: Partial<StudentSheetRow>,
    sheetName = "Students"
  ): Promise<void> {
    const token = await this.getAccessToken()
    
    // Get current row data first
    const currentData = await this.getStudentData(sheetName)
    if (rowIndex < 0 || rowIndex >= currentData.length) {
      throw new Error(`Invalid row index: ${rowIndex}`)
    }

    const updated = { ...currentData[rowIndex], ...data }
    const range = `${sheetName}!A${rowIndex + 2}:H${rowIndex + 2}`
    
    const values = [
      [
        updated.studentName,
        updated.telegramUsername,
        updated.githubUsername,
        updated.currentModule.toString(),
        updated.startDate,
        updated.lastUpdate,
        updated.status,
        updated.notes,
      ],
    ]

    const response = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Sheets API error: ${error}`)
    }
  }

  /**
   * Find a student by Telegram username
   */
  async findStudentByTelegram(telegramUsername: string): Promise<{
    data: StudentSheetRow
    rowIndex: number
  } | null> {
    const students = await this.getStudentData()
    const index = students.findIndex(
      (s) => s.telegramUsername.toLowerCase() === telegramUsername.toLowerCase()
    )
    
    if (index === -1) return null
    return { data: students[index], rowIndex: index }
  }

  /**
   * Find a student by GitHub username
   */
  async findStudentByGitHub(githubUsername: string): Promise<{
    data: StudentSheetRow
    rowIndex: number
  } | null> {
    const students = await this.getStudentData()
    const index = students.findIndex(
      (s) => s.githubUsername.toLowerCase() === githubUsername.toLowerCase()
    )
    
    if (index === -1) return null
    return { data: students[index], rowIndex: index }
  }

  /**
   * Update last update timestamp for a student
   */
  async recordStudentUpdate(telegramUsername: string): Promise<void> {
    const student = await this.findStudentByTelegram(telegramUsername)
    if (!student) {
      console.warn(`Student not found: ${telegramUsername}`)
      return
    }

    await this.updateStudentRow(student.rowIndex, {
      lastUpdate: new Date().toISOString().split("T")[0],
    })
  }
}

// Singleton instance
let googleSheetsService: GoogleSheetsService | null = null

export function getGoogleSheetsService(): GoogleSheetsService {
  if (!googleSheetsService) {
    googleSheetsService = new GoogleSheetsService()
  }
  return googleSheetsService
}
