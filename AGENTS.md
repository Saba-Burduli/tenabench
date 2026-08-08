# ForgeBench — Agent Instructions

This is the ForgeBench repository, containing the OpenSource Radar application and the benchmark system.

## Project Structure

- `apps/api/` — Express API server for OpenSource Radar
- `packages/github-client/` — GitHub API client with rate limit awareness
- `packages/database/` — SQLite database layer
- `packages/repository-scoring/` — Repository health scoring engine
- `packages/shared/` — Shared TypeScript types
- `benchmark/` — Benchmark task definitions, fixtures, and evaluator

## Commands

- `npm install` — Install all dependencies (monorepo with workspaces)
- `npm test` — Run all tests
- `npm run lint` — Run ESLint
- `npm run build` — TypeScript compilation
- `npm start` — Start the API server (port 3000)
- `npm run benchmark` — Run the benchmark suite

## Conventions

- **TypeScript** throughout — use strict typing, avoid `any`
- **Tests** — colocate `.test.ts` files next to source files
- **Git** — use conventional commit messages (`feat:`, `fix:`, `refactor:`, `docs:`)
- **Validation** — run `npm test` after meaningful changes
- **Documentation** — keep docs consistent with implementation

## Validating Changes

After making changes:

1. Run `npm test` to ensure tests pass
2. Run `npm run lint` to check code style
3. Inspect your changes with `git diff`
4. Commit with a descriptive conventional commit message

## Notes

- The database uses SQLite (in-memory by default for testing)
- GitHub API calls require a `GITHUB_TOKEN` environment variable for the live client
- The mock client (`MockGitHubClient`) is available for testing without API access
