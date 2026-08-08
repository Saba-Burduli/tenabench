import {
  Repository,
  Contributor,
  Issue,
  Release,
} from '@forgebench/shared';

const PER_PAGE = 30;

interface RateLimitInfo {
  remaining: number;
  reset: number; // epoch seconds
}

/**
 * GitHub API client with rate limit awareness.
 *
 * Supports fetching repository details, contributors, issues, and releases.
 * All list operations handle pagination.
 */
export class GitHubClient {
  private rateLimit: RateLimitInfo | null = null;

  constructor(
    private token: string,
    private baseUrl: string = 'https://api.github.com'
  ) {}

  /** Fetch full repository metadata */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    const data = await this.request<{
      id: number;
      full_name: string;
      description: string | null;
      html_url: string;
      created_at: string;
      updated_at: string;
      pushed_at: string;
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
      language: string | null;
      default_branch: string;
      size: number;
    }>(`/repos/${owner}/${repo}`);

    return {
      id: String(data.id),
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      pushed_at: data.pushed_at,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      open_issues_count: data.open_issues_count,
      language: data.language,
      default_branch: data.default_branch,
      size: data.size,
    };
  }

  /**
   * Fetch all contributors for a repository.
   * Handles pagination to retrieve every contributor.
   */
  async getContributors(owner: string, repo: string): Promise<Contributor[]> {
    const allContributors: Contributor[] = [];
    let page = 1;

    while (true) {
      const contributors: Contributor[] = await this.request(
        `/repos/${owner}/${repo}/contributors?per_page=${PER_PAGE}&page=${page}`
      );

      if (contributors.length === 0) break;

      allContributors.push(...contributors);

      if (contributors.length < PER_PAGE) break;

      page++;
    }

    return allContributors;
  }

  /** Fetch all issues (open + closed) with pagination */
  async getIssues(owner: string, repo: string): Promise<Issue[]> {
    const allIssues: Issue[] = [];
    let page = 1;

    while (true) {
      const issues: Issue[] = await this.request(
        `/repos/${owner}/${repo}/issues?per_page=${PER_PAGE}&page=${page}&state=all`
      );

      if (issues.length === 0) break;

      allIssues.push(...issues);

      if (issues.length < PER_PAGE) break;

      page++;
    }

    return allIssues;
  }

  /** Fetch all releases with pagination */
  async getReleases(owner: string, repo: string): Promise<Release[]> {
    const allReleases: Release[] = [];
    let page = 1;

    while (true) {
      const releases: Release[] = await this.request(
        `/repos/${owner}/${repo}/releases?per_page=${PER_PAGE}&page=${page}`
      );

      if (releases.length === 0) break;

      allReleases.push(...releases);

      if (releases.length < PER_PAGE) break;

      page++;
    }

    return allReleases;
  }

  /** Get current rate limit status */
  getRateLimitStatus(): { remaining: number; secondsUntilReset: number } | null {
    if (!this.rateLimit) return null;

    const now = Math.floor(Date.now() / 1000);
    const secondsUntilReset = Math.max(0, this.rateLimit.reset - now);

    return {
      remaining: this.rateLimit.remaining,
      secondsUntilReset,
    };
  }

  /** Check if rate limit is exhausted */
  isRateLimited(): boolean {
    return this.rateLimit?.remaining === 0;
  }

  /** Seconds until rate limit resets */
  secondsUntilRateLimitReset(): number {
    if (!this.rateLimit) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, this.rateLimit.reset - now);
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Track rate limits from response headers
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    if (remaining && reset) {
      this.rateLimit = {
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export { GitHubClient as MockGitHubClient } from './mock';
