import { Telegraf } from 'telegraf';

export function getTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('Telegram Bot Token is missing in environment variables.');
  }
  return new Telegraf(token);
}

/**
 * Basic token verification
 */
export async function verifyTelegramToken(token: string) {
  try {
    const tempBot = new Telegraf(token);
    const me = await tempBot.telegram.getMe();
    return { success: true, username: me.username };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}
