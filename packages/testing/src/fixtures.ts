import { Contributor, Issue, Release, Repository } from '@tenabench/shared';

/** Create a contributor with the given login and contribution count */
export function createContributor(login: string, contributions: number): Contributor {
  return {
    login,
    contributions,
    type: 'User',
    avatar_url: `https://github.com/avatars/${login}.png`,
    html_url: `https://github.com/${login}`,
  };
}

/** Create N contributors with decreasing contribution counts */
export function createContributors(count: number, baseContributions: number = 100): Contributor[] {
  return Array.from({ length: count }, (_, i) =>
    createContributor(`user${i}`, Math.max(1, baseContributions - i * 5))
  );
}

/** Create a simple issue */
export function createIssue(number: number, title: string, state: 'open' | 'closed' = 'open'): Issue {
  return {
    number,
    title,
    state,
    created_at: new Date().toISOString(),
    closed_at: state === 'closed' ? new Date().toISOString() : null,
    comments: 0,
    labels: [],
  };
}

/** Create a release */
export function createRelease(tagName: string, name?: string): Release {
  const now = new Date().toISOString();
  return {
    tag_name: tagName,
    name: name || tagName,
    created_at: now,
    published_at: now,
    prerelease: false,
  };
}

/** Create a minimal repository */
export function createRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 'test-repo',
    full_name: 'test/repo',
    description: 'Test repository',
    html_url: 'https://github.com/test/repo',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    language: 'TypeScript',
    default_branch: 'main',
    size: 100,
    ...overrides,
  };
}
