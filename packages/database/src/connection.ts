import Database from 'better-sqlite3';
import { Database as DbType } from 'better-sqlite3';
import { SCHEMA_SQL } from './schema';
import { Repository, Contributor, Issue, Release } from '@forgebench/shared';

export class AppDatabase {
  private db: DbType;

  constructor(path?: string) {
    this.db = new Database(path || ':memory:');
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA_SQL);
  }

  get raw(): DbType {
    return this.db;
  }

  insertRepository(repo: Repository): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO repositories
        (id, full_name, description, html_url, created_at, updated_at, pushed_at,
         stargazers_count, forks_count, open_issues_count, language, default_branch, size)
      VALUES (@id, @full_name, @description, @html_url, @created_at, @updated_at, @pushed_at,
             @stargazers_count, @forks_count, @open_issues_count, @language, @default_branch, @size)
    `).run(repo);
  }

  getRepository(id: string): Repository | undefined {
    return this.db.prepare(`
      SELECT * FROM repositories WHERE id = ?
    `).get(id) as Repository | undefined;
  }

  getRepositoryByFullName(fullName: string): Repository | undefined {
    return this.db.prepare(`
      SELECT * FROM repositories WHERE full_name = ?
    `).get(fullName) as Repository | undefined;
  }

  insertContributors(repositoryId: string, contributors: Contributor[]): void {
    // Clear existing contributors for this repo, then insert fresh data
    this.db.prepare(`DELETE FROM contributors WHERE repository_id = ?`).run(repositoryId);

    const insert = this.db.prepare(`
      INSERT INTO contributors (repository_id, login, contributions, type, avatar_url, html_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((contribs: Contributor[]) => {
      for (const c of contribs) {
        insert.run(repositoryId, c.login, c.contributions, c.type, c.avatar_url, c.html_url);
      }
    });

    insertMany(contributors);
  }

  getContributors(repositoryId: string): Contributor[] {
    return this.db.prepare(`
      SELECT login, contributions, type, avatar_url, html_url
      FROM contributors WHERE repository_id = ?
      ORDER BY contributions DESC
    `).all(repositoryId) as Contributor[];
  }

  getContributorCount(repositoryId: string): number {
    const row = this.db.prepare(`
      SELECT COUNT(*) as count FROM contributors WHERE repository_id = ?
    `).get(repositoryId) as { count: number };
    return row.count;
  }

  insertIssues(repositoryId: string, issues: Issue[]): void {
    this.db.prepare(`DELETE FROM issues WHERE repository_id = ?`).run(repositoryId);

    const insert = this.db.prepare(`
      INSERT INTO issues (repository_id, number, title, state, created_at, closed_at, comments, labels)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((iss: Issue[]) => {
      for (const i of iss) {
        insert.run(
          repositoryId, i.number, i.title, i.state, i.created_at,
          i.closed_at, i.comments, JSON.stringify(i.labels)
        );
      }
    });

    insertMany(issues);
  }

  getIssues(repositoryId: string): Issue[] {
    const rows = this.db.prepare(`
      SELECT number, title, state, created_at, closed_at, comments, labels
      FROM issues WHERE repository_id = ?
      ORDER BY created_at DESC
    `).all(repositoryId);

    return rows.map((row: any) => ({
      ...row,
      labels: JSON.parse(row.labels),
    })) as Issue[];
  }

  insertReleases(repositoryId: string, releases: Release[]): void {
    this.db.prepare(`DELETE FROM releases WHERE repository_id = ?`).run(repositoryId);

    const insert = this.db.prepare(`
      INSERT INTO releases (repository_id, tag_name, name, created_at, published_at, prerelease)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((rels: Release[]) => {
      for (const r of rels) {
        insert.run(repositoryId, r.tag_name, r.name, r.created_at, r.published_at, r.prerelease ? 1 : 0);
      }
    });

    insertMany(releases);
  }

  getReleases(repositoryId: string): Release[] {
    return this.db.prepare(`
      SELECT tag_name, name, created_at, published_at, prerelease
      FROM releases WHERE repository_id = ?
      ORDER BY published_at DESC
    `).all(repositoryId) as Release[];
  }

  close(): void {
    this.db.close();
  }
}
