# Vault Ledger

> Production-grade personal finance platform engineered with a strict double-entry ledger, event-driven automation rules engine, recurring subscription detection, and 6-month Monte Carlo predictive forecasting.

<p align="center">
  <img src="screenshots/login-screen.png" alt="Vault Ledger Interface Preview" width="800" style="border-radius: 8px;" />
</p>

---

## System Overview

Most personal finance apps suffer from two major flaws:

1. **Floating-Point Imprecision**: Storing balances as IEEE-754 floats (`0.1 + 0.2 === 0.30000000000000004`) leads to rounding drift, silent discrepancies, and accounting errors.
2. **Single-Entry Mutation**: Updating a single mutable `balance` column makes audits impossible and causes race conditions during concurrent transfers.

**Vault Ledger solves this at the database engine level.** Every financial event is recorded as an immutable **double-entry journal entry** composed of balanced postings whose sum of debits and credits is strictly zero. All monetary values are represented as **integer cents** (`bigint` in PostgreSQL, `number` in TypeScript). Account balances and net worth are computed dynamically by aggregating posting amounts, preserving a complete audit trail.

---

## Architectural Highlights

### 1. Atomic Double-Entry Accounting Core

- **Integer Cents**: Monetary values are stored as signed integer cents. Never floats.
- **Zero-Sum Ledger Invariant**: Every `journal_entry` contains two or more `postings`. An entry is rejected at the service level if `sum(postings.amountCents) !== 0`.
- **Dynamic Balance Derivation**: Balances are calculated dynamically by summing postings. No mutable account balance drifts over time.
- **Strict Classification**: Supports `depository`, `vault`, `investment`, `credit`, `loan`, `equity`, `income`, and `expense` account types following standard GAAP ledger principles.

### 2. Event-Driven Outbox Worker & Rules Engine

- **Transactional Outbox Pattern**: Transactions atomically enqueue `transaction.created` events into an `outbox_events` table within the same PostgreSQL transaction.
- **Rules Engine**:
  - **Round-Up Rule**: Rounds purchases up to the nearest dollar with optional multiplier (1x, 2x, 5x, 10x) and transfers spare change into a savings Vault.
  - **Percent-of-Income Rule**: Automatically detects payroll direct deposits and transfers an agreed percentage (e.g., 15%) directly to savings or investments.
  - **Cash Sweep Rule**: Periodically sweeps balances exceeding a checking threshold into a high-yield savings Vault.
- **Idempotency & Anti-Recursion**:
  - Strict unique index on `(rule_id, source_entry_id)` guarantees rules never double-execute during retries.
  - System transfers are tagged with `source: 'rule_execution'`, preventing recursive cascades of round-up rules.

### 3. Recurring Detection & Subscription Intelligence

- Analyzes transaction intervals to automatically detect periodic merchants.
- Identifies **weekly** (6–8 day intervals), **biweekly** (13–16 day intervals), **monthly** (27–33 day intervals), and **annual** (350–380 day intervals) cadences.
- Tracks average amounts, projects `nextExpectedDate`, and triggers proactive alerts for upcoming bills and subscription price hikes.

### 4. 6-Month Monte Carlo Predictive Forecasting

- Naive linear projections fail because discretionary spending is inherently stochastic.
- **Vault Ledger's Forecasting Engine**:
  - Extracts deterministic recurring cash flows (scheduled payroll, rent, utilities, subscriptions).
  - Analyzes the empirical standard deviation and mean daily spend over the prior 90 days.
  - Executes **1,000 Monte Carlo simulation runs** using Box-Muller Gaussian sampling.
  - Yields **p10 (conservative)**, **p50 (median)**, and **p90 (optimistic)** confidence bands plotted onto the interactive asset trajectory chart.

### 5. Deterministic Financial Data Provider

- Includes an out-of-the-box `SyntheticDataProvider` that generates 18 months of realistic, multi-category transaction history (payroll, rent, groceries, coffee, utilities, subscriptions).
- Every synthetic transaction has a deterministic `externalId`, ensuring idempotent re-syncing without data duplication.
- Plaid Sandbox adapter with link token generation for live banking integration.

### 6. Editorial Dark-Mode Design System

- Built with an editorial, data-dense fintech aesthetic (inspired by Copilot, Linear, and Bloomberg terminals).
- High-contrast typography with tabular monospace numerals (`JetBrains Mono` / monospace) to eliminate layout jitter during financial updates.
- Custom SVG Bezier chart (`d3-shape`) featuring interactive scrub gestures, haptic feedback, and shaded confidence intervals.
- Universal layout: responsive desktop sidebar navigation on screens `>= 768px` and ergonomic bottom tab bar on mobile.

---

## Monorepo Layout

```
vault-ledger/
├── apps/
│   ├── api/                      # Fastify 5 REST API & Ledger Service
│   │   ├── src/
│   │   │   ├── db/               # Drizzle ORM schema, migrations, connection pool
│   │   │   ├── plugins/          # JWT auth plugin, OpenAPI Swagger docs
│   │   │   ├── providers/        # Synthetic & Plaid data sync providers
│   │   │   ├── routes/           # Accounts, transactions, rules, budgets, goals, insights
│   │   │   ├── services/         # Double-entry ledger, auth (Argon2id), Monte Carlo
│   │   │   └── workers/          # Outbox processor, rules engine, recurring detector
│   │   └── Dockerfile            # Multi-stage production Docker build
│   └── mobile/                   # Universal Expo 52+ application (Web, iOS, Android)
│       └── src/
│           ├── app/              # Expo Router file-based screens (auth + 6 tabs)
│           ├── components/       # Scrubbable bezier chart, stat blocks, badges, navigation
│           ├── store/            # Zustand auth & biometric session store
│           └── theme/            # WCAG-AA compliant tokens & typography
├── packages/
│   └── shared/                   # Shared types, money utilities, Zod schemas
├── docker-compose.yml            # Local PostgreSQL 16 on port 5433
└── .github/workflows/ci.yml      # GitHub Actions CI (lint, typecheck, test, build)
```

