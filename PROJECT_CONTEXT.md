# TeraSync: Project Context

> READ THIS FILE FULLY BEFORE EVERY TASK. It is the single source of truth for what we are building and how.
>
> **Storefront, catalog and portals:** See [docs/STOREFRONT_AND_CATALOG.md](docs/STOREFRONT_AND_CATALOG.md).

---

## 0. Rules for the AI agent (how to work)

1. Do ONE roadmap task (one commit) at a time. Never build ahead. Never touch unrelated files.
2. Strict TypeScript. No `any`. No `// TODO`, no placeholder logic, no fake implementations.
3. Money is NEVER a JavaScript `number`. Use `decimal.js` in code and `Decimal(12,2)` in the database.
4. All business logic (fees, PIN, state transitions) must have unit tests.
5. Never invent third-party API details (Chapa, Telebirr, SMS providers, Telegram). If official docs are not provided, build a clean adapter interface plus a mock implementation, and clearly state what real documentation is needed.
6. Never commit secrets. Every env var must appear in `.env.example` and be validated with zod at startup.
7. After each task: (a) list files created or changed, (b) show the commands to run and verify, (c) run lint, typecheck and tests and show the results, (d) propose a Conventional Commit message, (e) STOP and wait for the next prompt.
8. If something in this file is contradictory or missing, ask a question instead of guessing.

---

## 1. What TeraSync is

TeraSync is a reverse-RFQ (request for quote) marketplace with escrow settlement for automotive and industrial spare parts in Addis Ababa, Ethiopia.

Instead of a mechanic walking for hours between shops in Teklehaymanot, Kera, Somali Tera or Akaki, the mechanic posts what they need. Verified shops in the right market bid in seconds. The buyer picks a bid and pays into escrow. A courier delivers the part. The buyer inspects it physically. Only when the buyer gives a secret 4-digit PIN to the courier is the vendor paid.

## 2. The problem (Ethiopian reality)

- Informal merchants have no digital inventory or barcodes, so normal e-commerce does not work.
- Buyers lose hours walking between shops, carrying the broken part, dealing with street brokers (delalas) and price gouging.
- Counterfeits are common: used parts sold as new, clones sold at original prices.
- Trust is broken both ways: sellers want cash upfront, buyers fear receiving wrong or defective parts with no recourse.
- Wrong fitment (bolt pattern, spline count, port alignment) is the most common failure, so the system must help prevent it.

## 3. Roles

| Role | Who | Main actions |
|------|-----|--------------|
| BUYER | Mechanics, vehicle owners, fleet managers, factory technicians | Post requests, compare bids, pay, inspect, give PIN |
| VENDOR | Shop owners, importers, scrap dealers | Receive requests, bid, hand over part, get paid |
| COURIER | Motorcycle, pickup, van riders | Pick up, deliver, enter PIN |
| ADMIN | Operators, dispute arbiters | Verify vendors, resolve disputes, manual payouts |

## 4. Core flow

1. Buyer selects their vehicle and picks a part from the catalog (or submits a custom request with `isCustomRequest: true` if unlisted), providing delivery location, urgency, and optional photos of the old part or VIN.
2. System finds matching vendors (by category and market area) and notifies them via web, Telegram, and SMS.
3. Vendors place sealed bids (price in ETB, condition, warranty days, live photo of the part on their shelf). Vendors cannot see each other's bids.
4. Buyer compares bids (price, distance, condition, rating) and accepts one. Other bids are auto-rejected.
5. An Order is created in AWAITING_PAYMENT. Buyer pays (item price + delivery fee) through Chapa (which supports Telebirr as a payment method; verify in the docs).
6. Payment is verified server-side. Order becomes ESCROW_LOCKED. Buyer's 4-digit PIN becomes available. Vendor is told to prepare the part.
7. Courier arrives at the vendor, photographs the part and a numbered tamper seal, and marks pickup. Order becomes IN_TRANSIT.
8. Courier arrives at the garage. Order becomes DELIVERED_PENDING_CONFIRMATION. The buyer physically inspects the part and checks that the seal matches.
9. Happy path: buyer tells the PIN to the courier. Courier enters it. Server verifies. Commission is kept, vendor payout is created. Order is COMPLETED.
10. Unhappy path: buyer rejects. Courier returns the part. Order is DISPUTED. Admin decides fault and refund split. Order ends REFUNDED (or COMPLETED if the admin rules for the vendor).

