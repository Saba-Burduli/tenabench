import { MockGitHubClient } from '../src/mock';
import { Contributor, Issue, Release, Repository } from '@tenabench/shared';

// --- Fixtures ---

const mockRepo: Repository = {
  id: '12345',
  full_name: 'test/repo',
  description: 'A test repository',
  html_url: 'https://github.com/test/repo',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  pushed_at: '2024-06-01T00:00:00Z',
  stargazers_count: 150,
  forks_count: 45,
  open_issues_count: 12,
  language: 'TypeScript',
  default_branch: 'main',
  size: 2048,
};

const mockContributors: Contributor[] = Array.from({ length: 15 }, (_, i) => ({
  login: `user${i}`,
  contributions: 100 - i,
  type: 'User',
  avatar_url: `https://github.com/avatars/user${i}.png`,
  html_url: `https://github.com/user${i}`,
}));

const mockIssues: Issue[] = [
  {
    number: 1,
    title: 'Fix typo in README',
    state: 'closed',
    created_at: '2024-01-01T00:00:00Z',
    closed_at: '2024-01-02T00:00:00Z',
    comments: 2,
    labels: ['documentation'],
  },
  {
    number: 2,
    title: 'Add pagination support',
    state: 'open',
    created_at: '2024-03-01T00:00:00Z',
    closed_at: null,
    comments: 5,
    labels: ['enhancement'],
  },
];

const mockReleases: Release[] = [
  {
    tag_name: 'v1.0.0',
    name: 'Initial release',
    created_at: '2024-01-01T00:00:00Z',
    published_at: '2024-01-01T00:00:00Z',
    prerelease: false,
  },
];

describe('GitHubClient (mock)', () => {
  test('fetches repository details', async () => {
    const client = new MockGitHubClient({ repository: mockRepo });
    const repo = await client.getRepository('test', 'repo');

    expect(repo.full_name).toBe('test/repo');
    expect(repo.stargazers_count).toBe(150);
    expect(repo.language).toBe('TypeScript');
  });

  test('fetches contributors', async () => {
    const client = new MockGitHubClient({ contributors: mockContributors });
    const contributors = await client.getContributors('test', 'repo');

    expect(contributors).toHaveLength(15);
    expect(contributors[0].login).toBe('user0');
  });

  test('fetches issues', async () => {
    const client = new MockGitHubClient({ issues: mockIssues });
    const issues = await client.getIssues('test', 'repo');

    expect(issues).toHaveLength(2);
    expect(issues[0].state).toBe('closed');
    expect(issues[1].state).toBe('open');
  });

  test('fetches releases', async () => {
    const client = new MockGitHubClient({ releases: mockReleases });
    const releases = await client.getReleases('test', 'repo');

    expect(releases).toHaveLength(1);
    expect(releases[0].tag_name).toBe('v1.0.0');
  });

  test('returns empty arrays when no data configured', async () => {
    const client = new MockGitHubClient();
    expect(await client.getContributors('test', 'repo')).toHaveLength(0);
    expect(await client.getIssues('test', 'repo')).toHaveLength(0);
    expect(await client.getReleases('test', 'repo')).toHaveLength(0);
  });

  test('throws when repository not configured', async () => {
    const client = new MockGitHubClient();
    await expect(client.getRepository('test', 'repo')).rejects.toThrow('Repository not found');
  });

  test('rate limit status works', () => {
    const client = new MockGitHubClient({ rateLimitError: true });
    expect(client.isRateLimited()).toBe(true);
    expect(client.getRateLimitStatus()).toEqual({
      remaining: 0,
      secondsUntilReset: 3600,
    });
  });

  test('not rate limited by default', () => {
    const client = new MockGitHubClient();
    expect(client.isRateLimited()).toBe(false);
  });
});
