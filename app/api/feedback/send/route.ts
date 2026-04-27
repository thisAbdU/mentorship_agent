import { NextRequest, NextResponse } from "next/server"
import { getTelegramService } from "@/lib/services/telegram"

/**
 * POST /api/feedback/send
 * 
 * Sends approved feedback to a student via Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const { studentTelegramId, message } = await request.json()

    if (!studentTelegramId || !message) {
      return NextResponse.json(
        { error: "studentTelegramId and message are required" },
        { status: 400 }
      )
    }

    // Check if Telegram is configured
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        success: false,
        message: "Telegram not configured. Message would be sent to: " + studentTelegramId,
        preview: message,
      })
    }

    const telegram = getTelegramService()
    const result = await telegram.sendMessage(studentTelegramId, message)

    return NextResponse.json({
      success: true,
      messageId: result.message_id,
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] Failed to send feedback:", error)
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    )
  }
}
