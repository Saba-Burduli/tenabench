/** GitHub repository metadata */
export interface Repository {
  id: string;
  full_name: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  default_branch: string;
  size: number;
}

/** Repository contributor with activity stats */
export interface Contributor {
  login: string;
  contributions: number;
  type: 'User' | 'Organization';
  avatar_url: string;
  html_url: string;
}

/** GitHub issue */
export interface Issue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
  comments: number;
  labels: string[];
}

/** GitHub release */
export interface Release {
  tag_name: string;
  name: string;
  created_at: string;
  published_at: string;
  prerelease: boolean;
}

/** Composite health score with dimension breakdown */
export interface HealthScore {
  overall: number;
  dimensions: ScoreDimension[];
}

export interface ScoreDimension {
  name: string;
  score: number;
  weight: number;
}

/** Activity event from GitHub API */
export interface ActivityEvent {
  id: string;
  type: string;
  actor: string;
  repo: string;
  created_at: string;
}

/** Dependency version info for stale detection */
export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  isOutdated: boolean;
  daysSinceRelease: number;
}

/** Result of stale dependency analysis */
export interface StaleDependencyReport {
  repository: string;
  dependencies: DependencyInfo[];
  totalOutdated: number;
  lastChecked: string;
}
