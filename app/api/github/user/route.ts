import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get authenticated user - this will check cookies automatically
    const { getAuthenticatedGitHubClient } = await import('@/lib/github-auth');
    const octokit = await getAuthenticatedGitHubClient();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    return NextResponse.json({ 
      connected: true, 
      username: user.login, 
      avatar_url: user.avatar_url 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      connected: false, 
      error: 'not_connected',
      message: 'GitHub not connected. Please click "Connect with GitHub" button.'
    });
  }
}
