Epic: Cart & Checkout (with Account Requirement)
Goals

Require account creation to place orders.

Collect phone, email, and shipping address (plus any must-have delivery details).

Accept payments via Stripe (Cards) + Apple Pay + Google Pay using Stripe’s Payment Element / Payment Request Button.

Generate reliable orders, handle stock, and send confirmations.

User Stories (with Acceptance Criteria)
1) Add to Cart

As a shopper
I want to add products/variants to a cart
So that I can review and purchase later

Acceptance Criteria

Given a product with selectable variant (size/finish), when I click “Add to Cart”, then the cart updates with {productId, variantId, qty, unitPrice, priceSnapshotAtAdd}.

If the item already exists, quantity increments (configurable cap).

Disabled button if qty > stockAvailable.

Toast shows success; mini-cart badge updates immediately.

2) View/Update Cart

As a shopper
I want to view/edit my cart
So that I can change quantities or remove items

Acceptance Criteria

Cart shows: image, name, variant, unit price, qty selector, line total, subtotal, est. shipping/tax (if available), order total.

Qty changes recalc totals in <200ms and validate qty ≤ stockAvailable.

Remove line item updates totals and shows undo (10s).

“Proceed to Checkout” disabled if cart empty or validation errors.

3) Auth Required at Checkout

As a shopper without an account
I want to create an account at checkout
So that I can complete my order and track it

Acceptance Criteria

If unauthenticated and user clicks “Checkout”, show “Sign in / Create account” step.

Account creation requires: email (unique), password, first & last name, phone (E.164), marketing consent (optional), T&C consent (required).

Existing users can sign in (email + password, or OAuth if enabled).

After auth, user returns to checkout with cart preserved.

4) Capture Contact & Shipping

As a shopper
I want to provide phone, email, and address
So that my order can be delivered and I receive updates

Acceptance Criteria

Required fields: firstName, lastName, phone (E.164 + country), email (RFC 5322), addressLine1, city, region/state, postalCode, country.

Optional: addressLine2, deliveryNotes, company, buzzer/apt/unit.

Validation: postal format per country, phone format, email format.

Address persisted to users/{uid}/addresses and prefilled for future orders.

Shipping methods calculated after address (e.g., Standard/Express) with price + ETA.

5) Review Order

As a shopper
I want to review a final summary
So that I confirm details before paying

Acceptance Criteria

Shows line items, shipping method/cost, discounts (if any), tax, total.

Price “locks” (server-verified) when moving to payment step using a server re-price call.

Edit links for address, shipping method, and cart items.

6) Pay with Stripe (Cards + Apple Pay/Google Pay)

As a shopper
I want to pay securely
So that my order is confirmed

Acceptance Criteria

Stripe Payment Element displayed with support for: Cards, Apple Pay, Google Pay (via Stripe’s Payment Request).

Apple Pay: use Stripe’s domain verification + enable Wallets.

Google Pay: enabled via Stripe in the same Payment Element/Request flow.

3D Secure handled seamlessly by Stripe.

On “Pay”, client requests createPaymentIntent from backend with order total; client confirms with Stripe; success/failure UI shown accordingly.

Prevent double-submit; show spinner/state; recoverable errors shown clearly.

7) Create Order & Confirmation

As a shopper
I want an order created on payment success
So that I have a receipt and order status

Acceptance Criteria

On payment_intent.succeeded webhook, backend:

Verifies totals/stock,

Writes orders/{orderId} (authoritative),

Decrements inventory atomically,

Marks payment.status=paid.

Email confirmation sent (and optional SMS if enabled).

Order appears in “My Orders” with status PLACED.

8) Order History

As a signed-in user
I want to see my past orders
So that I can track fulfillment

Acceptance Criteria

My Account → Orders lists orders with status, date, total.

Detail page shows shipping address, items, totals, and payment status.

Download invoice (PDF) optional.

9) Stock & Price Validation

As a store
I want to re-validate stock & price at checkout
So that we avoid selling out-of-stock or mispriced items

Acceptance Criteria

Server “re-price” before PaymentIntent: checks latest price, promos, tax, shipping; returns canonical totals.

If any change occurs (e.g., price update), user sees a “Prices updated” notice and must reconfirm before payment.

10) Error Handling & Recovery

As a shopper
I want clear guidance when issues happen
So that I can complete my purchase

Acceptance Criteria

Payment failure shows actionable message and “Try again” (same PaymentIntent if appropriate or new one).

If 3DS canceled, allow retry without losing cart.

If item goes OOS mid-checkout, show which line failed and suggest removing/changing qty.

Data Model (Firestore-first)

Collections

users/{uid}

profile: { firstName, lastName, email, phoneE164, defaultAddressId, createdAt }

addresses/{addressId}: { firstName, lastName, line1, line2?, city, region, postalCode, country, company?, unit?, buzzer?, deliveryNotes?, isDefault }

carts/{cartId} (keyed by uid or anonymous temp id that upgrades on sign-in)

{ uid, items: [ { productId, variantId, name, variantLabel, qty, unitPrice, currency, priceSnapshotAtAdd, imageUrl } ], subtotal, shipping, tax, total, currency, updatedAt }

orders/{orderId}

{ uid, status: 'PLACED'|'PAID'|'FULFILLING'|'SHIPPED'|'CANCELLED'|'REFUNDED', items:[…], totals: { subtotal, shipping, discount, tax, total, currency }, shippingAddress:{…}, contact:{ email, phoneE164 }, shippingMethod:{ id, label, cost, eta }, payment:{ provider:'stripe', paymentIntentId, status:'requires_payment_method'|'processing'|'succeeded'|'failed', last4?, brand? }, meta:{ createdAt, updatedAt, ip, userAgent } }

