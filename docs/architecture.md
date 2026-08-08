# Architecture

OpenSource Radar is a modular monolith with a clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                  Client                      │
│             (browser / API caller)           │
└────────────────────┬────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────┐
│              apps/api/                       │
│  ┌───────────────────────────────────────┐  │
│  │         Express Server                 │  │
│  │  /repos/:owner/:name → repo details   │  │
│  │  /repos/:owner/:name/health → score   │  │
│  │  /repos/:owner/:name/contributors     │  │
│  └───────────────┬───────────────────────┘  │
└──────────────────┼──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌─────────┐ ┌──────────┐ ┌────────────┐
   │ github- │ │ database │ │ repository-│
   │ client  │ │ (SQLite) │ │  scoring   │
   └─────────┘ └──────────┘ └────────────┘
        │
        ▼
   GitHub API (external)
```

## Components

### apps/api
Express-based REST API server. Handles HTTP requests, orchestrates data flow between packages, and caches results in the database.

- `server.ts` — Entry point, mounts routes
- `routes/repos.ts` — Repository analysis endpoints

### packages/github-client
GitHub API wrapper with rate limit tracking and pagination support.

- `client.ts` — Production client using `fetch`
- `mock.ts` — Mock client for testing and benchmarks

### packages/database
SQLite database layer using `better-sqlite3`.

- `schema.ts` — SQL DDL for all tables
- `connection.ts` — CRUD operations with transaction support

### packages/repository-scoring
Health scoring engine that calculates composite repository scores.

- `scorer.ts` — Multi-dimensional scoring (popularity, activity, maintenance, community)

### packages/shared
TypeScript type definitions shared across all packages.

- `types.ts` — Repository, Contributor, Issue, Release, HealthScore

## Data Flow

1. Client requests `GET /repos/:owner/:name`
2. API checks database cache
3. If not cached (or `?fresh`), fetches from GitHub API
4. Stores data in SQLite
5. Calculates health score using scoring engine
6. Returns repository data + health score

## Database Schema

- `repositories` — Core repo metadata
- `contributors` — Per-repo contributor list with contribution counts
- `issues` — Issues with state, labels, timestamps
- `releases` — GitHub releases with version tags

All child tables reference `repositories.id` via foreign key.

## Design Decisions

- **Modular monolith** — Single deployable unit with internal package boundaries. Avoids microservice complexity while maintaining clear separation.
- **SQLite** — Zero-config database. Suitable for local benchmarking and single-instance deployment.
- **In-memory DB for tests** — Each test gets a fresh database, ensuring isolation.
- **Mock client** — Tests and benchmarks don't require real GitHub API access.
