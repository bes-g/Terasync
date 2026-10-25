# TeraSync

### A trusted reverse-RFQ marketplace for automotive and industrial spare parts in Addis Ababa

> 🌐 **Hosted platform:** [https://terasync-pi.vercel.app](https://terasync-pi.vercel.app)

TeraSync helps mechanics, vehicle owners, fleet managers, and industrial technicians find the right spare part without spending hours visiting multiple markets. A buyer describes the part they need, relevant vendors submit competitive offers, and the buyer can compare the available options before ordering.

> **Graduation project:** TeraSync is being developed as a practical marketplace prototype for the Ethiopian spare-parts market. The repository combines a domain-focused TypeScript backend foundation, a planned vehicle-first storefront, and trust-focused marketplace workflows.

## Why TeraSync?

Finding spare parts in Addis Ababa is often slow and uncertain:

- inventory is fragmented across markets such as Teklehaymanot, Kera, Somali Tera, and Akaki;
- buyers may not know the correct part name or OEM number;
- counterfeit, used, and aftermarket parts can be difficult to distinguish;
- wrong fitment creates expensive returns and wasted workshop time; and
- buyers and vendors both need protection when payment and delivery happen remotely.

TeraSync addresses these problems with a **vehicle-first catalog**, **visual part identification**, **reverse requests for quotation**, **vendor comparison**, and a trust-focused order flow.

## Product flow

```text
Select vehicle
      ↓
Find a catalog part or create a custom request
      ↓
Verified vendors submit sealed offers
      ↓
Compare price, condition, warranty, location, and rating
      ↓
Pay the selected order
      ↓
Courier pickup with photos and tamper-seal evidence
      ↓
Physical inspection at delivery
      ↓
Buyer confirms with a private 4-digit PIN
      ↓
Vendor payout and audit trail
```

The PIN is intentionally released only after physical inspection. If the part is wrong or defective, the buyer can open a dispute for administrator review instead of releasing the payout.

## Current implementation

### Implemented in this repository

- TypeScript backend project with strict compiler settings.
- Express middleware foundation with structured logging and consistent error responses.
- Zod-based environment validation.
- Shared automotive domain enums for categories, conditions, market areas, urgency, manufacturers, and voltage systems.
- Validated schemas for parts-feed items, vehicle compatibility, electrical specifications, and saved garage vehicles.
- Decimal.js-based ETB financial calculations with configurable commission and minimum platform fee.
- Unit tests for money calculations and electrical domain schemas.
- Visual catalog assets for common Toyota, BYD, Hyundai, electrical, drivetrain, braking, suspension, and EV parts.
- Product, business-logic, and catalog documentation for the planned MVP.

### Planned MVP milestones

- [ ] PostgreSQL and Prisma data model.
- [ ] Phone/OTP authentication and role-based access.
- [ ] Public vehicle-first storefront and catalog search.
- [ ] Buyer requests, vendor sealed bids, and bid comparison.
- [ ] Order state machine and escrow workflow.
- [ ] Chapa payment adapter with server-side verification.
- [ ] Courier pickup/delivery evidence and PIN confirmation.
- [ ] Dispute management and manual administrator payouts.
- [ ] Vendor Telegram notifications and real-time web updates.
- [ ] Amharic and English user experience.

The checklist is deliberately transparent: documented architecture and planned features are not presented as completed production functionality.

## Repository structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/          Environment validation
│   │   ├── lib/             Logger and infrastructure helpers
│   │   ├── middlewares/     Express error handling
│   │   └── shared/          Enums, schemas, and money utilities
│   ├── package.json
│   └── pnpm-lock.yaml
├── frontend/
│   └── public/images/catalog/  Seed visual catalog assets
├── docs/
│   ├── BUSINESS_LOGIC.md
│   ├── PARTS_VISUAL_CATALOG.md
│   └── STOREFRONT_AND_CATALOG.md
├── docker-compose.yml        PostgreSQL and Redis for local development
├── .env.example
└── PROJECT_CONTEXT.md        Product requirements and engineering rules
```

## Technology choices

| Area | Choice | Reason |
| --- | --- | --- |
| Backend | Node.js, Express, TypeScript | Familiar, strongly typed API foundation |
| Validation | Zod | Runtime validation at system boundaries |
| Money | Decimal.js | Prevents floating-point rounding errors in ETB calculations |
| Database | PostgreSQL 16 | Relational consistency for orders, payments, and audit records |
| Cache/jobs | Redis 7 | Planned support for queues, timeouts, and notifications |
| Frontend direction | Next.js, Tailwind CSS | Planned storefront and role-based portals |
| Testing | Vitest | Fast unit and integration-test workflow |
| Local infrastructure | Docker Compose | Reproducible PostgreSQL and Redis services |

## Getting started

### Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- Docker and Docker Compose

### Install backend dependencies

```bash
cd backend
pnpm install
```

### Configure environment

From the repository root:

```bash
cp .env.example .env
```

Replace the example database URL and development secrets with valid local values. Never commit `.env` or real credentials.

### Start local infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` and Redis on `localhost:6379`.

### Run verification

```bash
cd backend
pnpm typecheck
pnpm test
pnpm lint
```

The backend API and full storefront are under active development; do not assume that every planned route is available yet.

## Financial integrity

Money is never handled as a JavaScript floating-point value. TeraSync uses Decimal.js and calculates:

```text
total charged = item price + delivery fee
commission    = max(round(item price × commission rate, 2), minimum platform fee)
vendor payout = item price − commission
```

Calculating the payout by subtraction ensures that commission plus payout always equals the item price after rounding. These rules are covered by tests in `backend/src/shared/__tests__/`.

## Trust and safety design

The planned order flow is designed around the risks of spare-parts commerce:

- vendors submit sealed bids so competitors cannot copy prices;
- part condition and warranty are part of the offer;
- pickup and delivery photos provide evidence;
- a tamper-seal code helps detect swaps;
- the buyer's PIN is derived with HMAC and is never stored in plain text;
- PIN attempts are rate-limited and can be locked for administrator review;
- payment webhooks are verified and processed idempotently; and
- disputes, payouts, and state changes are recorded in an append-only audit trail.

Payment custody, automatic payouts, and production provider integrations still require validation with licensed partners and official provider documentation before launch.

## Documentation

- [Business logic and marketplace rules](docs/BUSINESS_LOGIC.md)
- [Storefront and catalog specification](docs/STOREFRONT_AND_CATALOG.md)
- [Visual catalog and identification guide](docs/PARTS_VISUAL_CATALOG.md)
- [Full project context and engineering constraints](PROJECT_CONTEXT.md)

## Academic and social impact

TeraSync demonstrates how a software system can model a real local commerce problem instead of copying a generic e-commerce flow. The project brings together:

- requirements analysis grounded in local market behavior;
- domain modeling for buyers, vendors, couriers, and administrators;
- secure payment and delivery-state design;
- financial correctness and automated testing;
- multilingual and low-bandwidth UX considerations; and
- an extensible foundation for future mobile, SMS, Telegram, and USSD channels.

## Contributing

1. Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) before changing product behavior.
2. Keep changes focused and use Conventional Commit prefixes such as `feat:`, `fix:`, `test:`, and `docs:`.
3. Add tests for business rules, especially money, authentication, state transitions, and dispute outcomes.
4. Run type-checking, tests, and linting before opening a pull request.
5. Never commit secrets, real customer data, or unverified third-party API assumptions.

## License

No license has been selected yet. Until a license is added to this repository, all rights are reserved.
