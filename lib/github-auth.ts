import { Octokit } from 'octokit';
import { cookies } from 'next/headers';

export function getGitHubOAuthClient() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('GitHub OAuth credentials missing in environment variables');
  }

  return { clientId, clientSecret };
}

export async function getAuthenticatedGitHubClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('github_access_token')?.value;

  if (!accessToken) {
    throw new Error('User not authenticated with GitHub. Please connect your account.');
  }

  return new Octokit({ auth: accessToken });
}