## 5. State machines

Every transition must run inside `prisma.$transaction` with a row lock (`SELECT ... FOR UPDATE`), validate the allowed-transition table, and write an AuditLog entry. Illegal transitions throw a typed error.

### PartRequest
| From | To | Trigger |
|------|----|---------|
| OPEN | BIDDING | first bid placed |
| OPEN, BIDDING | MATCHED | buyer accepts a bid |
| OPEN, BIDDING | EXPIRED | timer (defaults below) |
| OPEN, BIDDING | CANCELLED | buyer withdraws |
| MATCHED | BIDDING | order payment expired (request still alive) |

### Bid
PENDING -> ACCEPTED | REJECTED | EXPIRED | WITHDRAWN (vendor withdraws before acceptance)

### Order
| From | To | Trigger |
|------|----|---------|
| AWAITING_PAYMENT | ESCROW_LOCKED | payment verified |
| AWAITING_PAYMENT | PAYMENT_EXPIRED | payment window passed |
| ESCROW_LOCKED | IN_TRANSIT | courier confirms pickup (photo + seal code) |
| ESCROW_LOCKED | REFUNDED | vendor cannot fulfil, full refund (admin or timeout) |
| IN_TRANSIT | DELIVERED_PENDING_CONFIRMATION | courier arrives |
| DELIVERED_PENDING_CONFIRMATION | COMPLETED | correct PIN |
| DELIVERED_PENDING_CONFIRMATION | DISPUTED | buyer rejects part |
| DISPUTED | REFUNDED | admin rules for buyer |
| DISPUTED | COMPLETED | admin rules for vendor |

## 6. Enums

- PartCondition: GENUINE_NEW, OEM_NEW, USED_ORIGINAL, AFTERMARKET_CLONE
- Urgency: CRITICAL_SAME_DAY, STANDARD_24H
- Language: AM, EN, OM
- VehicleType (courier): MOTORCYCLE, PICKUP, VAN
- PaymentGateway: TELEBIRR, CHAPA, CBE_BIRR
- VendorCategory: TOYOTA, ISUZU, SUSPENSION, HYDRAULICS, ELECTRICAL, INDUSTRIAL_TOOLS (extensible)
- MarketArea: TEKLEHAYMANOT, KERA, SOMALI_TERA, AKAKI, PIASSA, OTHER
- DisputeFault: VENDOR_FAULT, BUYER_FAULT, COURIER_FAULT, NO_FAULT_FITMENT

## 7. Money rules

- Buyer pays: `itemPriceBirr + deliveryFeeBirr`.
- `commissionBirr = round_half_up(itemPriceBirr * commissionRate, 2)`, default rate 0.05 (configurable).
- `payoutAmountBirr = itemPriceBirr - commissionBirr` (computed by subtraction so the numbers always sum exactly).
- Minimum platform fee per order (configurable) so cheap parts do not lose money after gateway and courier costs.
- Dispute refund depends on fault:
  - VENDOR_FAULT (wrong or defective part): buyer refunded in full (item + delivery); courier fees are charged to the vendor.
  - BUYER_FAULT (buyer ordered the wrong thing): buyer refunded item price minus outbound and return courier fees.
  - NO_FAULT_FITMENT: buyer refunded item price; courier fees are paid from the delivery fee.
  - COURIER_FAULT: handled case by case by admin.
- All amounts are stored with 2 decimals. Shared money helpers live in `backend/src/shared` and are fully tested.

## 8. PIN handshake (core security feature)

