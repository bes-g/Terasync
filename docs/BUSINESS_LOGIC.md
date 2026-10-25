# TeraSync: Business Logic Specification

> Detailed rules for every part of the system. `PROJECT_CONTEXT.md` is the overview; this file is the detail. If the two ever conflict, STOP and ask which one is right. Do not guess.
>
> All numbers marked "(default)" are starting guesses. They must live in an admin-editable config table (section 17), never hard-coded.

---

## 1. Accounts and access

Authentication is email + password + 6-digit email verification code sent via SMTP (or console provider in non-production environments).
- **Identity:** Email address (normalized to lowercase, unique index).
- **Passwords:** Minimum 8 characters, at least 1 letter and 1 number, hashed with Argon2id / bcrypt (cost 12+), common dictionary password rejection.
- **Verification & 2FA Codes:** 6-digit cryptographically secure codes (single-use, hashed at rest, 10-minute expiry, max 5 attempts, 60s resend cooldown, max 5 resends/hr) with separate purposes (`VERIFY_EMAIL`, `LOGIN`, `RESET_PASSWORD`).
- **Phone Number:** Optional profile field (not the login identity). Required later during profile onboarding for courier dispatch / delivery contact and the 4-digit physical inspection escrow PIN.
- **Trusted Devices:** Optional 30-day trusted device cookie token (stored hashed) that skips the login code on recognized devices.
- **Roles:** BUYER, VENDOR, COURIER, ADMIN (ADMIN is created only via seed credentials from env and cannot self-register).
- **Statuses & Activation:**
  - `BUYER`: Status becomes `ACTIVE` immediately upon email verification.
  - `VENDOR` and `COURIER`: Status remains `PENDING_APPROVAL` after email verification until an administrator reviews and approves their business/vehicle credentials.
  - Unverified users cannot sign in.
- **Security & Privacy:** No account enumeration (signup, login, and forgot-password responses do not reveal account existence; timing parity maintained via dummy hash comparison on unknown emails). Rate limits: 5 failed logins per 15 minutes per email/IP triggers a 15-minute lockout.

---

## 2. Part request logic

**Catalog Part vs. Custom Request:**
- **Catalog Part Request (`isCustomRequest: false`):** Buyer selects a known part from the catalog for their vehicle. `vehicleVariantId` (required UUID), `catalogPartId` (required UUID), and `categoryId` (derived from the catalog part) are populated. Title, make, model, and year are auto-populated from catalog metadata. Optional: photos of old part/label, notes, VIN.
- **Custom Request (`isCustomRequest: true`):** Used when a part is not yet cataloged. `vehicleVariantId` (required UUID) or vehicle details (make, model, year), `catalogPartId` is null, `categoryId` (required UUID from catalog categories), `title` (5 to 120 characters), `description` (10 to 1000 characters), and at least 1 photo of the old part or nameplate are required.

**Required fields for all requests:** vehicle (`vehicleVariantId` or make/model/year), `categoryId`, urgency (`CRITICAL_SAME_DAY`, `STANDARD_24H`), sizeClass (`SMALL`, `MEDIUM`, `LARGE`), delivery location (address text plus latitude and longitude, or a pinned landmark), on-site contact name and phone.

**Optional but encouraged:** VIN or chassis number, plate number, engine model, part number (from the old part), preferred market area (or ANY). The more identifiers given, the higher the fitment confidence shown to vendors.

**Validation and limits:**
- Images: client compresses to max 1280px WebP under 200KB; server rejects anything over 500KB or not an image, and strips EXIF.
- A buyer can have at most 5 open requests (OPEN or BIDDING) at once (default).
- Duplicate guard: same buyer, same vehicle and similar title within 1 hour is rejected with a clear message.
- Phone numbers or contact details typed into title or description are masked (anti-bypass).

**Expiry:** CRITICAL_SAME_DAY expires after 6 hours, STANDARD_24H after 48 hours (defaults). The buyer can extend once. Buyer is notified 2 hours before expiry.

**Editing:**
- While OPEN (no bids yet): buyer can edit anything.
- After the first bid: buyer can only ADD notes and photos (vendors are notified). Core fields (vehicle, part) are locked because vendors already priced them.
- Cancel allowed until MATCHED. After MATCHED, the order cancellation rules (section 8) apply.

