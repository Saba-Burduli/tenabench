import {
  BenchmarkTask,
  TaskResult,
  BenchmarkResult,
  MetricName,
} from '../config';

/**
 * Evaluator: runs validation for a completed benchmark task and produces a score.
 *
 * The evaluator checks:
 * 1. Public validation commands (tests, lint) pass
 * 2. Hidden tests pass
 * 3. Constraints are respected
 * 4. Metrics are collected
 */
export class Evaluator {
  constructor(
    private modelName: string,
    private modelConfig?: Record<string, any>
  ) {}

  /**
   * Evaluate a single task after the agent has completed its work.
   */
  evaluate(task: BenchmarkTask, context: EvaluationContext): TaskResult {
    const startTime = Date.now();
    const errors: string[] = [];
    const metrics: Record<MetricName, any> = {} as any;

    // Run public validation commands
    const testResult = this.runValidation(task.validation.commands || []);
    metrics.tests_passed = testResult.passed;
    if (!testResult.passed) {
      errors.push(...testResult.errors);
    }

    // Run hidden tests
    const hiddenResult = this.runHiddenTests(task.validation.hiddenTests || []);
    metrics.hidden_tests_passed = hiddenResult.passed;
    if (!hiddenResult.passed) {
      errors.push(...hiddenResult.errors);
    }

    // Check constraints
    if (task.constraints) {
      const constraintErrors = this.checkConstraints(task.constraints, context);
      errors.push(...constraintErrors);
    }

    // Collect metrics from context
    metrics.files_modified = context.filesModified.length;
    metrics.lines_added = context.linesAdded;
    metrics.lines_removed = context.linesRemoved;
    metrics.tool_calls = context.toolCalls.length;
    metrics.failed_tool_calls = context.toolCalls.filter(t => t.error).length;
    metrics.retries = context.retries;
    metrics.execution_time = (Date.now() - startTime) / 1000;

    // Calculate score
    const score = this.calculateScore(task, metrics, errors, testResult, hiddenResult);
    const success = testResult.passed && score >= 50;

    return {
      taskId: task.id,
      category: task.category,
      success,
      score,
      metrics,
      errors,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Run a full benchmark suite.
   */
  evaluateSuite(tasks: BenchmarkTask[], contexts: Map<string, EvaluationContext>): BenchmarkResult {
    const startedAt = new Date().toISOString();
    const taskResults: TaskResult[] = [];

    for (const task of tasks) {
      const context = contexts.get(task.id);
      if (context) {
        taskResults.push(this.evaluate(task, context));
      } else {
        taskResults.push({
          taskId: task.id,
          category: task.category,
          success: false,
          score: 0,
          metrics: {} as any,
          errors: ['No evaluation context found — agent did not complete this task'],
          executionTimeMs: 0,
        });
      }
    }

    // Calculate category scores
    const categoryScores: Record<string, number[]> = {};
    for (const result of taskResults) {
      if (!categoryScores[result.category]) categoryScores[result.category] = [];
      categoryScores[result.category].push(result.score);
    }

    const scoresByCategory: Record<string, number> = {};
    for (const [category, scores] of Object.entries(categoryScores)) {
      scoresByCategory[category] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    const overallScore = taskResults.length > 0
      ? Math.round(taskResults.reduce((sum, r) => sum + r.score, 0) / taskResults.length)
      : 0;

    return {
      modelName: this.modelName,
      modelConfig: this.modelConfig,
      startedAt,
      completedAt: new Date().toISOString(),
      tasks: taskResults,
      scoresByCategory,
      overallScore,
    };
  }

  private runValidation(commands: string[]): { passed: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const cmd of commands) {
      try {
        const { execSync } = require('child_process');
        execSync(cmd, {
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 120000,
        });
      } catch (err: any) {
        errors.push(`Validation command failed: ${cmd}\n${err.message}`);
      }
    }

    return { passed: errors.length === 0, errors };
  }

  private runHiddenTests(testIds: string[]): { passed: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const testId of testIds) {
      try {
        const { execSync } = require('child_process');
        execSync(`npx jest --testNamePattern="${testId}" --forceExit`, {
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 120000,
        });
      } catch (err: any) {
        errors.push(`Hidden test failed: ${testId}\n${err.message}`);
      }
    }

    return { passed: errors.length === 0, errors };
  }

  private checkConstraints(
    constraints: NonNullable<BenchmarkTask['constraints']>,
    context: EvaluationContext
  ): string[] {
    const errors: string[] = [];

    if (constraints.maxFilesChanged && context.filesModified.length > constraints.maxFilesChanged) {
      errors.push(
        `Constraint violation: changed ${context.filesModified.length} files ` +
        `(max allowed: ${constraints.maxFilesChanged})`
      );
    }

    return errors;
  }

  private calculateScore(
    task: BenchmarkTask,
    metrics: Record<string, any>,
    errors: string[],
    testResult: { passed: boolean },
    hiddenResult: { passed: boolean }
  ): number {
    let score = 100;

    // Deduct for failing public tests
    if (!testResult.passed) score -= 40;

    // Deduct for failing hidden tests
    if (!hiddenResult.passed) score -= 30;

    // Deduct for constraint violations
    const constraintErrors = errors.filter(e => e.includes('Constraint violation'));
    score -= constraintErrors.length * 10;

    // Deduct for excessive file changes
    if (task.constraints?.maxFilesChanged && metrics.files_modified > task.constraints.maxFilesChanged * 1.5) {
      score -= 10;
    }

    // Bonus for no errors
    if (errors.length === 0) score = Math.min(100, score + 5);

    return Math.max(0, Math.min(100, score));
  }
}

/** Context collected during agent execution */
export interface EvaluationContext {
  filesModified: string[];
  linesAdded: number;
  linesRemoved: number;
  toolCalls: { name: string; error?: boolean }[];
  retries: number;
}
