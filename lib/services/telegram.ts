/**
 * Telegram Bot API Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a bot via @BotFather on Telegram
 * 2. Get your bot token from BotFather
 * 3. Add the bot to your mentorship group/channel
 * 4. Set TELEGRAM_BOT_TOKEN in your environment variables
 * 
 * For receiving messages, you need to set up a webhook:
 * - Deploy this app and set the webhook URL to: https://your-domain.com/api/webhooks/telegram
 */

const TELEGRAM_API_BASE = "https://api.telegram.org/bot"

export interface TelegramMessage {
  message_id: number
  from: {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
  chat: {
    id: number
    type: string
  }
  date: number
  text?: string
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

export class TelegramService {
  private botToken: string

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is required")
    }
    this.botToken = token
  }

  private getApiUrl(method: string): string {
    return `${TELEGRAM_API_BASE}${this.botToken}/${method}`
  }

  /**
   * Send a message to a specific chat
   */
  async sendMessage(chatId: number | string, text: string): Promise<TelegramMessage> {
    const response = await fetch(this.getApiUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    })

    const data = await response.json()
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`)
    }
    return data.result
  }

  /**
   * Get recent updates (messages) - useful for polling
   * Note: For production, use webhooks instead
   */
  async getUpdates(offset?: number): Promise<TelegramUpdate[]> {
    const params = new URLSearchParams()
    if (offset) params.set("offset", offset.toString())
    params.set("limit", "100")

    const response = await fetch(`${this.getApiUrl("getUpdates")}?${params}`)
    const data = await response.json()
    
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`)
    }
    return data.result
  }

  /**
   * Set up webhook for receiving updates
   */
  async setWebhook(url: string): Promise<boolean> {
    const response = await fetch(this.getApiUrl("setWebhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()
    return data.ok
  }

  /**
   * Parse student update from message
   */
  parseStudentUpdate(message: TelegramMessage): {
    studentUsername: string
    updateText: string
    timestamp: Date
    type: "monday" | "thursday" | "other"
  } | null {
    if (!message.text || !message.from.username) return null

    const date = new Date(message.date * 1000)
    const dayOfWeek = date.getDay()
    
    let type: "monday" | "thursday" | "other" = "other"
    if (dayOfWeek === 1) type = "monday"
    if (dayOfWeek === 4) type = "thursday"

    return {
      studentUsername: message.from.username,
      updateText: message.text,
      timestamp: date,
      type,
    }
  }
}

// Singleton instance
let telegramService: TelegramService | null = null

export function getTelegramService(): TelegramService {
  if (!telegramService) {
    telegramService = new TelegramService()
  }
  return telegramService
}
