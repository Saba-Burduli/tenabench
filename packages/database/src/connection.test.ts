import { AppDatabase } from '../src/connection';
import { Contributor, Issue, Release, Repository } from '@forgebench/shared';

const testRepo: Repository = {
  id: 'test-1',
  full_name: 'test/repo',
  description: 'Test repository',
  html_url: 'https://github.com/test/repo',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  pushed_at: '2024-06-01T00:00:00Z',
  stargazers_count: 100,
  forks_count: 20,
  open_issues_count: 5,
  language: 'TypeScript',
  default_branch: 'main',
  size: 512,
};

const testContributors: Contributor[] = [
  { login: 'alice', contributions: 50, type: 'User', avatar_url: '', html_url: '' },
  { login: 'bob', contributions: 30, type: 'User', avatar_url: '', html_url: '' },
];

const testIssues: Issue[] = [
  { number: 1, title: 'Bug', state: 'open', created_at: '2024-01-01T00:00:00Z', closed_at: null, comments: 3, labels: ['bug'] },
];

const testReleases: Release[] = [
  { tag_name: 'v1.0.0', name: 'v1.0.0', created_at: '2024-01-01T00:00:00Z', published_at: '2024-01-01T00:00:00Z', prerelease: false },
];

describe('AppDatabase', () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = new AppDatabase();
  });

  afterEach(() => {
    db.close();
  });

  test('inserts and retrieves a repository', () => {
    db.insertRepository(testRepo);
    const repo = db.getRepository('test-1');
    expect(repo).toBeDefined();
    expect(repo!.full_name).toBe('test/repo');
  });

  test('gets repository by full name', () => {
    db.insertRepository(testRepo);
    const repo = db.getRepositoryByFullName('test/repo');
    expect(repo!.id).toBe('test-1');
  });

  test('returns undefined for missing repository', () => {
    expect(db.getRepository('nonexistent')).toBeUndefined();
  });

  test('inserts and retrieves contributors', () => {
    db.insertRepository(testRepo);
    db.insertContributors('test-1', testContributors);

    const contributors = db.getContributors('test-1');
    expect(contributors).toHaveLength(2);
    expect(contributors[0].login).toBe('alice');
  });

  test('contributor count matches inserted data', () => {
    db.insertRepository(testRepo);
    db.insertContributors('test-1', testContributors);

    expect(db.getContributorCount('test-1')).toBe(2);
  });

  test('inserts and retrieves issues', () => {
    db.insertRepository(testRepo);
    db.insertIssues('test-1', testIssues);

    const issues = db.getIssues('test-1');
    expect(issues).toHaveLength(1);
    expect(issues[0].labels).toEqual(['bug']);
  });

  test('inserts and retrieves releases', () => {
    db.insertRepository(testRepo);
    db.insertReleases('test-1', testReleases);

    const releases = db.getReleases('test-1');
    expect(releases).toHaveLength(1);
    expect(releases[0].tag_name).toBe('v1.0.0');
  });

  test('re-inserting contributors replaces old data', () => {
    db.insertRepository(testRepo);
    db.insertContributors('test-1', testContributors);
    expect(db.getContributorCount('test-1')).toBe(2);

    const newContributors: Contributor[] = [
      { login: 'charlie', contributions: 10, type: 'User', avatar_url: '', html_url: '' },
    ];
    db.insertContributors('test-1', newContributors);
    expect(db.getContributorCount('test-1')).toBe(1);
  });
});
