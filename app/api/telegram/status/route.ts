import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Telegram is configured
    const isConfigured = !!process.env.TELEGRAM_BOT_TOKEN;

    if (!isConfigured) {
      return NextResponse.json({ 
        connected: false, 
        error: 'not_configured',
        message: 'Telegram not configured. Please set up TELEGRAM_BOT_TOKEN environment variable.'
      });
    }

    // If configured, try to get bot info
    const { getTelegramBot } = await import('@/lib/telegram');
    const bot = getTelegramBot();
    const me = await bot.telegram.getMe();
    return NextResponse.json({ 
      connected: true, 
      username: me.username, 
      bot_id: me.id 
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: 'Not configured or invalid token' });
  }
}