payments/{paymentIntentId}

{ orderId, uid, amount, currency, status, clientSecret, latestError?, events:[…] }

webhooks_log/{id}: raw events for audits.

products/{productId} → variants/{variantId}: { price, currency, stock, sku, attributes… }

Indexes

orders by uid + createdAt desc

products.variants by stock (optional for low-stock widgets)

API / Cloud Functions (Node on Firebase)

POST /cart/reprice → Input: cartId, address, shippingMethodId? → Output: canonical totals, allowed methods.

POST /checkout/payment-intent

Input: { cartId, uid, totalsCanonical, email, phone, shippingAddress }

Creates/updates Stripe PaymentIntent (amount, currency, customer) and returns clientSecret.

POST /checkout/attach-customer (optional)

Creates/looks up Stripe Customer with email/phone; saves customerId to user profile.

POST /checkout/place-order

Writes a pending order record (status PLACED, payment processing) before client confirmation; reconciled on webhook.

POST /stripe/webhook

Handles payment_intent.succeeded, payment_intent.payment_failed, payment_intent.requires_action, charge.refunded.

On success: finalize order, decrement stock, send emails; on failure: mark order/payment accordingly.

Security: only backend touches PaymentIntent creation/amount; client never computes final amount. Use Stripe secret key only on server. Keep PCI scope to SAQ-A by using Elements/Payment Request.

Stripe Wallets (Apple Pay / Google Pay)

Apple Pay: enable in Stripe Dashboard → verify domain for Apple Pay. Payment Request Button shows Apple Pay on Safari/iOS/macOS.

Google Pay: enable in Stripe; Payment Request Button shows on Chrome/Android where available.

Use Payment Element (or Payment Request Button for accelerated checkout) so Stripe handles SCA/3DS and wallets “in one place”.

Checkout UX Flow (Happy Path)

Cart page → Proceed to Checkout

If not signed in → Sign in / Create account

Contact & Shipping form (prefill if saved)

Shipping methods returned (after address) → user selects

Re-price on server → “Review Order” shows canonical totals

Payment step: Stripe Payment Element (cards + wallets)

Confirm payment → success

Thank-you page with order number → email confirmation sent

Validation Rules (Front + Back)

Email: RFC5322, must be unique per account.

Phone: store as E.164; client masks; server verifies basic format.

Address: country-specific postal/region rules; reject P.O. boxes if using couriers that don’t deliver to them.

Qty: min 1; max stock; server double-checks before PaymentIntent.

Totals: client shows estimate; server is source of truth; differences require re-confirm.

Edge Cases & Policies

OOS at pay time: stop, highlight item, suggest reduce qty or remove.

Price changed: show delta and require user reconfirmation.

3DS canceled: offer retry; keep PaymentIntent, allow re-confirm.

Duplicate clicks: disable button; idempotency keys on backend.

Abandoned cart: save cart; optional reminder email after N hours.

Refunds: issue via Stripe; update orders/{id}.status='REFUNDED' and email customer.

Cancellations: if not shipped, allow cancel; restock inventory.

Emails / Notifications

Order Confirmation (success webhook)

Payment Failed / Action Required (if needed)

Shipping Update (when status becomes SHIPPED; include tracking)

Optional SMS if you enable a provider and have consent.

Non-Functional Requirements

Perf: cart recalcs <200ms; checkout steps responsive <500ms per step.

Resilience: webhook idempotency; retries with exponential backoff.

Audit: log every webhook; store last PaymentIntent event.

Privacy: GDPR/CPRA language; marketing opt-in checkbox; clear T&C.

Accessibility: WCAG 2.1 AA on forms and payment buttons.

Mobile: safe-area insets (iOS notch), no content under camera bars, persistent CTA.

Implementation Checklist (Dev Tasks)

 Firestore rules: user can read/write only their cart, addresses, orders (read-only except create).

 Add client Cart Store (NgRx or service) with optimistic UI and server reconciliation.

 Build Address form with country select + validation (lib like libphonenumber-js).

 Shipping calculator endpoint & methods (flat rate, weight-based, zone-based).

 Re-price endpoint and client hook before PaymentIntent.

 Stripe integration:

 Server: create/update PaymentIntent, amount from canonical totals, attach customer.

 Client: Payment Element + Payment Request Button with feature detection.

 Apple Pay domain verification + enable Wallets in Stripe.

 Webhooks endpoint with signature verification; event handlers for success/fail/refund.

 Order creation/finalization + inventory decrement (transaction).

 Email service (Brevo/SendGrid): templates for confirmation, failure, shipping.

 My Orders list & detail pages.

 QA scenarios (see below).

QA Test Scenarios (high-value)

 Add/remove lines; qty caps; subtotal/total accuracy.

 Checkout unauth → create account → return to checkout with cart intact.

 Address validation per country; bad postal prompts.

 Shipping method changes recalculates totals.

 Apple Pay on Safari iOS/macOS; Google Pay on Android/Chrome.

 3DS challenge flows (approve/deny).

 OOS during pay → block, explain, recover.

 Price change between cart and pay → re-confirm banner.

 Webhook success writes order, decrements stock, sends email.

 Payment failure paths (insufficient funds, canceled).

 Safe-area + keyboard overlay on mobile; no clipped text under camera/notch.

Nice-to-Haves (phase 2)

Promo codes / coupons via Stripe or custom rules

Saved payment methods (Stripe Customer + Link)

Tax calculation integration (Stripe Tax)

Guest checkout that auto-creates an account post-purchase (if you later choose to allow guest)

Address autocomplete (Google Places)