export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS repositories (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL UNIQUE,
  description TEXT,
  html_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  pushed_at TEXT NOT NULL,
  stargazers_count INTEGER NOT NULL DEFAULT 0,
  forks_count INTEGER NOT NULL DEFAULT 0,
  open_issues_count INTEGER NOT NULL DEFAULT 0,
  language TEXT,
  default_branch TEXT,
  size INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contributors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  login TEXT NOT NULL,
  contributions INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  html_url TEXT,
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  closed_at TEXT,
  comments INTEGER NOT NULL DEFAULT 0,
  labels TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

CREATE TABLE IF NOT EXISTS releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  name TEXT,
  created_at TEXT NOT NULL,
  published_at TEXT NOT NULL,
  prerelease INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

CREATE INDEX IF NOT EXISTS idx_contributors_repo ON contributors(repository_id);
CREATE INDEX IF NOT EXISTS idx_issues_repo ON issues(repository_id);
CREATE INDEX IF NOT EXISTS idx_releases_repo ON releases(repository_id);
`;
