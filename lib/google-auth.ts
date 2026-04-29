import { google } from 'googleapis';
import { cookies } from 'next/headers';

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.warn('Google OAuth credentials missing in environment variables');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  return oauth2Client;
}

export async function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client();
  const cookieStore = await cookies();
  
  let accessToken = cookieStore.get('google_access_token')?.value;
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  // If access token is missing but we have a refresh token, try to refresh
  if (!accessToken && refreshToken) {
    try {
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
      
      const { tokens } = await oauth2Client.refreshAccessToken();
      accessToken = tokens.access_token || undefined;
      
      if (accessToken) {
        // Save the new access token back to cookies
        const maxAge = tokens.expiry_date 
          ? Math.floor((tokens.expiry_date - Date.now()) / 1000) 
          : 3600;
          
        cookieStore.set('google_access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge
        });
        
        // Also update refresh token if a new one was issued
        if (tokens.refresh_token) {
          cookieStore.set('google_refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 365
          });
        }
      }
    } catch (refreshError) {
      console.error('Failed to refresh Google access token:', refreshError);
      // Fall through to throw original error
    }
  }

  if (!accessToken) {
    throw new Error('User not authenticated with Google or session expired. Please connect your account again.');
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}
