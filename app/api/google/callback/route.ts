import { NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google-auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `Google OAuth Error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided.' }, { status: 400 });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const cookieStore = await cookies();
    
    if (tokens.access_token) {
      // access_token length of life is denoted by expiry_date or 1h
      const maxAge = tokens.expiry_date 
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000) 
        : 3600;
        
      cookieStore.set('google_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge
      });
    }

    if (tokens.refresh_token) {
      // Storing refresh_token in a cookie for demo purposes since no DB exists
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year fallback
      });
    }

    return NextResponse.redirect(new URL('/settings', request.url));
  } catch (err: any) {
    console.error('Error exchanging code for tokens:', err);
    return NextResponse.json({ error: 'Failed to authenticate with Google.' }, { status: 500 });
  }
}
