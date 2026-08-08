import { calculateHealthScore, daysSince } from '../src/scorer';
import { ScoringInput } from '../src/scorer';
import { Repository, Contributor, Issue, Release } from '@forgebench/shared';

function makeRepo(overrides: Partial<Repository> = {}): Repository {
  return {
    id: '1',
    full_name: 'test/repo',
    description: 'Test',
    html_url: 'https://github.com/test/repo',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    stargazers_count: 100,
    forks_count: 20,
    open_issues_count: 5,
    language: 'TypeScript',
    default_branch: 'main',
    size: 512,
    ...overrides,
  };
}

function makeContributors(count: number): Contributor[] {
  return Array.from({ length: count }, (_, i) => ({
    login: `user${i}`,
    contributions: 50 - i * 2,
    type: 'User',
    avatar_url: '',
    html_url: '',
  }));
}

function makeIssues(open: number, closed: number): Issue[] {
  const issues: Issue[] = [];
  for (let i = 0; i < closed; i++) {
    issues.push({
      number: i + 1,
      title: `Closed issue ${i}`,
      state: 'closed',
      created_at: '2024-01-01T00:00:00Z',
      closed_at: '2024-02-01T00:00:00Z',
      comments: 2,
      labels: [],
    });
  }
  for (let i = 0; i < open; i++) {
    issues.push({
      number: closed + i + 1,
      title: `Open issue ${i}`,
      state: 'open',
      created_at: '2024-03-01T00:00:00Z',
      closed_at: null,
      comments: 0,
      labels: ['bug'],
    });
  }
  return issues;
}

function makeReleases(): Release[] {
  return [
    {
      tag_name: 'v1.0.0',
      name: 'v1.0.0',
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      prerelease: false,
    },
  ];
}

describe('calculateHealthScore', () => {
  test('produces a score between 0 and 100', () => {
    const input: ScoringInput = {
      repository: makeRepo(),
      contributors: makeContributors(5),
      issues: makeIssues(2, 3),
      releases: makeReleases(),
    };

    const score = calculateHealthScore(input);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  test('includes all four dimensions', () => {
    const input: ScoringInput = {
      repository: makeRepo(),
      contributors: makeContributors(3),
      issues: makeIssues(1, 2),
      releases: makeReleases(),
    };

    const score = calculateHealthScore(input);
    expect(score.dimensions).toHaveLength(4);
    expect(score.dimensions.map(d => d.name)).toEqual(['popularity', 'activity', 'maintenance', 'community']);
  });

  test('higher stars produce higher popularity score', () => {
    const base = makeRepo({ stargazers_count: 10 });
    const popular = makeRepo({ stargazers_count: 10000 });

    const baseScore = calculateHealthScore({
      repository: base, contributors: [], issues: [], releases: [],
    });
    const popularScore = calculateHealthScore({
      repository: popular, contributors: [], issues: [], releases: [],
    });

    const basePop = baseScore.dimensions.find(d => d.name === 'popularity')!.score;
    const popularPop = popularScore.dimensions.find(d => d.name === 'popularity')!.score;

    expect(popularPop).toBeGreaterThan(basePop);
  });

  test('empty repository produces low scores', () => {
    const emptyRepo = makeRepo({
      stargazers_count: 0,
      forks_count: 0,
      size: 1,
    });

    const score = calculateHealthScore({
      repository: emptyRepo,
      contributors: [],
      issues: [],
      releases: [],
    });

    expect(score.dimensions.find(d => d.name === 'community')!.score).toBe(0);
  });

  test('more contributors increases community score', () => {
    const few = calculateHealthScore({
      repository: makeRepo(),
      contributors: makeContributors(1),
      issues: [],
      releases: [],
    });

    const many = calculateHealthScore({
      repository: makeRepo(),
      contributors: makeContributors(20),
      issues: [],
      releases: [],
    });

    expect(
      many.dimensions.find(d => d.name === 'community')!.score
    ).toBeGreaterThan(
      few.dimensions.find(d => d.name === 'community')!.score
    );
  });
});

describe('daysSince', () => {
  test('returns 0 for today', () => {
    const today = new Date().toISOString();
    const days = daysSince(today);
    expect(days).toBe(0);
  });

  test('returns positive number for past dates', () => {
    const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(past)).toBeGreaterThanOrEqual(6);
    expect(daysSince(past)).toBeLessThanOrEqual(8);
  });
});
