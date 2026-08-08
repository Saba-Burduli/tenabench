import { Evaluator } from './evaluator';
import { BenchmarkTask } from './config';
import { task as repo001 } from './tasks/repo-001-architecture';
import { task as feat001 } from './tasks/feat-001-stale-deps';
import { task as debug001 } from './tasks/debug-001-contributor-pagination';

const ALL_TASKS: BenchmarkTask[] = [repo001, feat001, debug001];

/**
 * Benchmark runner.
 *
 * Usage:
 *   npm run benchmark              # Run all tasks
 *   npm run benchmark -- task-id   # Run a specific task
 *   npm run benchmark -- --model qwen  # Specify model name
 */
async function run(args: string[]) {
  const modelname = args.includes('--model')
    ? args[args.indexOf('--model') + 1] || 'unknown'
    : 'local-agent';

  const targetId = args[0] && !args[0].startsWith('--') ? args[0] : null;
  const tasks = targetId ? ALL_TASKS.filter(t => t.id === targetId) : ALL_TASKS;

  if (tasks.length === 0) {
    console.error(`No task found with id: ${targetId}`);
    console.error(`Available tasks: ${ALL_TASKS.map(t => t.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`\nForgeBench — Running ${tasks.length} task(s) for model: ${modelname}\n`);

  const evaluator = new Evaluator(modelname);

  // In the full implementation, this is where the agent would execute.
  // For now, we simulate the evaluation with empty contexts.
  const contexts = new Map<string, any>();
  for (const task of tasks) {
    contexts.set(task.id, {
      filesModified: [],
      linesAdded: 0,
      linesRemoved: 0,
      toolCalls: [],
      retries: 0,
    });
  }

  const result = evaluator.evaluateSuite(tasks, contexts);

  // Print results
  console.log('='.repeat(50));
  console.log(`Model: ${result.modelName}`);
  console.log('='.repeat(50));

  for (const task of result.tasks) {
    const status = task.success ? '✓ PASS' : '✗ FAIL';
    console.log(`\n[${status}] ${task.taskId}: ${task.score}/100`);
    if (task.errors.length > 0) {
      for (const err of task.errors) {
        console.log(`  ⚠ ${err.split('\n')[0]}`);
      }
    }
  }

  console.log('\n' + '-'.repeat(50));
  console.log('Category Scores:');
  for (const [category, score] of Object.entries(result.scoresByCategory)) {
    console.log(`  ${category.padEnd(30)} ${score}`);
  }
  console.log(`\nOverall: ${result.overallScore}`);
  console.log('='.repeat(50));

  // Save result
  const fs = require('fs');
  const path = require('path');
  const reportsDir = path.join(process.cwd(), 'benchmark', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const reportFile = path.join(reportsDir, `${modelname}-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2));
  console.log(`\nReport saved: ${reportFile}`);

  return result;
}

// Run if executed directly
if (require.main === module) {
  run(process.argv.slice(2)).catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
  });
}

export { run, ALL_TASKS };
