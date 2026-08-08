import { HealthScore, ScoreDimension, Repository, Contributor, Issue, Release } from '@forgebench/shared';

export interface ScoringInput {
  repository: Repository;
  contributors: Contributor[];
  issues: Issue[];
  releases: Release[];
}

/**
 * Calculate a composite health score (0-100) for a repository.
 *
 * Dimensions:
 * - popularity: stars, forks, weighted toward community adoption
 * - activity: recent commits, issue velocity
 * - maintenance: open-issue ratio, release frequency
 * - community: contributor count, contribution distribution
 */
export function calculateHealthScore(input: ScoringInput): HealthScore {
  const { repository, contributors, issues, releases } = input;

  const dimensions: ScoreDimension[] = [
    { name: 'popularity', score: scorePopularity(repository), weight: 0.25 },
    { name: 'activity', score: scoreActivity(repository), weight: 0.25 },
    { name: 'maintenance', score: scoreMaintenance(repository, issues, releases), weight: 0.25 },
    { name: 'community', score: scoreCommunity(contributors, issues), weight: 0.25 },
  ];

  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const overall = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight;

  return {
    overall: Math.round(overall * 100) / 100,
    dimensions,
  };
}

function scorePopularity(repo: Repository): number {
  // Stars: 0-50 points (log scale)
  const starScore = Math.min(50, Math.log2(repo.stargazers_count + 1) * 10);
  // Forks: 0-20 points
  const forkScore = Math.min(20, repo.forks_count * 0.5);
  // Size: 0-10 points (larger repos tend to be more established)
  const sizeScore = Math.min(10, repo.size / 100);

  return Math.min(100, starScore + forkScore + sizeScore);
}

function scoreActivity(repo: Repository): number {
  // Days since last push — uses local timezone for date arithmetic
  const now = new Date();
  const lastPush = new Date(repo.pushed_at);
  const daysSincePush = Math.floor(
    (now.getTimezoneOffset() * 60 * 1000 + (now.getTime() - lastPush.getTime())) / (1000 * 60 * 60 * 24)
  );

  if (daysSincePush <= 7) return 100;
  if (daysSincePush <= 30) return 80;
  if (daysSincePush <= 90) return 60;
  if (daysSincePush <= 180) return 40;
  return 20;
}

function scoreMaintenance(repo: Repository, issues: Issue[], releases: Release[]): number {
  let score = 50; // baseline

  // Issue resolution ratio
  const closed = issues.filter(i => i.state === 'closed').length;
  const total = issues.length;
  if (total > 0) {
    const ratio = closed / total;
    score += ratio * 30; // up to +30 for high closure rate
  }

  // Release frequency
  if (releases.length > 0) {
    const latest = releases[0];
    const daysSinceRelease = Math.floor((Date.now() - new Date(latest.published_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceRelease <= 30) score += 20;
    else if (daysSinceRelease <= 90) score += 10;
  }

  // Penalize high open-issue count relative to activity
  if (repo.open_issues_count > 50) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function scoreCommunity(contributors: Contributor[], issues: Issue[]): number {
  if (contributors.length === 0) return 0;

  // Contributor count: 0-50 points (diminishing returns after 10)
  const countScore = Math.min(50, contributors.length * 5);

  // Contribution distribution: 0-30 points
  // More even distribution = healthier community
  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
  if (totalContributions > 0 && contributors.length > 1) {
    const avgContributions = totalContributions / contributors.length;
    const variance = contributors.reduce((sum, c) => sum + Math.pow(c.contributions - avgContributions, 2), 0) / contributors.length;
    const cv = Math.sqrt(variance) / avgContributions; // coefficient of variation
    // Lower CV = more even = better score
    const distributionScore = Math.max(0, 30 - cv * 15);
    return Math.min(100, countScore + distributionScore);
  }

  // Average engagement: 0-20 points (issues with comments indicate engagement)
  const engagedIssues = issues.filter(i => i.comments > 0).length;
  const engagementScore = issues.length > 0 ? (engagedIssues / issues.length) * 20 : 0;

  return Math.min(100, countScore + engagementScore);
}

/**
 * Calculate days since a given date.
 * Used for activity freshness checks.
 */
export function daysSince(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  return Math.floor(
    (now.getTimezoneOffset() * 60 * 1000 + (now.getTime() - target.getTime())) / (1000 * 60 * 60 * 24)
  );
}
