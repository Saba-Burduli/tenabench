# Setup Guide

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
npm install
```

This installs all workspace dependencies (apps and packages) in a single `node_modules/` at the root.

## Running the API Server

```bash
# With a GitHub token (live API calls)
GITHUB_TOKEN=ghp_xxx npm start

# Without a token (will fail on live calls, but server starts)
npm start
```

The server listens on port 3000 by default. Override with `PORT=8080 npm start`.

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific package
npx jest packages/github-client/
```

## Running the Benchmark

```bash
# All tasks
npm run benchmark

# Specific task
npm run benchmark -- debug-001

# With model name
npm run benchmark -- --model qwen
```

## TypeScript Compilation

```bash
npm run build
```

Outputs compiled JavaScript to `dist/`.
