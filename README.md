# TenaBench

**Real-World Agent Capability Lab** — an open-source benchmark for testing whether AI models can behave as capable software engineering agents.

TenaBench places an AI agent inside a real Git repository and gives it realistic engineering tasks. The agent must independently determine what to inspect, how to implement, how to test, and when it is done. The benchmark measures complete agentic workflows, not simple prompt-response correctness.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run the benchmark
npm run benchmark

# Run a specific task
npm run benchmark -- debug-001

# With model name
npm run benchmark -- --model qwen
```

## What It Measures

| Category | Description |
|---|---|
| Repository understanding | Can the agent explore and explain a codebase? |
| Code search | Can the agent find relevant code across a repository? |
| Feature implementation | Can the agent add new functionality following existing conventions? |
| Debugging | Can the agent diagnose and fix subtle bugs? |
| Testing | Can the agent write meaningful tests and interpret failures? |
| Refactoring | Can the agent improve code structure without changing behavior? |
| Git workflows | Can the agent use Git correctly (branches, commits, diffs)? |
| Code review | Can the agent identify bugs, security issues, and code smells? |
| Research | Can the agent use external information to inform implementation? |
| Failure recovery | Can the agent iterate when its first attempt fails? |
| Long-context reasoning | Can the agent handle tasks spanning the entire codebase? |
| Tool selection | Does the agent choose the right tool for each subtask? |

## Interactive Exploration Guide

Use this roadmap to explore every functional part of TenaBench.

### 1. Run the Full Test Suite
```bash
npm test
```
Runs 26 tests across 4 suites: github-client, database, repository-scoring, and API integration.

### 2. Run the Linter
```bash
npm run lint
```
ESLint v9 flat config with TypeScript parser. Should report 0 errors.

### 3. Run the Benchmark Suite
```bash
npm run benchmark
```
Executes all 3 benchmark tasks and produces a scored report in `benchmark/reports/`.

### 4. Explore the API Server
```bash
# Start the server (needs GITHUB_TOKEN for live GitHub calls)
GITHUB_TOKEN=ghp_xxx npm start

# Or start without a token (server starts, live calls will fail)
npm start

# Hit the health endpoint
curl http://localhost:3000/health
```

### 5. Inspect the Architecture
Read the architecture documentation:
```bash
cat docs/architecture.md
cat docs/benchmark-design.md
cat docs/setup.md
```

### 6. Explore Individual Packages
Each package has its own tests you can run in isolation:

```bash
# GitHub client tests (mock-based)
npx jest packages/github-client/

# Database tests (in-memory SQLite)
npx jest packages/database/

# Scoring engine tests
npx jest packages/repository-scoring/

# API integration tests
npx jest apps/api/
```

### 7. Inspect the Benchmark Tasks
Each task is a TypeScript module in `benchmark/tasks/`:

```bash
# Repository understanding task
cat benchmark/tasks/repo-001-architecture.ts

# Feature implementation task
cat benchmark/tasks/feat-001-stale-deps.ts

# Debugging task
cat benchmark/tasks/debug-001-contributor-pagination.ts
```

### 8. Explore Hidden Tests
Tests the agent cannot see — they verify root-cause fixes:

```bash
# Contributor pagination hidden tests
cat benchmark/hidden-tests/contributor-pagination.test.ts

