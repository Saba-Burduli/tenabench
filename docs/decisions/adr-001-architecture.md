# ADR-001: Modular Monolith Architecture

## Context

TenaBench needs a benchmark application complex enough to test real engineering workflows but simple enough to run locally without external services.

## Decision

Use a TypeScript modular monolith with npm workspaces. Single Express API server, internal packages for github-client, database, scoring, and shared types.

## Consequences

**Positive:**
- Zero external dependencies (no Docker, no Redis, no PostgreSQL)
- Fast local setup (`npm install && npm test`)
- Clear package boundaries for testing agent navigation
- Easy to seed bugs in specific packages

**Negative:**
- Not representative of distributed systems
- Cannot test inter-service communication
- SQLite limits concurrency testing

## Rationale

The goal is testing agent capability, not infrastructure complexity. A modular monolith provides sufficient complexity (multiple packages, data flow, API design) without operational overhead.
