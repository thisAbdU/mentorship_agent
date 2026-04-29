import { NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google-auth';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

export async function GET() {
  const oauth2Client = getOAuth2Client();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Ensure we get a refresh token
    scope: SCOPES,
    prompt: 'consent' // Forces Google to show consent screen on every connect
  });

  return NextResponse.redirect(authUrl);
}
