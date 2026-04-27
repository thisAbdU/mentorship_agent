import { NextRequest, NextResponse } from "next/server"
import { getTelegramService, TelegramUpdate } from "@/lib/services/telegram"
import { getGoogleSheetsService } from "@/lib/services/google-sheets"

/**
 * Telegram Webhook Handler
 * 
 * This endpoint receives updates from Telegram when students send messages.
 * 
 * To set up the webhook, run:
 * curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/webhooks/telegram"
 */

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    
    if (!update.message?.text) {
      return NextResponse.json({ ok: true })
    }

    const telegram = getTelegramService()
    const sheets = getGoogleSheetsService()

    const parsed = telegram.parseStudentUpdate(update.message)
    if (!parsed) {
      return NextResponse.json({ ok: true })
    }

    // Record the update in Google Sheets
    await sheets.recordStudentUpdate(parsed.studentUsername)

    console.log(`[Webhook] Received update from ${parsed.studentUsername}:`, {
      type: parsed.type,
      timestamp: parsed.timestamp,
      preview: parsed.updateText.substring(0, 50) + "...",
    })

    // TODO: Trigger agent processing pipeline
    // This is where you would emit an event or call your agent service
    // to process the student's update and generate feedback

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[Webhook] Telegram error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

// Telegram sends a GET request to verify the webhook
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}
