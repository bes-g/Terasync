# TeraSync

Reverse-RFQ marketplace with escrow settlement for automotive and industrial spare parts in Addis Ababa, Ethiopia.

## Architecture

This repository is organized as a clean `pnpm` monorepo:

- `backend/`: Express.js + TypeScript backend API service (runs on port `4000`)
- `frontend/`: Next.js 14 (App Router) + Tailwind CSS web application (runs on port `3000`)
- `packages/shared/`: Shared types, Zod schemas, enums, and money utilities
- `docker-compose.yml`: PostgreSQL 16 and Redis 7 local development services

## Prerequisites

- **Node.js**: v20+ LTS
- **pnpm**: v9+ (`npm install -g pnpm`)
- **Docker & Docker Compose**: For local PostgreSQL and Redis

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the root:

```bash
cp .env.example .env
```

### 3. Start Infrastructure (PostgreSQL & Redis)

```bash
docker compose up -d
```

### 4. Running the Development Servers

To start **both backend and frontend** simultaneously:

```bash
npm run dev
# or: pnpm dev
```

Or start them individually:

```bash
# Start backend API only (:4000)
pnpm run dev:backend

# Start frontend Web App only (:3000)
pnpm run dev:frontend
```

- **Frontend Web App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **Backend Health Check:** [http://localhost:4000/health](http://localhost:4000/health)

### 5. Running Verification & Quality Checks

```bash
# Run linting across all packages
pnpm run lint

# Format code with Prettier
pnpm run format

# Run TypeScript typechecks
pnpm run typecheck

# Run test suites (Vitest & Supertest)
pnpm run test
```
