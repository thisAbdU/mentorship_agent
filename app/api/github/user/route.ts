import { NextResponse } from 'next/server';
import { getAuthenticatedGitHubClient } from '@/lib/github-auth';

export async function GET() {
  try {
    const octokit = await getAuthenticatedGitHubClient();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    return NextResponse.json({ 
      connected: true, 
      username: user.login, 
      avatar_url: user.avatar_url 
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 401 });
  }
}
