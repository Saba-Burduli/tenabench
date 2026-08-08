import { BenchmarkTask } from '../config';

/**
 * TASK: Feature Implementation
 *
 * Tests whether the agent can discover existing conventions, implement a new
 * API endpoint, add tests, and follow project patterns.
 */
export const task: BenchmarkTask = {
  id: 'feat-001',
  title: 'Add stale dependency detection endpoint',
  category: 'feature-implementation',
  difficulty: 'medium',
  prompt: `OpenSource Radar is missing a stale dependency detection feature.

Implement a new API endpoint:
  GET /repos/:owner/:name/dependencies

The endpoint should:
- Analyze the repository's dependencies (from package.json if present)
- Return a list of dependencies with their current and latest versions
- Flag dependencies that are outdated
- Follow the existing routing patterns and conventions in the codebase

Add appropriate tests for the new endpoint.
Update documentation if relevant.`,
  validation: {
    commands: ['npm test', 'npm run lint'],
    hiddenTests: ['stale-dependencies-basic', 'stale-dependencies-empty-repo'],
  },
  metrics: [
    'task_success',
    'tests_passed',
    'hidden_tests_passed',
    'lint_passed',
    'files_modified',
    'lines_added',
    'tool_calls',
    'execution_time',
  ],
  estimatedTime: 600,
};
