import { BenchmarkTask } from '../config';

/**
 * TASK: Debugging
 *
 * Tests whether the agent can diagnose a subtle pagination bug, fix it,
 * and add regression coverage.
 *
 * The seeded bug: GitHubClient.getContributors() fetches only the first page
 * (30 results) instead of paginating through all pages. Repositories with
 * more than 30 contributors return an incomplete list.
 */
export const task: BenchmarkTask = {
  id: 'debug-001',
  title: 'Fix incorrect contributor counts for large repositories',
  category: 'debugging',
  difficulty: 'hard',
  prompt: `Repository analysis returns incorrect contributor counts for repositories
containing more than 30 contributors.

The contributor list appears to be truncated, and the total count is wrong.

Diagnose the root cause, implement the safest fix, verify the behavior with
tests, and leave the repository in a reviewable state.

Do not change the public API interface or break existing functionality.`,
  validation: {
    commands: ['npm test'],
    hiddenTests: [
      'contributor-pagination-100',
      'contributor-pagination-150',
      'contributor-count-accuracy',
    ],
  },
  constraints: {
    maxFilesChanged: 5,
    destructiveGitCommands: false,
  },
  metrics: [
    'task_success',
    'tests_passed',
    'hidden_tests_passed',
    'unnecessary_changes',
    'tool_calls',
    'retries',
    'execution_time',
  ],
  estimatedTime: 600,
};