**Category mapping:** request category (`categoryId`) and vehicle brand/model decide which vendors match. Free-text category is deprecated in favor of structured `PartCategory`.

---

## 3. Vendor matching and notification

**Eligible vendor criteria:**
1. Status is `ACTIVE` and `isVerifiedMerchant` is true.
2. **Brand filter:** Vendor's `supportedBrands` contains the vehicle brand (or list is empty, matching all brands).
3. **Model filter:** If vendor specified `supportedModels`, it must contain the vehicle model (if empty, matches all models of that brand).
4. **Category filter:** If vendor specified `partCategoryIds`, it must contain the request's `categoryId` (if empty, matches all categories).
5. **Market area filter:** Vendor's market area matches the buyer's preference (or buyer selected ANY).

**Notification waves** (avoid spamming everyone at once):
1. Wave 1, immediately: top 10 eligible vendors ranked by rating, response speed, and low dispute rate.
2. Wave 2, after 5 minutes if fewer than 3 bids: next 20 vendors.
3. Wave 3, after 15 minutes if still fewer than 3 bids: all remaining eligible vendors.
(CRITICAL_SAME_DAY: skip waves, notify all eligible immediately.)

**Channels:** Telegram first (free), web socket if online, SMS only for CRITICAL_SAME_DAY or vendors without Telegram. Quiet hours (22:00 to 06:00, Africa/Addis_Ababa): no SMS and silent Telegram, except CRITICAL.

**Limits:** max 30 request notifications per vendor per hour (default). A vendor is never notified twice for the same request.

---

## 4. Bid logic

**Who can bid:** an eligible vendor, once per request. Request must be OPEN or BIDDING and not expired.

**Rapid Shop Response (`AVAILABLE` vs `NOT_AVAILABLE`):**
- **AVAILABLE:** Opens rapid quote drawer (target <30 seconds):
  - `priceBirr` greater than 0 and at most 10,000,000 (required).
  - `condition` required (GENUINE_NEW, OEM_NEW, USED_ORIGINAL, AFTERMARKET_CLONE).
  - `warrantyDays` 0 to 365 (default 30).
  - At least 1 live proof photo of the actual part on the shelf (required).
  - Optional shop notes (e.g., "genuine Bosch in sealed box", max 500 chars).
  - Submitting creates a sealed `Bid`.
- **NOT_AVAILABLE:** One-tap action:
  - Records a `ShopAvailabilityResponse` (`NOT_AVAILABLE`).
  - Request is dismissed from the shop's incoming feed.
  - Increments the customer's live aggregate counter ("12 shops checked, 4 have it").
  - Prevents re-notifying the shop for this request.

**Sealed bidding:** vendors never see other vendors' bids, prices, or how many bids exist (they only see "bids are open").

**Revisions:** a vendor can revise a pending bid up to 3 times. Every revision is saved (BidRevision) and the buyer is told "price updated". Withdrawing before acceptance is allowed; more than 3 withdrawals in 7 days is flagged for admin.

**What the buyer sees per bid:** price, condition (with a clear label and warning for USED_ORIGINAL and AFTERMARKET_CLONE), warranty days, proof photos, shop name, market area, rating, completed sales count, dispute rate, distance. Phone number and exact address stay hidden until payment is confirmed.

**Comparison sorting:** price, distance, condition, rating, warranty. Badges: LOWEST_PRICE, BEST_RATED, NEAREST, LONGEST_WARRANTY.

**Accepting a bid (one transaction):**
1. Lock the request row. Request must be OPEN or BIDDING and not expired.
2. Bid must be PENDING, not expired, and the vendor still ACTIVE.
3. Create the Order in AWAITING_PAYMENT with fees calculated (section 5).
4. Bid becomes ACCEPTED, all other pending bids become REJECTED (vendors notified), request becomes MATCHED.
5. Write audit entries.

---

## 5. Order creation and delivery fee

**Delivery fee:** looked up from admin-managed `DeliveryFeeRule` (from market area, to sub-city or zone, vehicle type, fee in ETB). The vehicle type is derived from sizeClass (SMALL = MOTORCYCLE, MEDIUM = PICKUP, LARGE = VAN). If no rule matches, use the default fee for that vehicle type. The fee is shown to the buyer BEFORE payment and frozen on the order.

