import { getAuthenticatedGitHubClient } from './github-auth';

export interface GitHubActivity {
  sha: string;
  message: string;
  date: string;
  url: string;
}

/**
 * Fetches recent commits from a specific student's repository.
 * @param username The student's GitHub username
 * @param repoName The repository name to track
 */
export async function getStudentRepoActivity(username: string, repoName: string): Promise<GitHubActivity[]> {
  try {
    const octokit = await getAuthenticatedGitHubClient();
    
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: username,
      repo: repoName,
      per_page: 5, // Just get the last 5
    });

    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.author?.date || new Date().toISOString(),
      url: commit.html_url,
    }));
  } catch (error: any) {
    if (error.status === 404) {
      console.warn(`Repository ${username}/${repoName} not found.`);
      return [];
    }
    console.error(`Error fetching GitHub activity for ${username}:`, error);
    throw error;
  }
}

/**
 * Checks if a specific repository exists and is accessible.
 */
export async function checkRepoExists(username: string, repoName: string): Promise<boolean> {
  try {
    const octokit = await getAuthenticatedGitHubClient();
    await octokit.rest.repos.get({
      owner: username,
      repo: repoName,
    });
    return true;
  } catch (error) {
    return false;
  }
}