- 4-digit PIN. It is derived, not stored: `pin = truncate(HMAC_SHA256(PIN_HMAC_SECRET, orderId + ":" + pinNonce)) mod 10000`, zero-padded. Only a random `pinNonce` is stored per order. The secret lives in env or a KMS, never in the database. This way a leaked database cannot reveal PINs, and the buyer's app can still display the PIN after a refresh.
- The buyer sees the PIN in the app and receives it by SMS. Banner: "Do NOT reveal this PIN until the mechanic has physically inspected and approved the part."
- Only the courier assigned to that order may submit a PIN.
- Compare with `crypto.timingSafeEqual`.
- Max 3 failed attempts, then lock the order (`pinLockedAt`) and alert admin. Only admin can reset.
- The PIN is never logged and never returned by any API except to the owning buyer.
- Release is atomic: the status change, payout record, commission and audit entry happen in one transaction. A second submission can never pay twice.

## 9. Data model (high level; the real Prisma schema comes in Commit 3)

- **User**: id (UUID), phoneNumber (E.164, unique), fullName, role, faydaId (optional, phase 2), languagePreference, isVerified, timestamps
- **OtpCode**: phone, codeHash, expiresAt, attempts, consumedAt
- **RefreshToken**: userId, tokenHash, expiresAt, revokedAt
- **VendorProfile**: userId, shopName, marketArea, tinNumber, categories[], supportedBrands[], supportedModels[], partCategoryIds[], rating, totalSalesCount, isVerifiedMerchant, plus scorecard fields (avgResponseSeconds, disputeCount, counterfeitReportCount)
- **CourierProfile**: userId, vehicleType, licensePlate, isActive, currentLocationLat/Lng
- **PartRequest**: buyerId, vehicleVariantId?, catalogPartId?, categoryId?, isCustomRequest (default false), title, category, make, model, year, engineModel, vinOrChassisNumber, plateNumber, partNumber (optional), description, images[], urgency, marketLocationPreference, status, expiresAt, timestamps
- **Bid**: requestId, vendorId, priceBirr, condition, warrantyDays, proofImages[], status, notes, expiresAt, timestamps
- **Order**: orderNumber (e.g. TR-2026-0081), requestId (unique), bidId (unique), buyerId, vendorId, courierId?, itemPriceBirr, deliveryFeeBirr, totalChargedBirr, commissionRate, commissionBirr, payoutAmountBirr, pinNonce, pinAttempts, pinLockedAt, sealCode, pickupPhotos[], deliveryPhotos[], status, paymentGateway, paymentReference (unique), escrowLockedAt, completedAt, timestamps
- **WebhookEvent**: provider, externalEventId or paymentReference (unique), payload, signatureValid, processedAt (idempotency store)
- **Payout**: orderId, vendorId, amountBirr, method, status (PENDING, SENT, FAILED), reference, sentByAdminId
- **DisputeLog**: orderId, raisedBy, reason, fault, status (OPEN, RETURNING, RESOLVED), photoEvidence[], resolutionNotes, refundBuyerBirr, courierFeeBirr, resolvedByAdminId, createdAt
- **AuditLog**: append-only, hash-chained. Fields: id, orderId?, actorId, action, fromStatus, toStatus, amountDelta, metadata, prevHash, hash = SHA256(prevHash + canonical payload), createdAt. A database trigger blocks UPDATE and DELETE on this table.
- **Notification**: userId, channel (WEB, TELEGRAM, SMS), type, payload, status
- **VehicleBrand**: id, name, slug (unique), logoUrl?, countryOfOrigin, sortOrder, isActive, timestamps
- **VehicleModel**: id, brandId, name, slug, bodyType, sortOrder, isActive, timestamps
- **VehicleVariant**: id, modelId, name, slug, yearStart, yearEnd?, engineCode, fuelType (PETROL, DIESEL, ELECTRIC, HYBRID), transmission, driveType, powerHp?, batteryKwh?, sortOrder, isActive, timestamps
- **PartCategory**: id, parentId?, nameEn, nameAm, slug (unique), iconUrl?, sortOrder, isActive, timestamps
- **CatalogPart**: id, categoryId, nameEn, nameAm, slug, partNumberOem?, partNumberAliases[], descriptionEn?, descriptionAm?, diagramUrl?, technicalNotes?, isActive, timestamps
- **PartFitment**: id, catalogPartId, vehicleVariantId, position?, notes?, timestamps
- **Banner**: id, titleEn, titleAm?, subtitleEn?, subtitleAm?, imageUrl, targetUrl, activeFrom, activeTo, sortOrder, isActive, timestamps
- **SavedVehicle**: id, userId, vehicleVariantId, nickname?, plateNumber?, isDefault, timestamps

