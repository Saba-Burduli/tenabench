import { MockGitHubClient } from '../../packages/github-client/src/mock';
import { AppDatabase } from '../../packages/database/src/connection';
import { generateLargeContributors, createLargeRepoContributors } from '../fixtures/large-repo';

/**
 * Hidden test: Contributor pagination with 100 contributors.
 * The client should return all 100, not just 30.
 */
describe('Hidden: contributor pagination (100 contributors)', () => {
  test('returns all 100 contributors', async () => {
    const contributors = generateLargeContributors(100);
    const client = new MockGitHubClient({ contributors });

    const result = await client.getContributors('test', 'large-repo');
    expect(result).toHaveLength(100);
  });

  test('contributor count is accurate', async () => {
    const contributors = generateLargeContributors(100);
    const client = new MockGitHubClient({ contributors });

    const result = await client.getContributors('test', 'large-repo');
    expect(result.length).toBe(contributors.length);
  });
});

/**
 * Hidden test: Contributor pagination with 150 contributors (5 pages).
 */
describe('Hidden: contributor pagination (150 contributors)', () => {
  test('returns all 150 contributors', async () => {
    const contributors = generateLargeContributors(150);
    const client = new MockGitHubClient({ contributors });

    const result = await client.getContributors('test', 'large-repo');
    expect(result).toHaveLength(150);
  });
});

/**
 * Hidden test: Contributor count accuracy after database round-trip.
 */
describe('Hidden: contributor count accuracy', () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = new AppDatabase();
  });

  afterEach(() => {
    db.close();
  });

  test('database stores and returns exact contributor count', () => {
    const { repo, contributors } = createLargeRepoContributors(150);
    db.insertRepository(repo);
    db.insertContributors(repo.id, contributors);

    const count = db.getContributorCount(repo.id);
    expect(count).toBe(150);

    const stored = db.getContributors(repo.id);
    expect(stored).toHaveLength(150);
  });
});