**Totals:** `totalChargedBirr = itemPriceBirr + deliveryFeeBirr`. Commission and payout follow PROJECT_CONTEXT.md section 7 (5%, minimum platform fee, payout = item minus commission).

**Order number:** `TR-YYYY-NNNN` from a database sequence (gaps are fine, duplicates are not).

**High-value orders** (item price above the configured threshold): require a verified vendor ID, a PICKUP or VAN courier, and a video or extra photos at pickup.

---

## 6. Payment logic

**Starting a payment:**
1. Generate our own unique `paymentReference` and store it on the order BEFORE sending the buyer to the gateway.
2. Create the checkout session with amount `totalChargedBirr`, currency ETB, our reference, and callback and return URLs.
3. Payment window: 15 minutes. After that the order becomes PAYMENT_EXPIRED, the accepted bid returns to PENDING, and the request returns to BIDDING (if it has not expired).

**Handling the gateway webhook (strict order):**
1. Verify the signature. If invalid, reject with 401 and log it.
2. Insert a WebhookEvent (unique on provider plus reference). If it already exists, return 200 and do nothing (duplicate).
3. Call the gateway's verify endpoint. Never trust the webhook body alone.
4. Check status is success, amount equals `totalChargedBirr`, currency is ETB, and the reference belongs to an order in AWAITING_PAYMENT.
5. If everything matches, run `lockFunds` in a transaction (order becomes ESCROW_LOCKED, audit entry written, notifications sent).

**Problem cases:**
- Amount mismatch: do NOT lock. Record it and alert admin.
- Payment arrives after PAYMENT_EXPIRED: put it in the admin refund queue (late payment).
- Webhook arrives before the order exists or for an unknown reference: store it, return 200, alert admin.
- The return page after payment only polls our order status. It never trusts the redirect.

**Gateway fees:** the platform absorbs gateway fees out of its commission (default; revisit with real numbers).

**Refunds:** MVP is manual. Admin sends the refund and marks the `Refund` record SENT with a reference. Automatic gateway refunds come later.

---

## 7. Escrow (ledger view)

Escrow is an internal state plus ledger entries per order. Money states: HELD, RELEASED_TO_VENDOR, REFUNDED_TO_BUYER, PAID_TO_COURIER, KEPT_AS_COMMISSION.

**Invariants (must be tested):**
- On ESCROW_LOCKED, held amount equals `totalChargedBirr`.
- At settlement, all entries sum exactly to `totalChargedBirr`. No rounding drift.
- Release or refund can happen only once per order (second attempt is a no-op or a typed error).
- Release is only possible from DELIVERED_PENDING_CONFIRMATION with a valid PIN (or an admin ruling from DISPUTED).

**Settlement on COMPLETED:**
- Vendor payout = item price minus commission (Payout, recipient VENDOR).
- Courier payout = full delivery fee (Payout, recipient COURIER) in the MVP.
- Platform keeps the commission.

**Settlement on dispute:** follow the fault-based refund rules in PROJECT_CONTEXT.md section 7.

Payouts in the MVP are manual: admin pays by Telebirr or bank and marks SENT with a reference.

---

## 8. Delivery and courier logic

**DeliveryJob** is created when the order becomes ESCROW_LOCKED. Statuses: OFFERED, ACCEPTED, PICKED_UP, ARRIVED, DONE, RETURNING, RETURNED, CANCELLED.

**Assignment:**
- Offer the job to the nearest 5 ACTIVE couriers with the right vehicle type. Each has a 2-minute window to accept; first to accept wins (row lock so two couriers cannot both win).
- If nobody accepts, offer the next 5. After 15 minutes with no courier, alert admin.

**Pickup (order becomes IN_TRANSIT only when ALL are true):**
1. Vendor confirms handover in the app.
2. Courier submits a photo of the part and a photo of the tamper seal, and enters the seal code.
3. Courier GPS is recorded.
If the vendor is not ready within 10 minutes, the courier can report "vendor not ready" and admin is alerted. Vendor pickup deadline is 2 hours (escalate to admin).