Indexes: by status, buyerId, vendorId, category, marketArea, expiresAt, paymentReference, brandId, modelId, vehicleVariantId, categoryId, catalogPartId.

## 10. Architecture

Two separate projects inside one repository folder. There is NO monorepo tooling and NO pnpm workspaces. Each project has its own package.json, node_modules, tsconfig and scripts, and is installed and run on its own.

```
terasync/
├─ backend/                   Node, Express, TypeScript, Prisma
│  ├─ prisma/                 schema, migrations, seed
│  ├─ src/
│  │  ├─ config/              env validation (zod)
│  │  ├─ middlewares/         auth, rbac, error handler, rate limit, idempotency
│  │  ├─ lib/                 logger, decimal, crypto, redis, storage
│  │  ├─ jobs/                BullMQ workers (expiry, timeouts)
│  │  ├─ shared/              enums, zod schemas, money helpers (the backend owns these)
│  │  └─ modules/
│  │     ├─ auth/ users/ requests/ bids/ orders/
│  │     ├─ payments/ escrow/ disputes/ couriers/
│  │     ├─ notifications/ telegram/ admin/
│  │     └─ (each module: routes, controller, service, repository, schemas)
│  └─ package.json, tsconfig.json, .env.example
├─ frontend/                  Next.js (App Router), Tailwind, shadcn/ui
│  └─ src/
│     └─ lib/shared/          copy of the enums and types the UI needs (kept in sync by hand or a small script)
├─ docs/
├─ docker-compose.yml         postgres 16, redis 7 (at the repo root)
├─ PROJECT_CONTEXT.md
└─ .gitignore, README.md
```

The frontend talks to the backend only through the HTTP API (and Socket.io). It never imports backend code.

Key choices:
- Storefront: Customers land on the public storefront (`/`) without logging in, select their vehicle, browse categories, and search parts. Authentication (phone + OTP) is prompted only when requesting offers or accessing authenticated buyer/vendor/courier/admin portals.
- Auth: phone number + OTP (SMS provider behind an interface, console mock in dev), JWT access + refresh tokens, role-based access control.
- Payments: `PaymentProvider` interface with a Chapa implementation. Always verify a payment by calling the gateway's verify endpoint, not by trusting the webhook alone. Check amount and currency. Idempotency via WebhookEvent plus unique paymentReference.
- Payouts: a `PayoutProvider` interface. MVP mode is MANUAL (admin sends the money and marks the payout SENT). Automatic payouts come later.
- Escrow: legal custody model is still to be confirmed with a lawyer and a licensed payment partner (National Bank of Ethiopia rules). The code treats escrow as an internal state machine, so the funding model can change without rewriting logic.
- Real-time: Socket.io for the web. Telegram (Telegraf) for vendors.
- Background jobs: BullMQ on Redis.
- Storage: S3-compatible interface; local disk adapter in dev.
- Testing: Vitest, Supertest, real Postgres in Docker for integration tests.
- i18n: Amharic and English from day one in the web app; Oromo later. Ethiopian Birr formatting.

## 11. Timeouts and background jobs (defaults, configurable)

