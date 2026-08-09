import { Router, Request, Response } from 'express';
import { AppDatabase } from '@tenabench/database';
import { GitHubClient } from '@tenabench/github-client';
import { calculateHealthScore } from '@tenabench/repository-scoring';

/**
 * Create repository routes bound to a database instance.
 */
export function repoRoutes(db: AppDatabase): Router {
  const router = Router();
  const token = process.env.GITHUB_TOKEN || '';
  const client = new GitHubClient(token);

  /**
   * GET /repos/:owner/:name
   * Fetch repository details, cache in database, return with health score.
   */
  router.get('/:owner/:name', async (req: Request, res: Response) => {
    try {
      const { owner, name } = req.params;
      const fullName = `${owner}/${name}`;

      // Check cache first
      const cached = db.getRepositoryByFullName(fullName);
      if (cached && !req.query.fresh) {
        const contributors = db.getContributors(cached.id);
        const issues = db.getIssues(cached.id);
        const releases = db.getReleases(cached.id);

        const healthScore = calculateHealthScore({
          repository: cached,
          contributors,
          issues,
          releases,
        });

        return res.json({ repository: cached, healthScore });
      }

      // Fetch from GitHub API
      const repository = await client.getRepository(owner, name);
      const contributors = await client.getContributors(owner, name);
      const issues = await client.getIssues(owner, name);
      const releases = await client.getReleases(owner, name);

      // Cache in database
      db.insertRepository(repository);
      db.insertContributors(repository.id, contributors);
      db.insertIssues(repository.id, issues);
      db.insertReleases(repository.id, releases);

      const healthScore = calculateHealthScore({
        repository,
        contributors,
        issues,
        releases,
      });

      res.json({ repository, healthScore });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /repos/:owner/:name/health
   * Return health score for a repository.
   */
  router.get('/:owner/:name/health', async (req: Request, res: Response) => {
    try {
      const { owner, name } = req.params;
      const fullName = `${owner}/${name}`;

      const repo = db.getRepositoryByFullName(fullName);
      if (!repo) {
        // Fetch and cache first
        const repository = await client.getRepository(owner, name);
        const contributors = await client.getContributors(owner, name);
        const issues = await client.getIssues(owner, name);
        const releases = await client.getReleases(owner, name);

        db.insertRepository(repository);
        db.insertContributors(repository.id, contributors);
        db.insertIssues(repository.id, issues);
        db.insertReleases(repository.id, releases);

        const healthScore = calculateHealthScore({
          repository,
          contributors,
          issues,
          releases,
        });

        return res.json(healthScore);
      }

      const contributors = db.getContributors(repo.id);
      const issues = db.getIssues(repo.id);
      const releases = db.getReleases(repo.id);

      const healthScore = calculateHealthScore({
        repository: repo,
        contributors,
        issues,
        releases,
      });

      res.json(healthScore);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /repos/:owner/:name/contributors
   * Return contributor list for a repository.
   */
  router.get('/:owner/:name/contributors', async (req: Request, res: Response) => {
    try {
      const { owner, name } = req.params;
      const fullName = `${owner}/${name}`;

      let repo = db.getRepositoryByFullName(fullName);

      if (!repo) {
        // Fetch and cache
        const repository = await client.getRepository(owner, name);
        const contributors = await client.getContributors(owner, name);

        db.insertRepository(repository);
        db.insertContributors(repository.id, contributors);

        repo = db.getRepositoryByFullName(fullName)!;
      }

      const contributors = db.getContributors(repo.id);
      const count = db.getContributorCount(repo.id);

      res.json({
        contributors,
        total: count,
        repository: fullName,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
