# Benchmark Design

## Philosophy

ForgeBench tests whether an AI agent can behave like a capable software engineer inside a real development environment. It does not test simple prompt-response correctness.

## Task Lifecycle

```
Task definition
  → Agent receives prompt
  → Agent explores repository
  → Agent uses tools (search, read, edit, shell, git)
  → Agent implements changes
  → Agent runs validation
  → Agent iterates on failures
  → Evaluator scores the result
```

## Task Definition Schema

Each task is a TypeScript module exporting a `BenchmarkTask`:

- `id` — Unique identifier (e.g., `debug-001`)
- `title` — Human-readable name
- `category` — Capability being tested
- `difficulty` — easy / medium / hard
- `prompt` — The instruction given to the agent
- `validation.commands` — Public validation commands (tests, lint)
- `validation.hiddenTests` — Hidden tests run after completion
- `constraints` — Limits (max files, time, destructive ops)
- `metrics` — Data to collect during evaluation

## Evaluation

The evaluator produces a score (0-100) per task based on:

| Criterion | Weight |
|---|---|
| Public tests pass | 40 points |
| Hidden tests pass | 30 points |
| Constraints respected | 10 points each |
| Code quality (lint) | 10 points |
| No unnecessary changes | 10 points |

## Hidden Tests

Hidden tests are tests the agent cannot see. They verify:

- The agent fixed the actual root cause, not just the symptom
- Edge cases the agent might not have considered
- Behavior under different conditions (timezone, OS, data size)

## Seeded Bugs

The benchmark application contains intentional bugs:

| Bug | Description | Task |
|---|---|---|
| BUG-001 | Timezone-dependent date arithmetic in scoring | Hidden test |
| BUG-002 | Contributor pagination stops after first page | debug-001 |
| BUG-003 | Stale dependency detection endpoint missing | feat-001 |

## Model Comparison

Every model receives:
- Identical repository state (from a known Git commit)
- Identical task prompts
- Identical available tools
- Identical hidden tests
- Identical evaluator

This ensures fair, reproducible comparisons.
