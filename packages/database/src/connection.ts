import { SCHEMA_SQL } from './schema';
import { Repository, Contributor, Issue, Release } from '@tenabench/shared';

function getSQL(): any {
  if (global.SQL) return global.SQL;
  throw new Error('sql.js not initialized.');
}

export class AppDatabase {
  private db: any;

  constructor() {
    const SQL = getSQL();
    this.db = new SQL.Database();
    this.db.exec(SCHEMA_SQL);
  }

  get raw(): any {
    return this.db;
  }

  insertRepository(repo: Repository): void {
    this.db.run(
      `INSERT OR REPLACE INTO repositories
        (id, full_name, description, html_url, created_at, updated_at, pushed_at,
         stargazers_count, forks_count, open_issues_count, language, default_branch, size)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)`,
      [repo.id, repo.full_name, repo.description ?? null, repo.html_url,
       repo.created_at, repo.updated_at, repo.pushed_at,
       repo.stargazers_count, repo.forks_count, repo.open_issues_count,
       repo.language ?? null, repo.default_branch, repo.size]
    );
  }

  getRepository(id: string): Repository | undefined {
    const results = this.db.exec(`SELECT * FROM repositories WHERE id = '${id.replace(/'/g, "''")}'`);
    if (results.length === 0 || results[0].values.length === 0) return undefined;
    return mapRowToRepository(results[0].values[0]);
  }

  getRepositoryByFullName(fullName: string): Repository | undefined {
    const results = this.db.exec(`SELECT * FROM repositories WHERE full_name = '${fullName.replace(/'/g, "''")}'`);
    if (results.length === 0 || results[0].values.length === 0) return undefined;
    return mapRowToRepository(results[0].values[0]);
  }

  insertContributors(repositoryId: string, contributors: Contributor[]): void {
    this.db.run(`DELETE FROM contributors WHERE repository_id = '${repositoryId.replace(/'/g, "''")}'`);

    const stmt = this.db.prepare(
      'INSERT INTO contributors (repository_id, login, contributions, type, avatar_url, html_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
    );

    for (const c of contributors) {
      stmt.bind([repositoryId, c.login, c.contributions, c.type, c.avatar_url, c.html_url]);
      stmt.step();
      stmt.reset();
    }
    stmt.free();
  }

  getContributors(repositoryId: string): Contributor[] {
    const results = this.db.exec(
      `SELECT login, contributions, type, avatar_url, html_url FROM contributors WHERE repository_id = '${repositoryId.replace(/'/g, "''")}' ORDER BY contributions DESC`
    );
    if (results.length === 0) return [];
    return results[0].values.map((row: any) => ({
      login: row[0] as string,
      contributions: row[1] as number,
      type: (row[2] as string) as 'User' | 'Organization',
      avatar_url: (row[3] as string) ?? '',
      html_url: (row[4] as string) ?? '',
    }));
  }

  getContributorCount(repositoryId: string): number {
    const results = this.db.exec(
      `SELECT COUNT(*) as count FROM contributors WHERE repository_id = '${repositoryId.replace(/'/g, "''")}'`
    );
    if (results.length === 0 || results[0].values.length === 0) return 0;
    return results[0].values[0][0] as number;
  }

  insertIssues(repositoryId: string, issues: Issue[]): void {
    this.db.run(`DELETE FROM issues WHERE repository_id = '${repositoryId.replace(/'/g, "''")}'`);

    const stmt = this.db.prepare(
      'INSERT INTO issues (repository_id, number, title, state, created_at, closed_at, comments, labels) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)'
    );

    for (const i of issues) {
      stmt.bind([repositoryId, i.number, i.title, i.state, i.created_at, i.closed_at ?? null, i.comments, JSON.stringify(i.labels)]);
      stmt.step();
      stmt.reset();
    }
    stmt.free();
  }

  getIssues(repositoryId: string): Issue[] {
    const results = this.db.exec(
      `SELECT number, title, state, created_at, closed_at, comments, labels FROM issues WHERE repository_id = '${repositoryId.replace(/'/g, "''")}' ORDER BY created_at DESC`
    );
    if (results.length === 0) return [];
    return results[0].values.map((row: any) => ({
      number: row[0] as number,
      title: row[1] as string,
      state: (row[2] as string) as 'open' | 'closed',
      created_at: row[3] as string,
      closed_at: (row[4] as string) ?? null,
      comments: row[5] as number,
      labels: JSON.parse(row[6] as string),
    }));
  }

  insertReleases(repositoryId: string, releases: Release[]): void {
    this.db.run(`DELETE FROM releases WHERE repository_id = '${repositoryId.replace(/'/g, "''")}'`);

    const stmt = this.db.prepare(
      'INSERT INTO releases (repository_id, tag_name, name, created_at, published_at, prerelease) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
    );

    for (const r of releases) {
      stmt.bind([repositoryId, r.tag_name, r.name, r.created_at, r.published_at, r.prerelease ? 1 : 0]);
      stmt.step();
      stmt.reset();
    }
    stmt.free();
  }

  getReleases(repositoryId: string): Release[] {
    const results = this.db.exec(
      `SELECT tag_name, name, created_at, published_at, prerelease FROM releases WHERE repository_id = '${repositoryId.replace(/'/g, "''")}' ORDER BY published_at DESC`
    );
    if (results.length === 0) return [];
    return results[0].values.map((row: any) => ({
      tag_name: row[0] as string,
      name: (row[1] as string) ?? '',
      created_at: row[2] as string,
      published_at: row[3] as string,
      prerelease: !!row[4],
    }));
  }

  close(): void {
    this.db.close();
  }
}

function mapRowToRepository(row: any): Repository {
  // exec() returns rows as arrays indexed by column position
  // Schema: id, full_name, description, html_url, created_at, updated_at, pushed_at,
  //         stargazers_count, forks_count, open_issues_count, language, default_branch, size
  return {
    id: row[0] as string,
    full_name: row[1] as string,
    description: (row[2] as string) ?? null,
    html_url: row[3] as string,
    created_at: row[4] as string,
    updated_at: row[5] as string,
    pushed_at: row[6] as string,
    stargazers_count: row[7] as number,
    forks_count: row[8] as number,
    open_issues_count: row[9] as number,
    language: (row[10] as string) ?? null,
    default_branch: row[11] as string,
    size: row[12] as number,
  };
}
