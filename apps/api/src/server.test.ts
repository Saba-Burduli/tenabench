import request from 'supertest';
import { app, db } from '../src/server';
import { MockGitHubClient } from '@forgebench/github-client';
import { Repository, Contributor, Issue, Release } from '@forgebench/shared';

// Note: In a real test we'd mock the GitHub client.
// For now, test the database and scoring integration directly.

describe('API integration', () => {
  test('health endpoint returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('repo routes (with mock data)', () => {
  // Test the data flow: insert mock data → query via database → verify scoring
  const mockRepo: Repository = {
    id: 'mock-1',
    full_name: 'mock/repo',
    description: 'Mock repository',
    html_url: 'https://github.com/mock/repo',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    stargazers_count: 200,
    forks_count: 50,
    open_issues_count: 8,
    language: 'TypeScript',
    default_branch: 'main',
    size: 1024,
  };

  const mockContributors: Contributor[] = [
    { login: 'dev1', contributions: 100, type: 'User', avatar_url: '', html_url: '' },
    { login: 'dev2', contributions: 50, type: 'User', avatar_url: '', html_url: '' },
    { login: 'dev3', contributions: 25, type: 'User', avatar_url: '', html_url: '' },
  ];

  const mockIssues: Issue[] = [
    { number: 1, title: 'Bug', state: 'closed', created_at: '2024-01-01T00:00:00Z', closed_at: '2024-01-15T00:00:00Z', comments: 3, labels: ['bug'] },
    { number: 2, title: 'Feature', state: 'open', created_at: '2024-02-01T00:00:00Z', closed_at: null, comments: 1, labels: ['enhancement'] },
  ];

  const mockReleases: Release[] = [
    { tag_name: 'v1.0.0', name: 'v1.0.0', created_at: new Date().toISOString(), published_at: new Date().toISOString(), prerelease: false },
  ];

  beforeEach(() => {
    db.insertRepository(mockRepo);
    db.insertContributors('mock-1', mockContributors);
    db.insertIssues('mock-1', mockIssues);
    db.insertReleases('mock-1', mockReleases);
  });

  test('database contains expected data', () => {
    const repo = db.getRepository('mock-1');
    expect(repo).toBeDefined();
    expect(repo!.stargazers_count).toBe(200);

    const contributors = db.getContributors('mock-1');
    expect(contributors).toHaveLength(3);

    const count = db.getContributorCount('mock-1');
    expect(count).toBe(3);
  });

  test('health score can be calculated from cached data', () => {
    const repo = db.getRepository('mock-1')!;
    const contributors = db.getContributors('mock-1');
    const issues = db.getIssues('mock-1');
    const releases = db.getReleases('mock-1');

    const { calculateHealthScore } = require('@forgebench/repository-scoring');
    const score = calculateHealthScore({ repository: repo, contributors, issues, releases });

    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.dimensions).toHaveLength(4);
  });
});
