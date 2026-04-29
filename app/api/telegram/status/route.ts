import { NextResponse } from 'next/server';
import { getTelegramBot } from '@/lib/telegram';

export async function GET() {
  try {
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