- Request expiry: 48h standard; CRITICAL_SAME_DAY shorter (6h).
- Bid expiry: set by the vendor, default 2h for same-day requests.
- Payment window: 15 minutes, then PAYMENT_EXPIRED and the request goes back to BIDDING.
- Vendor pickup deadline after ESCROW_LOCKED: 2h, otherwise escalate to admin.
- DELIVERED_PENDING_CONFIRMATION: no response in 2h, escalate to admin (never auto-release and never auto-refund).

## 12. Security and edge cases

- **Buyer and courier collude to steal the part:** courier photographs the part and tamper seal at pickup, and again at delivery. Seal code must match. Buyer must submit inspection photos before rejecting. Repeated rejections by one buyer or courier raise a flag for admin.
- **Return-leg swap (good part swapped for a bad one):** vendor confirms the returned part against pickup photos and seal code before the dispute can close.
- **Vendor swaps a genuine part for a clone in the box:** seal plus photo evidence, vendor scorecard, counterfeit reports cause suspension. Bid photos must later be live-capture with a timestamp watermark.
- **Offline at the garage:** courier app queues `{orderId, pin, timestamp}` locally and retries. Funds release ONLY on server-side verification. An SMS fallback is planned for later.
- **Duplicate or late webhooks:** idempotency via WebhookEvent and the unique paymentReference. Verify by calling the gateway. Always return 200 to the gateway for already-processed events.
- **Disintermediation (buyer and vendor going around the platform):** phone numbers are hidden until ESCROW_LOCKED. Escrow protection, warranty tracking and repeat-order perks are the retention tools.
- **Abuse:** rate limits on OTP, PIN attempts, bids and request creation. Input validation with zod everywhere. Helmet, CORS allow-list, and structured logging that never prints secrets, PINs or full phone numbers.

## 13. MVP scope

IN: vehicle-first catalog and public storefront with seed data for BYD, Toyota, and Hyundai; phone OTP auth; catalog part requests and custom requests; sealed bids; order and payment (Chapa); escrow state machine; PIN handshake; courier flow; disputes with manual admin resolution; Telegram bot and rapid bidding for vendors; buyer web app; basic admin panel with catalog CRUD; manual payouts.

LATER: Fayda ID verification, Amharic voice-note requests, USSD/SMS channel, live-capture watermarked photos, courier batching across vendors, fitment and price database, vendor scorecards in the UI, insurance for high-value parts, automatic payouts, native mobile apps, Oromo.

## 14. Conventions

- Conventional Commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
- One roadmap task equals one commit (small follow-up fix commits are fine).
- Files: kebab-case. Types and classes: PascalCase. Variables and functions: camelCase. DB tables via Prisma `@@map` in snake_case.
- Every API response uses a consistent envelope and typed error codes.
- Repository folder: `terasync`, containing `backend/` and `frontend/`.

## 15. Commit roadmap

1. Backend scaffold, tooling, Docker (Postgres, Redis), health endpoint
2. Backend shared module: enums, zod schemas, money helpers (tested)
3. Prisma schema, migrations, audit-log trigger, seed data
4. Auth: phone OTP, JWT, RBAC, user, vendor and courier profiles
5. Part requests: create, list, cancel, image upload, expiry job
6. Bids: sealed bidding, vendor matching, notification service
7. Accept bid: order creation, order numbers, request and bid state changes
8. Payments: Chapa adapter, webhook, verification, idempotency
9. Escrow engine: lockFunds, derived PIN, verifyHandshakeAndRelease (heavily tested)
10. Courier flow: assignment, pickup with seal, delivery, PIN endpoint, offline queue support
11. Disputes and refunds, fault-based splits, admin endpoints, manual payouts
12. Telegram bot and SMS broadcast adapters
13. Frontend: foundation (create the Next.js app in frontend/ if it does not exist), auth, i18n, RFQ form with image compression
14. Web: bid comparison matrix and buyer order dashboard
15. Web / Telegram Mini-App: vendor bidding drawer and ledger
16. Web: courier mobile view
17. Web: admin panel
18. Hardening: rate limits, security tests, audit-chain verification, logging, deployment guide