**In transit:** courier location is recorded every 30 seconds ONLY while a job is active (privacy).

**Arrival (DELIVERED_PENDING_CONFIRMATION):** courier taps "arrived" with a photo. GPS far from the delivery point (over 500 metres) shows a warning but does not block (GPS is unreliable in Addis). The inspection timer starts.

**Inspection:** reminders to the buyer at 30 minutes; escalate to admin at 2 hours. Never auto-release and never auto-refund. The buyer must check that the seal code matches, the part matches the old part (bolt pattern, spline count, port alignment), and the condition matches the bid.

**Approve:** buyer tells the PIN to the courier, who enters it (PIN rules in PROJECT_CONTEXT.md section 8). Success makes the order COMPLETED.

**Reject:** buyer picks a reason (WRONG_FITMENT, DEFECTIVE, NOT_AS_DESCRIBED, SEAL_BROKEN_OR_MISMATCH, OTHER) and uploads at least 2 photos. The order becomes DISPUTED. The courier re-seals the part with a new seal code (photo + code) and returns it. The vendor confirms receipt of the returned part with photos.

**Cancellation rules:**
| When | Who | Result |
|------|-----|--------|
| Before payment | Buyer | free |
| After ESCROW_LOCKED, before a courier accepts | Buyer | full refund |
| After a courier accepted, before pickup | Buyer | refund minus the courier dispatch fee (default) |
| After pickup | Buyer | not allowed; use the rejection flow at delivery |
| Any time before pickup | Vendor cannot fulfil | full refund, vendor strike |
| Courier no-show or courier cancels | Courier | job re-offered; repeated no-shows flagged |

---

## 9. Dispute resolution

- A dispute is created automatically when the buyer rejects a part. Status: OPEN, then RETURNING (while the part travels back), then RESOLVED.
- When the part is back, the vendor sees the reason and photos and can either **accept responsibility** (fast path, VENDOR_FAULT) or **contest within 24 hours**.
- Admin reviews all evidence: request, bid description and proof photos, pickup and seal photos, delivery photos, rejection photos, return photos, courier GPS trail, notes.
- Admin chooses a fault (VENDOR_FAULT, BUYER_FAULT, COURIER_FAULT, NO_FAULT_FITMENT). The system computes the refund split using the fault rules. Admin may override amounts but MUST write a reason. Everything is audit-logged. Target resolution time: 48 hours.
- Two admins cannot resolve the same dispute at once (row lock plus version check).
- **Consequences:** VENDOR_FAULT gives a strike (3 strikes in 30 days triggers suspension review). Confirmed counterfeit means immediate suspension. 3 BUYER_FAULT disputes in 60 days flags the buyer (extra verification). COURIER_FAULT gives the courier a strike.
- Appeals to a second admin: LATER phase.

---

## 10. Ratings and reputation

- Only the buyer of a COMPLETED order can rate: vendor 1 to 5 stars with tags (FITS_PERFECTLY, GENUINE, FAST, AS_DESCRIBED), courier 1 to 5 optional. One rating per order. No order, no rating.
- Displayed vendor rating uses a Bayesian average so new vendors are not shown as perfect: `(5 * 3.5 + sumOfStars) / (5 + numberOfRatings)` (default prior).
- Vendor scorecard fields: average response time to requests, dispute rate (VENDOR_FAULT disputes divided by completed orders over 90 days), counterfeit report count, completed sales.

---

## 11. Notification matrix

| Event | Recipient | Channels |
|-------|-----------|----------|
| New matching request | Vendors | Telegram, web, SMS (critical only) |
| First bid / new bid / bid revised | Buyer | web, Telegram if linked |
| Request expiring in 2h | Buyer | web, SMS |
| Bid accepted | Winning vendor | Telegram, web, SMS |
| Bid not chosen | Other vendors | Telegram, web |
| Payment confirmed | Buyer, vendor ("prepare the part") | SMS, Telegram, web |
| Payment expired | Buyer | web, SMS |
| Courier assigned | Buyer, vendor | web, Telegram |
| Picked up | Buyer | web, Telegram |
| Courier arrived (inspect now) | Buyer | SMS, web |
| PIN | Buyer | SMS, web |
| Part rejected / dispute opened | Vendor, admin | Telegram, web |
| Dispute resolved | Buyer, vendor | SMS, Telegram, web |
| Refund sent / payout sent | Buyer / vendor, courier | SMS, Telegram, web |
| Stuck order, late payment, amount mismatch, PIN lockout | Admin | web, Telegram |