# Timezone scoring hidden test
cat benchmark/hidden-tests/timezone-scoring.test.ts
```

### 9. Run a Single Benchmark Task
```bash
npm run benchmark -- repo-001
npm run benchmark -- feat-001
npm run benchmark -- debug-001
```

### 10. Inspect Generated Reports
```bash
ls benchmark/reports/
cat benchmark/reports/*.json
```

### 11. Explore the Evaluator
```bash
cat benchmark/evaluator/index.ts
```
The evaluator runs validation commands, hidden tests, checks constraints, and produces scores.

### 12. Explore Seeded Bugs
The application contains intentional bugs for agents to discover:

- **BUG-001** — `packages/repository-scoring/src/scorer.ts`: `daysSince()` uses `getTimezoneOffset()` which produces incorrect results when TZ ≠ UTC
- **BUG-002** — `packages/github-client/src/client.ts`: `getContributors()` fetches only the first page (30 results) instead of paginating
- **BUG-003** — Missing `/repos/:owner/:name/dependencies` endpoint (the feature implementation task)

### 13. Explore the Database Schema
```bash
cat packages/database/src/schema.ts
```
Four tables: repositories, contributors, issues, releases — all with foreign keys and indexes.

### 14. Explore the Shared Types
```bash
cat packages/shared/src/types.ts
```
All TypeScript interfaces used across the monorepo: Repository, Contributor, Issue, Release, HealthScore, etc.

### 15. Explore the Mock Client
```bash
cat packages/github-client/src/mock.ts
```
MockGitHubClient returns pre-configured data — no API access needed for testing.

### 16. Explore the Test Fixtures
```bash
cat packages/testing/src/fixtures.ts
```
Helper functions for creating test data: contributors, issues, releases, repositories.

### 17. Explore the Benchmark Config
```bash
cat benchmark/config.ts
```
The task definition schema: BenchmarkTask, TaskCategory, MetricName, TaskResult, BenchmarkResult.

### 18. Try TypeScript Compilation
```bash
npm run build
ls dist/
```

### 19. Explore Git History
```bash
git log --oneline
git show --stat HEAD
```

### 20. Explore the Reset Script
```bash
cat scripts/reset-benchmark.js
node scripts/reset-benchmark.js
```

## How Benchmarks Work

```
Task definition → Agent receives prompt → Agent explores codebase → Agent uses tools
→ Agent implements changes → Agent runs validation → Agent iterates on failures
→ Evaluator scores the result → Report generated
```

## Project Structure

```
tenabench/
├── apps/api/              # OpenSource Radar API server
├── packages/
│   ├── github-client/     # GitHub API client with rate limit awareness
│   ├── database/          # SQLite database layer (sql.js)
│   ├── repository-scoring/ # Health scoring engine
│   ├── shared/            # Shared TypeScript types
│   └── testing/           # Test fixture helpers
├── benchmark/
│   ├── tasks/             # Benchmark task definitions
│   ├── fixtures/          # Test data and mock data
│   ├── hidden-tests/      # Tests not visible to the agent
│   ├── evaluator/         # Scoring and evaluation logic
│   └── reports/           # Generated benchmark reports
├── docs/                  # Architecture and design docs
└── scripts/               # Utility scripts
```

## The Benchmark Application: OpenSource Radar

OpenSource Radar is a developer intelligence platform for analyzing GitHub repositories. It provides:

- Repository health scoring (popularity, activity, maintenance, community)
- Contributor analysis with pagination
- Issue tracking with labels
- Release monitoring

The application is intentionally designed to be complex enough to provide a meaningful benchmark environment while remaining manageable.

## Adding New Tasks

Tasks are defined as TypeScript modules in `benchmark/tasks/`. Each task exports a `BenchmarkTask` object:

```typescript
import { BenchmarkTask } from '../config';

export const task: BenchmarkTask = {
  id: 'my-task-001',
  title: 'My task title',
  category: 'debugging',
  difficulty: 'medium',
  prompt: `Describe the task here...`,
  validation: {
    commands: ['npm test'],
    hiddenTests: ['my-hidden-test'],
  },
  metrics: ['task_success', 'tests_passed', 'execution_time'],
};
```

Then import it in `benchmark/runner.ts` and add it to `ALL_TASKS`.

## Results

Benchmark results are stored in `benchmark/reports/` as JSON files. Each result includes:

- Per-task scores (0-100)
- Category averages
- Overall score
- Detailed metrics (files changed, tool calls, execution time, etc.)
- Error logs

## Model Comparison

TenaBench is model-agnostic. The same benchmark runs identically for any model:

```bash
npm run benchmark -- --model qwen
npm run benchmark -- --model deepseek
npm run benchmark -- --model kimi
```

## Development Roadmap

**Phase 1** ✅ Complete — Repository foundation, OpenSource Radar skeleton, benchmark task schema, evaluator, 3 initial tasks

**Phase 2** — Hidden tests, Git benchmarks, debugging scenarios, automated environment resets, structured result storage

**Phase 3** — Model comparison, detailed traces, dashboards, parallel-agent scenarios, long-context tasks, research tasks

**Phase 4** — Reproducible benchmark releases, larger task library, community benchmark submissions, public leaderboard

## License

MIT
