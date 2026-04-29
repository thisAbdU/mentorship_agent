import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📁 Google Files: Checking authentication...');
    
    // First try to use OAuth tokens (from web flow)
    try {
      const { getAuthenticatedClient } = await import('@/lib/google-auth');
      const auth = await getAuthenticatedClient();
      console.log('✅ Google Files: OAuth authentication successful');
      
      const { listSpreadsheets } = await import('@/lib/google-sheets');
      const files = await listSpreadsheets();
      return NextResponse.json({ files });
    } catch (oauthError) {
      console.log('❌ Google Files: OAuth failed, checking service account...', oauthError);
      
      // Fallback to service account if OAuth fails
      const isConfigured = !!(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY &&
        process.env.GOOGLE_SHEETS_ID
      );

      if (!isConfigured) {
        return NextResponse.json({ 
          error: 'not_configured',
          message: 'Google not configured. Please set up OAuth or service account.',
          files: []
        });
      }

      const { listSpreadsheets } = await import('@/lib/google-sheets');
      const files = await listSpreadsheets();
      return NextResponse.json({ files });
    }
  } catch (error: any) {
    console.error('📁 Google Files: Error:', error);
    if (error.message.includes('not authenticated')) {
       return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
