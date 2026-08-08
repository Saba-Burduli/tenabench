import { MockGitHubClient } from '../../packages/github-client/src/mock';
import { createLargeRepoContributors } from '../fixtures/large-repo';

/**
 * Hidden test: Timezone-sensitive scoring.
 * The daysSince function uses getTimezoneOffset() which produces incorrect
 * results when TZ != UTC.
 */
describe('Hidden: timezone-sensitive scoring', () => {
  test('daysSince is consistent regardless of timezone offset', () => {
    const { daysSince } = require('../../packages/repository-scoring/src/scorer');

    // A date exactly 7 days ago in UTC
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const days = daysSince(sevenDaysAgo);

    // Should be approximately 7, not 7 + timezoneOffset
    expect(days).toBeGreaterThanOrEqual(6);
    expect(days).toBeLessThanOrEqual(8);
  });
});