---

## Quickstart & Local Development

### Prerequisites

- **Node.js**: `v22.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Docker & Docker Compose** (for local PostgreSQL database)

### 1. Clone & Install

```bash
git clone https://github.com/bryanthomaas/Vault-Ledger.git
cd Vault-Ledger
npm install
```

### 2. Start PostgreSQL

```bash
npm run db:up
```

_Spins up PostgreSQL 16 on `localhost:5433` with user `vault`, password `vault`, and database `vault_ledger`._

### 3. Run Database Migrations

```bash
npm run db:migrate
```

_Applies Drizzle schema migrations to initialize the 12 core tables and unique indexes._

### 4. Start Development Servers

```bash
npm run dev
```

This command runs both services concurrently:

- **API**: Running on [http://localhost:3000](http://localhost:3000)
- **Interactive OpenAPI Docs**: Explore endpoints at [http://localhost:3000/docs](http://localhost:3000/docs)
- **Web App**: Running on [http://localhost:8081](http://localhost:8081)

### 5. Accessing the Demo Sandbox

Open [http://localhost:8081](http://localhost:8081) in your browser. Click **"Explore Demo Sandbox"** on the login screen.

- A transient demo session is provisioned with 18 months of pre-calculated double-entry ledger transactions, automated rules, monthly category budgets, and savings goals.
- Or log in manually with:
  - **Email**: `demo@vaultledger.local`
  - **Password**: `DemoPass123!`

---

## API Reference & Interactive Swagger

When the API is running, full interactive OpenAPI / Swagger documentation is available at:

```
http://localhost:3000/docs
```

### Key Endpoints

| Method  | Path                             | Description                                                                    |
| :------ | :------------------------------- | :----------------------------------------------------------------------------- |
| `POST`  | `/api/auth/register`             | Register new user account with Argon2id password hashing                       |
| `POST`  | `/api/auth/login`                | Authenticate and obtain rotating JWT access & refresh tokens                   |
| `POST`  | `/api/auth/demo`                 | Provision an instant 18-month demo sandbox user                                |
| `GET`   | `/api/accounts`                  | Fetch all user accounts with dynamically aggregated balances                   |
| `GET`   | `/api/transactions`              | Query ledger transactions with search, pagination, and category filtering      |
| `PATCH` | `/api/transactions/:id/category` | Re-categorize a journal entry                                                  |
| `GET`   | `/api/rules`                     | List user automation rules (round-ups, income %, sweeps)                       |
| `POST`  | `/api/rules`                     | Create a new automated transfer rule                                           |
| `PATCH` | `/api/rules/:id/toggle`          | Enable or disable a rule                                                       |
| `GET`   | `/api/budgets`                   | Fetch monthly category budgets with current period spend                       |
| `POST`  | `/api/budgets`                   | Upsert monthly budget limit for a category                                     |
| `GET`   | `/api/goals`                     | List savings goals linked to Vault accounts                                    |
| `POST`  | `/api/goals`                     | Create a savings goal                                                          |
| `GET`   | `/api/notifications`             | Stream activity audit log (rules fired, budget overruns, recurring detections) |
| `PATCH` | `/api/notifications/:id/read`    | Mark an audit notification as read                                             |
| `POST`  | `/api/notifications/read-all`    | Mark all notifications as read                                                 |
| `GET`   | `/api/insights/spending`         | Category breakdown & month-over-month velocity                                 |
| `GET`   | `/api/insights/forecast`         | 6-month Monte Carlo simulation trajectory (p10/p50/p90 bands)                  |
| `POST`  | `/api/sync/synthetic`            | Deterministically seed 18 months of realistic transactional history            |
| `GET`   | `/health`                        | Liveness & PostgreSQL connection health check                                  |

---

## Verification & Testing Suite

Vault Ledger includes an automated test suite verifying integer math edge cases, ledger zero-sum invariants, rule idempotency, and API endpoints.

```bash
# Run Vitest test suite across all packages (25/25 passing)
npm test

# Static typecheck across all workspaces (TypeScript strict mode)
npm run typecheck

# Code style & ESLint static analysis
npm run lint

# Prettier format check
npm run format:check

# Export optimized production Expo web bundle
npm run build:web -w @vault-ledger/mobile
```

---

## Production Deployment

### 1. API Deployment (Docker / Container)

The API includes a multi-stage production `Dockerfile` with automated test verification and health checks:

```bash
docker build -t vault-ledger-api:latest -f apps/api/Dockerfile .
docker run -p 3000:3000 -e DATABASE_URL="postgres://..." vault-ledger-api:latest
```

Deployable seamlessly to **Render**, **Railway**, **Fly.io**, or **AWS ECS**.

### 2. Database (Managed PostgreSQL)

Requires a standard PostgreSQL instance (version 15+). Compatible with **Neon**, **Supabase**, or **AWS RDS**:

```bash
DATABASE_URL="postgres://user:password@neon-host/vault_ledger?sslmode=require" npm run db:migrate
```

### 3. Frontend Deployment (Web & Native)

- **Web**: Run `npm run build:web -w @vault-ledger/mobile` and deploy the output in `apps/mobile/dist` to **Vercel**, **Cloudflare Pages**, or **Netlify**.
- **iOS & Android**: Build native binaries using Expo Application Services:
  ```bash
  cd apps/mobile
  npx eas-cli build --platform all
  ```

---

## License

MIT © [Bryan Thomas](https://github.com/bryanthomaas)