Messages are sent in the user's preferred language (AM, EN, OM) from templates. SMS is reserved for money and delivery critical moments to keep costs down.

---

## 12. Background jobs (BullMQ)

| Job | Runs | Does |
|-----|------|------|
| expire-requests | every minute | OPEN or BIDDING past `expiresAt` become EXPIRED; pending bids EXPIRED |
| expire-bids | every minute | bids past their expiry become EXPIRED |
| expire-payments | every minute | AWAITING_PAYMENT older than 15 min becomes PAYMENT_EXPIRED |
| notification-waves | delayed jobs | send wave 2 and wave 3 if bids are below 3 |
| courier-offer-waves | delayed jobs | offer to the next couriers after 2 minutes |
| stuck-orders | every 5 minutes | flag orders past pickup, delivery or inspection deadlines and alert admin |
| expiry-reminders | every 10 minutes | warn buyers 2 hours before expiry |
| audit-verify | nightly | verify the AuditLog hash chain and alert on any break |

All jobs must be idempotent (safe to run twice) and use job IDs to avoid duplicates.

---

## 13. Admin workflows

- **Vendor approval queue:** review shop name, TIN, market area, categories, photos; approve, reject with reason, or request more info.
- **Courier approval queue:** ID, license plate, vehicle type.
- **Dispute queue:** with all evidence in one screen and a refund calculator.
- **Stuck orders queue:** every order past a deadline, with one-click contact buttons.
- **Payout and refund queues:** list pending, mark SENT with reference, export CSV.
- **PIN reset:** only admin, requires a written reason, audit-logged.
- **User management:** suspend and reactivate with reason.
- **Config editor:** commission rate, fees, timeouts, thresholds. Every change is audit-logged.
- **Audit log viewer:** with a "verify chain" button.
- **Metrics:** requests per day, average time to first bid, bids per request, request-to-order conversion, completion rate, dispute rate, total order value, active vendors and couriers.

---

## 14. Fraud and abuse rules (flags shown to admin)

- A buyer who rejects 3 or more orders in a row, or whose rejections are mostly by one courier.
- A courier whose deliveries get rejected much more often than average.
- A vendor with repeated withdrawals, late handovers, or counterfeit reports.
- Same phone or device creating many accounts.
- Bid photos reused across different requests (image hash check, LATER).
- Contact details typed into requests, bids or notes.
- Unusual order sizes (very high value, or many orders in a short time from a new account).

---

## 15. API surface (by module)

- **auth:** request OTP, verify OTP, refresh token, logout, me
- **catalog (public):** list brands, get brand models, list model variants, get variant category tree, get category parts for variant, get part details with fitment notes, search parts (fuzzy trigram on names, OEM numbers, synonyms filtered by vehicle variant)
- **garage (buyer auth):** list saved vehicles, save vehicle (`vehicleVariantId`, nickname, plate), set default vehicle, delete saved vehicle
- **users:** update profile, set language, link Telegram (one-time code)
- **requests:** create (catalog part or custom), list own, list for vendor (matching), get, edit, add notes or photos, cancel, extend
- **bids:** respond availability (`AVAILABLE` with quote or `NOT_AVAILABLE`), revise, withdraw, list for a request (buyer), list own (vendor), accept (buyer)
- **orders:** get, list own, cancel (rules in section 8), get PIN (buyer only)
- **payments:** start checkout, webhook (public, signature-verified), status
- **delivery:** list and accept jobs, confirm pickup, update location, confirm arrival, submit PIN, start return, confirm return
- **disputes:** create (via rejection), get, vendor respond
- **ratings:** create
- **notifications:** list, mark read
- **admin:** catalog CRUD (brands, models, variants, categories, parts, fitments), bulk CSV import (`/admin/catalog/import/csv`), banners CRUD, approvals, disputes, stuck orders, payouts, refunds, PIN reset, users, config, audit, metrics

