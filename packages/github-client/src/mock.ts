import {
  Repository,
  Contributor,
  Issue,
  Release,
} from '@tenabench/shared';

/**
 * Mock GitHub client for testing and benchmark scenarios.
 * Returns pre-configured data instead of calling the real API.
 */
export class MockGitHubClient {
  constructor(
    private data: {
      repository?: Repository;
      contributors?: Contributor[];
      issues?: Issue[];
      releases?: Release[];
      rateLimitError?: boolean;
    } = {}
  ) {}

  async getRepository(_owner: string, _repo: string): Promise<Repository> {
    if (!this.data.repository) {
      throw new Error('Repository not found');
    }
    return { ...this.data.repository };
  }

  async getContributors(_owner: string, _repo: string): Promise<Contributor[]> {
    return this.data.contributors ? [...this.data.contributors] : [];
  }

  async getIssues(_owner: string, _repo: string): Promise<Issue[]> {
    return this.data.issues ? [...this.data.issues] : [];
  }

  async getReleases(_owner: string, _repo: string): Promise<Release[]> {
    return this.data.releases ? [...this.data.releases] : [];
  }

  getRateLimitStatus() {
    return this.data.rateLimitError
      ? { remaining: 0, secondsUntilReset: 3600 }
      : { remaining: 4900, secondsUntilReset: 0 };
  }

  isRateLimited(): boolean {
    return this.data.rateLimitError === true;
  }

  secondsUntilRateLimitReset(): number {
    return this.data.rateLimitError ? 3600 : 0;
  }
}
