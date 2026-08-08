/**
 * Benchmark task definition schema.
 *
 * Each task defines a challenge the agent must complete, the validation
 * criteria, and the metrics to collect.
 */
export interface BenchmarkTask {
  /** Unique task identifier, e.g. "repo-001" */
  id: string;

  /** Human-readable title */
  title: string;

  /** Capability category being tested */
  category: TaskCategory;

  /** Difficulty level */
  difficulty: 'easy' | 'medium' | 'hard';

  /** The prompt presented to the agent */
  prompt: string;

  /** Starting environment state */
  environment?: {
    /** Git commit to start from */
    startingCommit?: string;
    /** Branch name for the task */
    branch?: string;
  };

  /** Validation configuration */
  validation: {
    /** Shell commands to run for public validation */
    commands?: string[];
    /** Hidden test identifiers to run after agent completion */
    hiddenTests?: string[];
  };

  /** Task constraints */
  constraints?: {
    /** Maximum number of files the agent should change */
    maxFilesChanged?: number;
    /** Whether destructive git commands are allowed */
    destructiveGitCommands?: boolean;
    /** Maximum execution time in seconds */
    maxExecutionTime?: number;
  };

  /** Metrics to collect during evaluation */
  metrics: MetricName[];

  /** Estimated time to complete (seconds) */
  estimatedTime?: number;
}

export type TaskCategory =
  | 'repository-understanding'
  | 'code-search'
  | 'feature-implementation'
  | 'debugging'
  | 'testing'
  | 'refactoring'
  | 'architecture'
  | 'database'
  | 'security'
  | 'performance'
  | 'documentation'
  | 'research'
  | 'tool-selection'
  | 'failure-recovery'
  | 'git-workflow'
  | 'code-review'
  | 'long-context-reasoning'
  | 'parallel-agent-work'
  | 'autonomous-execution';

export type MetricName =
  | 'task_success'
  | 'tests_passed'
  | 'hidden_tests_passed'
  | 'lint_passed'
  | 'build_passed'
  | 'files_modified'
  | 'lines_added'
  | 'lines_removed'
  | 'unnecessary_changes'
  | 'tool_calls'
  | 'failed_tool_calls'
  | 'retries'
  | 'execution_time'
  | 'context_usage'
  | 'git_quality'
  | 'commit_quality'
  | 'branch_correctness'
  | 'documentation_consistency';

/** Result of evaluating a single task */
export interface TaskResult {
  taskId: string;
  category: TaskCategory;
  success: boolean;
  score: number; // 0-100
  metrics: Record<MetricName, any>;
  errors: string[];
  executionTimeMs: number;
}

/** Full benchmark run result */
export interface BenchmarkResult {
  modelName: string;
  modelConfig?: Record<string, any>;
  startedAt: string;
  completedAt: string;
  tasks: TaskResult[];
  scoresByCategory: Record<string, number>;
  overallScore: number;
}