---

## 16. Edge case catalogue (what happens if...)

- **Vendor ghosts after payment:** pickup deadline passes, admin alerted, full refund, vendor strike.
- **Buyer ghosts after delivery:** reminders at 30 minutes, escalation at 2 hours, admin contacts the buyer. No auto-release.
- **Courier no-show:** job re-offered; admin alerted after 15 minutes without a courier.
- **Part lost or damaged in transit:** funds stay HELD, admin refunds the buyer; vendor and courier cases handled manually (insurance is LATER).
- **Buyer cancels during payment:** order stays AWAITING_PAYMENT until it expires; a late payment goes to the admin refund queue.
- **Vendor bids on an expired or matched request:** rejected with a typed error.
- **Request edited while bids are coming in:** core fields are locked after the first bid.
- **Two couriers accept at once:** row lock decides; the second gets a typed error.
- **Buyer changes phone number:** requires OTP on the new number; open orders keep the old SMS number until confirmed.
- **PIN locked after 3 failures:** order locked, admin alerted, reset only by admin with a reason.
- **Courier loses internet at the garage:** PIN is queued locally and sent when back online; funds release only on server verification.
- **Part too large for the assigned vehicle:** courier reports it; admin reassigns a bigger vehicle at no extra cost to the buyer (default).
- **Gateway outage:** buyer sees "payment unavailable, try later"; request stays alive until it expires.

---

## 17. Configurable defaults (admin-editable `AdminConfig`)

| Key | Default |
|-----|---------|
| commissionRate | 0.05 |
| minPlatformFeeBirr | 20 |
| requestExpiryStandardHours | 48 |
| requestExpiryCriticalHours | 6 |
| maxOpenRequestsPerBuyer | 5 |
| maxBidRevisions | 3 |
| paymentWindowMinutes | 15 |
| pickupDeadlineHours | 2 |
| courierOfferWindowMinutes | 2 |
| inspectionReminderMinutes | 30 |
| escalateAfterHours | 2 |
| highValueThresholdBirr | 50000 |
| vendorStrikeLimit30Days | 3 |
| ratingPriorWeight / ratingPriorMean | 5 / 3.5 |

---

## 18. Data model additions (on top of PROJECT_CONTEXT.md section 9)

**New entities:**
- **DeliveryJob:** orderId, courierId?, status, offeredTo[], acceptedAt, pickedUpAt, arrivedAt, doneAt, returnedAt, pickupPhotos[], pickupSealCode, deliveryPhotos[], returnSealCode, returnPhotos[], gps trail reference
- **CourierLocation:** courierId, jobId, lat, lng, recordedAt
- **DeliveryFeeRule:** fromMarketArea, toZone, vehicleType, feeBirr
- **BidRevision:** bidId, oldPrice, newPrice, changedAt
- **Rating:** orderId (unique), raterId, vendorStars, courierStars?, tags[], comment
- **Refund:** orderId, buyerId, amountBirr, status (PENDING, SENT, FAILED), method, reference, sentByAdminId
- **AdminConfig:** key, value, updatedBy, updatedAt (changes also written to AuditLog)

**New fields:**
- PartRequest: sizeClass, deliveryAddress, deliveryLat, deliveryLng, onSiteContactName, onSiteContactPhone
- Order: deliveryAddress, deliveryLat, deliveryLng, inspectionStartedAt, rejectionReason, rejectionPhotos[]
- Payout: recipientType (VENDOR or COURIER), recipientId
- User: status, telegramChatId
- VendorProfile: strikeCount, avgResponseSeconds

---

## 19. Open questions that need real-world answers (not code)

1. **Legal:** can the platform hold customer funds, or must a licensed partner hold them? (National Bank of Ethiopia rules; consult a lawyer.)
2. **Couriers:** own employed riders, or freelancers? This decides insurance, pay, and trust.
3. **Delivery fees:** real prices per route; run a pilot to fill the fee table.
4. **Commission:** will vendors accept 5%? Test with the first 10 shops.
5. **Launch scope:** which single market (for example Teklehaymanot) and categories (for example Toyota and Isuzu) first.
6. **Chapa and SMS provider details:** need the official documentation before real integration.
