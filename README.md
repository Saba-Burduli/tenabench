# ForgeBench

**Real-World Agent Capability Lab** — an open-source benchmark for testing whether AI models can behave as capable software engineering agents.

ForgeBench places an AI agent inside a real Git repository and gives it realistic engineering tasks. The agent must independently determine what to inspect, how to implement, how to test, and when it is done. The benchmark measures complete agentic workflows, not simple prompt-response correctness.

## What It Measures

ForgeBench evaluates these capabilities:

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
```

## How Benchmarks Work

1. **Task** — The agent receives a realistic engineering prompt (e.g., "Contributor counts are wrong for large repos")
2. **Agent work** — The agent explores the codebase, uses tools, implements changes
3. **Evaluation** — The evaluator runs public tests, hidden tests, and checks constraints
4. **Result** — A score (0-100) is produced with detailed metrics

```
Task → Understand → Search → Plan → Implement → Test → Diagnose → Iterate → Evaluate → Score
```

## Project Structure

```
forgebench/
├── apps/api/              # OpenSource Radar API server
├── packages/
│   ├── github-client/     # GitHub API client
│   ├── database/          # SQLite database layer
│   ├── repository-scoring/ # Health scoring engine
│   ├── shared/            # Shared types
│   └── testing/           # Test utilities
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

- Repository health scoring
- Contributor analysis
- Issue tracking
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

See `benchmark/config.ts` for the full schema.

## Results

Benchmark results are stored in `benchmark/reports/` as JSON files. Each result includes:

- Per-task scores (0-100)
- Category averages
- Overall score
- Detailed metrics (files changed, tool calls, execution time, etc.)
- Error logs

## Model Comparison

ForgeBench is model-agnostic. The same benchmark runs identically for any model:

```bash
npm run benchmark -- --model qwen
npm run benchmark -- --model deepseek
npm run benchmark -- --model kimi
```

## License

MIT
