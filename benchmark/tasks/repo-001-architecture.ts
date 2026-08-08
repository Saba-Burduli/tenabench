import { BenchmarkTask } from '../config';

/**
 * TASK: Repository Understanding
 *
 * Tests whether the agent can explore a codebase, understand its architecture,
 * and produce accurate documentation.
 */
export const task: BenchmarkTask = {
  id: 'repo-001',
  title: 'Analyze and document repository architecture',
  category: 'repository-understanding',
  difficulty: 'easy',
  prompt: `Inspect the entire repository.

Explain its architecture, major components, data flow, dependencies,
and important architectural decisions.

Create or update docs/architecture.md with a comprehensive overview
that another developer could use to understand the codebase.

Include:
- High-level architecture diagram (text-based)
- Component descriptions and responsibilities
- Data flow between components
- Key dependencies and their roles
- Important design decisions and tradeoffs`,
  validation: {
    commands: ['npm run lint'],
  },
  metrics: [
    'task_success',
    'files_modified',
    'tool_calls',
    'execution_time',
    'documentation_consistency',
  ],
  estimatedTime: 300,
};
