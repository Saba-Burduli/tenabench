import { Contributor, Repository } from '@forgebench/shared';

/**
 * Generate a large contributor list for pagination testing.
 * GitHub returns 30 contributors per page; this creates 150 to test multi-page fetching.
 */
export function generateLargeContributors(count: number = 150): Contributor[] {
  return Array.from({ length: count }, (_, i) => ({
    login: `contributor${i.toString().padStart(3, '0')}`,
    contributions: Math.max(1, count - i * 2),
    type: i % 5 === 0 ? 'Organization' : 'User',
    avatar_url: `https://github.com/avatars/contributor${i}.png`,
    html_url: `https://github.com/contributor${i}`,
  }));
}

/**
 * Mock repository with many contributors for pagination testing.
 */
export function createLargeRepoContributors(count: number = 150): {
  repo: Repository;
  contributors: Contributor[];
} {
  const repo: Repository = {
    id: 'large-repo',
    full_name: 'test/large-repo',
    description: 'Repository with many contributors',
    html_url: 'https://github.com/test/large-repo',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    stargazers_count: 5000,
    forks_count: 800,
    open_issues_count: 25,
    language: 'TypeScript',
    default_branch: 'main',
    size: 10240,
  };

  return { repo, contributors: generateLargeContributors(count) };
}

/**
 * Mock data for a healthy, active repository.
 */
export function createHealthyRepoFixture(): {
  repo: Repository;
  contributors: Contributor[];
  issues: Issue[];
  releases: Release[];
} {
  return {
    repo: {
      id: 'healthy-1',
      full_name: 'test/healthy-repo',
      description: 'A well-maintained repository',
      html_url: 'https://github.com/test/healthy-repo',
      created_at: '2022-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
      pushed_at: new Date().toISOString(),
      stargazers_count: 1500,
      forks_count: 200,
      open_issues_count: 8,
      language: 'TypeScript',
      default_branch: 'main',
      size: 4096,
    },
    contributors: generateLargeContributors(10),
    issues: [
      { number: 1, title: 'Fixed crash', state: 'closed', created_at: '2024-05-01T00:00:00Z', closed_at: '2024-05-02T00:00:00Z', comments: 4, labels: ['bug'] },
      { number: 2, title: 'Add feature X', state: 'open', created_at: '2024-06-01T00:00:00Z', closed_at: null, comments: 2, labels: ['enhancement'] },
    ],
    releases: [
      { tag_name: 'v2.0.0', name: 'v2.0.0', created_at: new Date().toISOString(), published_at: new Date().toISOString(), prerelease: false },
    ],
  };
}

/**
 * Mock data for a stale, inactive repository.
 */
export function createStaleRepoFixture(): {
  repo: Repository;
  contributors: Contributor[];
  issues: Issue[];
  releases: Release[];
} {
  const oldDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  return {
    repo: {
      id: 'stale-1',
      full_name: 'test/stale-repo',
      description: 'An abandoned repository',
      html_url: 'https://github.com/test/stale-repo',
      created_at: '2018-01-01T00:00:00Z',
      updated_at: oldDate,
      pushed_at: oldDate,
      stargazers_count: 5,
      forks_count: 1,
      open_issues_count: 45,
      language: 'JavaScript',
      default_branch: 'master',
      size: 256,
    },
    contributors: [
      { login: 'original-author', contributions: 50, type: 'User', avatar_url: '', html_url: '' },
    ],
    issues: Array.from({ length: 45 }, (_, i) => ({
      number: i + 1,
      title: `Stale issue ${i + 1}`,
      state: 'open' as const,
      created_at: oldDate,
      closed_at: null,
      comments: 0,
      labels: [],
    })),
    releases: [],
  };
}
