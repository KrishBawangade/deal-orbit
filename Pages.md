# DealOrbit — Frontend View Architecture & Adaptive Role Views (Pages.md)

> **Document Version:** 3.0.0 (Adaptive Dynamic View Architecture)  
> **Status:** Approved / Base Specification  
> **Target Framework:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion)  
> **Core Architectural Paradigm:** **Dynamic Role-Based Views over Route Duplication.**  
> Instead of fragmenting routes into redundant directories (`/rep/*`, `/manager/*`, `/finance/*`), DealOrbit uses a **clean, canonical route hierarchy** where pages dynamically adapt their views, components, action bars, and capabilities based on the active user's role, with an isolated route strictly reserved for the external Customer Portal.

---

## 1. Architectural Model: Why Dynamic Views over Folder-per-Role?

In modern enterprise B2B platforms (and frameworks like Next.js App Router), duplicating route directories per role creates severe anti-patterns:
1. **Broken Deep Linking:** A deal should have a single canonical URL: `/quotations/QT-2026-0043`. If a sales rep sends the link to their manager, it should not require a redirect to a separate `/manager/quotations/QT-2026-0043` route.
2. **Code Duplication:** The underlying bill of materials, customer metadata, and line calculations are shared across roles.
3. **Hackathon Live Demo Agility:** A dedicated **Demo Role Switcher** in the top navigation allows the presenter to seamlessly switch personas (`Sales Rep` $\rightarrow$ `Sales Manager` $\rightarrow$ `Finance / Ops` $\rightarrow$ `Admin`) on the active deal in real time without cumbersome login/logout cycles!

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE ROLE-VIEW ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  CANONICAL ROUTE:  /quotations/[id]                                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Active Role: SALES_REP                                                │  │
│  │ ➔ Renders: Quotation Builder, Cart Steppers, Live Margin Badge,       │  │
│  │            Upsell Tray, and [Simulate Deal Strategy ⚡] Modal          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Active Role: SALES_MANAGER                                            │  │
│  │ ➔ Renders: Reviewer Action Bar, Blended Risk Gauge, Ceiling Overages, │  │
│  │            Rep Discount 90-Day Benchmark, [Approve with Reason]       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Active Role: FINANCE_OPS                                              │  │
│  │ ➔ Renders: Tier-2 High-Risk Sign-off, Margin Leakage Audit,           │  │
│  │            Fulfillment Feasibility Check, Cash-Flow Projections       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              Separate Restricted Route (Hackathon Requirement)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CUSTOMER PORTAL ROUTE:  /portal/[token]                                    │
│  • Fully isolated from internal workspaces                                  │
│  • Physical backend DTO masking (Strictly NO COGS, Margins, or Risk Scores) │
│  • Line-item Q&A, Counter-Discount Tool, and Digital Confirmation           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Canonical Frontend Route Tree

```
frontend/app/
├── layout.tsx                     # Root shell, font providers, global theme
├── page.tsx                       # Redirection to /quotations
│
├── (auth)/                        # Authentication Route Group
│   ├── login/page.tsx             # Login view (/login)
│   └── signup/page.tsx            # Signup view (/signup)
│
├── (workspace)/                   # Internal Operations Workspace
│   ├── layout.tsx                 # Top navigation bar, dynamic role switcher, reload action
│   ├── quotations/
│   │   ├── page.tsx               # Canonical Quotation List & Filters (/quotations)
│   │   ├── new/page.tsx           # Create Quotation Wizard (/quotations/new)
│   │   └── [id]/page.tsx          # Adaptive Quotation Screen (/quotations/:id)
│   │                              # (Switches between Rep Builder, Manager Review, Finance Audit)
│   ├── pipeline/page.tsx          # Kanban Deal Pipeline (/pipeline)
│   ├── approvals/page.tsx         # Centralized Governance & Approval Inbox (/approvals)
│   ├── fulfillment/page.tsx       # Multi-Warehouse Auto-Split & Dispatch (/fulfillment)
│   ├── billing/page.tsx           # Hybrid Invoices, Subscriptions & Proration (/billing)
│   └── deal-health/page.tsx       # Deal Health Radar & Anomaly Scanner (/deal-health)
│
├── (portal)/                      # Restricted External Customer Portal (Tokenized)
│   └── portal/[token]/
│       ├── layout.tsx             # Isolated branded customer layout (No internal controls)
│       └── page.tsx               # Customer Negotiation & Digital Sign-Off (/portal/:token)
│
└── (admin)/                       # Backend Configuration Area
    └── admin/
        ├── layout.tsx             # Admin sidebar layout (Rules, Warehouses, Reports)
        ├── discount-rules/        # Tier Ceilings & Category Overrides (/admin/discount-rules)
        ├── warehouses/            # Warehouses, Stock & Shipping Weights (/admin/warehouses)
        ├── subscriptions/         # Recurring Plans & Proration Policy (/admin/subscriptions)
        ├── upsell-rules/          # Co-Purchase Pairings & Margin Floor (/admin/upsell-rules)
        └── reports/               # Sales Analytics with PDF/XLS Export (/admin/reports)
```

---

## 3. Global Top Navigation & Interactive Role Switcher

Every internal workspace view is wrapped by `app/(workspace)/layout.tsx`, featuring a dynamic navigation bar that adapts links based on the active role and includes a **Live Demo Persona Switcher**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  DEALORBIT   [Quotations]  [Pipeline]  [Approvals]  [Fulfillment]  [Billing]  [Deal Health]  [Backend]     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ⚡ LIVE DEMO ROLE: [ 👤 Role: Sales Rep (Sam Seller) ▾ ]    [↻ Reload Data]   [👤 Logout]             │
│  Dropdown Options:                                                                                     │
│  • 🟢 Sales Rep (Sam Seller) — Builder, What-If Simulator, Upsell Tray                                │
│  • 🟡 Sales Manager (Morgan Manager) — Tier-1 Approvals, Blended Risk Gauge, Deal Health Radar         │
│  • 🔵 Finance / Ops (Fiona Finance) — Tier-2 Approvals, Split Billing, Proration Calculator           │
│  • 🟣 System Admin (Alex Admin) — Master Discount Rules, Warehouses, XLS Reports                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Adaptive View Specifications across Core Pages

---

### 4.1 Page 1: The Adaptive Quotation Screen (`/quotations/[id]`)

This is the central operating screen of DealOrbit. Depending on the active user role, it conditionally renders specialized component trees:

#### A. When Viewed as `SALES_REP` (Builder & Strategy Mode):
* **Component Tree:**
  * `QuotationBuilderHeader` (Customer metadata, Gold tier ceiling indicator).
  * `StickySummaryHeader` (Live Margin Gauge, Risk indicator, Feasibility badge).
  * `EditableCartTable` (Quantity steppers, discount inputs, ceiling violation amber tags).
  * `UpsellCrossSellTray` (Right docked drawer with $+\Delta\%$ margin tags).
  * `[Simulate Deal Strategy ⚡]` action button (Launches the Innovation Simulator Modal).
  * `[Submit for Manager Review]` action button.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [SALES REP VIEW]   Quote: QT-2026-0043 (v2)  | Customer: Acme Corp (Gold Tier)        │
│  [Save Draft]       [Simulate Deal Strategy ⚡]         [Submit for Manager Review →]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Subtotal: ₹18,20,000 | Discounts: -₹2,25,600 | Taxes: ₹2,86,992 | Total: ₹18,81,392  │
│  Blended Gross Margin: [ 18.4% ⚠️ ] | Blended Risk: [ 38.5 Medium - Manager Req ]     │
│  Inventory Feasibility: [ 20/20 Available across 2 Warehouses (Feasible) ]             │
├───────────────────────────────────────────────────────────────┬────────────────────────┤
│  CART LINE ITEMS                                              │ UPSELL & CROSS-SELL    │
├───────────────────────────────────────────────────────────────┤ (Ranked Suggestions)   │
│  Line 1: Enterprise Pro Laptop 16" (HARDWARE)                 │ ┌────────────────────┐ │
│  Qty: [ - 20 + ] | Base: ₹85,000 | Discount: [ 12% ]          │ │ ⭐ PROMOTED        │ │
│  Ceiling: 15% (OK) | Net: ₹14,96,000 | Margin: 23.5% (Green)  │ │ 2-Yr Care Pack     │ │
│                                                               │ │ Price: ₹18,000     │ │
│  Line 2: On-Site Deployment & Setup (SERVICES)                │ │ Margin: +Δ 2.4%    │ │
│  Qty: [ - 1 + ]  | Base: ₹1,20,000 | Discount: [ 18% ] ⚠️     │ │ [Add to Quote]    │ │
│  Ceiling: 10% (VIOLATION +8 pts) | Net: ₹98,400 | Margin: -1.6%│ └────────────────────┘ │
└───────────────────────────────────────────────────────────────┴────────────────────────┘
```

#### B. When Viewed as `SALES_MANAGER` (Governance Review Mode):
* **Component Tree:**
  * Switches cart to **Read-Only Inspection Mode**.
  * Renders `ManagerApprovalBanner` at top:
    * Blended Risk Score Gauge (`38.5 / 100` Medium Risk).
    * Line Ceiling Violation Breakdown (+8 points over Service ceiling).
    * Rep 90-Day Historical Average Discount Benchmark ($9.20\%$ vs. $14.10\%$ proposed).
  * `MandatoryReasonInput` (Required field for audit compliance).
  * Action Buttons: `[✓ Approve with Reason]`, `[↺ Return for Revision]`, `[✗ Reject]`.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [SALES MANAGER REVIEW VIEW]   Quote: QT-2026-0043 | Rep: Sam Seller                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  GOVERNANCE AUDIT BANNER:                                                              │
│  • Blended Risk Score: [ 38.5 / 100 ] (Sales Manager Sign-off Required)                │
│  • Category Violations: Line 2 (Services) exceeds 10% ceiling by +8.00 points          │
│  • Rep Benchmark: Proposed 14.10% is +4.90% above Sam's 90-day avg (9.20%)            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  MANDATORY DECISION LOG:                                                               │
│  Reason: [ Strategic renewal account; margin protected through bundled services      ] │
│                                                                                        │
│  [✓ Approve with Reason]      [↺ Return for Revision]          [✗ Reject Quotation]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  INSPECTED BILL OF MATERIALS (Read-Only Cart):                                         │
│  • 20x Enterprise Pro Laptop 16" (12% disc) — Net: ₹14,96,000 | Margin: 23.5%         │
│  • 1x On-Site Setup Service (18% disc)      — Net: ₹98,400   | Margin: -1.6% ⚠️        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### C. When Viewed as `FINANCE_OPS` (Margin & Cash Flow Audit Mode):
* **Component Tree:**
  * Activates if Blended Risk Score $> 50$ (Tier-2 Approval).
  * Renders `FinanceAuditPanel`:
    * Net Margin Dollar leakage analysis.
    * Cash Collection Schedule (One-time payment terms vs recurring ARR).
    * Multi-warehouse logistics feasibility summary (Projected split shipments).
  * Action Buttons: `[✓ Finance Director Sign-off]`, `[Request Margin Recalibration]`.

---

### 4.2 The Innovation Core: Deal Strategy Simulator Modal
* **Accessibility:** Available to **Sales Rep** and **Sales Manager** on `/quotations/[id]`.
* **Component:** `DealStrategySimulatorModal.tsx`
* **Features:**
  * Grounded Customer Profile: Displays Acme Corp's empirical accepted discount corridor ($8-12\%$) and high service affinity ($0.85$).
  * Side-by-side trade-off matrix:
    * **Scenario A (Status Quo):** $15\%$ discount, $14.2\%$ margin, high risk (56.0), two approvals, $48\%$ acceptance.
    * **Scenario B (Recommended):** $10\%$ discount + 2-Yr Care Pack, $21.5\%$ margin ($+730\text{ bps}$), single approval, $68\%$ acceptance.
    * **Scenario C (Margin Defense):** $7\%$ discount + Premium SLA, $25.2\%$ margin, zero approvals, $58\%$ acceptance.
  * Clicking **[Apply Scenario B ⚡]** updates the active quotation cart lines dynamically.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DEAL STRATEGY & SCENARIO SIMULATOR                              │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ SCENARIO A: Status Quo   │ SCENARIO B: Recommended ⭐ │ SCENARIO C: Margin Defense      │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Hardware Discount: 15%   │ Hardware Discount: 10%    │ Hardware Discount: 7%           │
│ Service Discount: 18%    │ Service Discount: 10%     │ Service Discount: 8%            │
│ Bundles: None            │ Bundles: 2-Yr Care Pack   │ Bundles: Dedicated Premium SLA  │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ BUSINESS REALITY:        │ BUSINESS REALITY:         │ BUSINESS REALITY:               │
│ • Net Margin: 14.2% 🔴   │ • Net Margin: 21.5% 🟢    │ • Net Margin: 25.2% 🟢          │
│ • Risk Score: 56.0 High  │ • Risk Score: 22.0 Medium │ • Risk Score: 14.0 Low          │
│ • Approvals: Mgr + Fin   │ • Approvals: Mgr Only ⚡  │ • Approvals: Auto-Approved 🚀   │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ CUSTOMER REALITY:        │ CUSTOMER REALITY:         │ CUSTOMER REALITY:               │
│ • Acceptance: 48%        │ • Acceptance: 68% ⭐      │ • Acceptance: 58%               │
│ • Counter-Offer: 42%     │ • Counter-Offer: 24%      │ • Counter-Offer: 34%            │
│ • Rejection: 10%         │ • Rejection: 8%           │ • Rejection: 8%                 │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ [Keep Status Quo]        │ [Apply Scenario B ⚡]      │ [Apply Scenario C]              │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

---

### 4.3 Page 2: Centralized Governance & Approval Inbox (`/approvals`)
* **Primary Roles:** Sales Manager (Tier 1), Finance Director (Tier 2), Admin.
* **Component:** `ApprovalsInboxView.tsx`
* **Features:**
  * Tabbed queues: `[Pending (2)]`, `[Approved (14)]`, `[Returned for Revision (3)]`.
  * Renders summary cards with customer name, rep name, proposed discount, risk gauge, and itemized violations.
  * Clicking any card opens the review drawer or navigates to `/quotations/[id]` in Manager Review Mode.

---

### 4.4 Page 3: Dedicated Restricted Customer Portal (`/portal/[token]`)
* **Target User:** Customer Procurement Contact (External).
* **Strict Security Isolation:** Server-side DTO sanitization physically strips COGS, line margins, deal margins, and internal risk scores.
* **Features:**
  * Professional bill of materials with product specifications, list prices, authorized discounts, and grand totals.
  * Line-item inquiry tool for posting questions directly to the rep.
  * Counter-discount proposal field.
  * **Self-Governing Invalidation Alert:** Warns customer if counter breaches corporate limits and triggers manager re-approval.
  * One-click **[Confirm & Accept Quotation]** button with digital signature input and formal PDF download.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  DEALORBIT PROPOSAL PORTAL                    Status: UNDER NEGOTIATION                │
│  Quote: QT-2026-0043 | Prepared for: Acme Corp | Expires: 2026-09-19                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  PROPOSED BILL OF MATERIALS:                                                           │
│  ┌─────────────────────────────────────┬─────┬────────────┬──────────┬───────────────┐ │
│  │ Item Description                    │ Qty │ List Price │ Discount │ Net Amount    │ │
│  ├─────────────────────────────────────┼─────┼────────────┼──────────┼───────────────┤ │
│  │ Enterprise Pro Laptop 16"           │ 20  │ ₹85,000    │ 10.0%    │ ₹15,30,000    │ │
│  │ 💬 "Can delivery timeline be accelerated to 48 hours?" - Acme Procurement           │ │
│  │    ↳ "Yes, inventory is staged across regional hubs." - Sam Seller (Rep)          │ │
│  ├─────────────────────────────────────┼─────┼────────────┼──────────┼───────────────┤ │
│  │ 2-Year Accidental Damage Protection │ 20  │ ₹18,000    │ 5.0%     │ ₹3,42,000     │ │
│  └─────────────────────────────────────┴─────┴────────────┴──────────┴───────────────┘ │
│  Subtotal: ₹20,60,000 | Discount: -₹1,88,000 | Taxes: ₹3,36,960 | Total: ₹22,08,960   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  COUNTER-DISCOUNT TOOL:                                                                │
│  Propose Counter on Laptop Line: [ 14.0% ]   Message: [ Matching competitor terms... ] │
│  [Submit Counter Proposal]                                                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  DIGITAL ACCEPTANCE:                                                                   │
│  Signer Name: [ Jordan Procurement           ] Title: [ Director of IT Procurement   ] │
│  [✓ Confirm & Accept Quotation]                                [Download Official PDF] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.5 Page 4: Multi-Warehouse Fulfillment & Backorders (`/fulfillment`)
* **Primary Roles:** Operations / Logistics Manager, Admin.
* **Component:** `FulfillmentSplitView.tsx`
* **Features:**
  * Greedy multi-warehouse auto-split display (Main Central Hub vs. East Depot).
  * Shows on-hand stock and shipping cost weighting multipliers ($1.00$ vs $1.30$).
  * Actions: `[Accept Recommended Split]` and `[Manual Override Allocations]` with editable quantity cells.
  * Conditional alert banner: **"Consolidate Remaining Backorder"** when replenishment stock arrives.

---

### 4.6 Page 5: Hybrid Billing & Subscription Proration (`/billing`)
* **Primary Roles:** Finance Director, Billing Clerk, Admin.
* **Component:** `HybridBillingView.tsx`
* **Features:**
  * Clean visual partitioning: One-Time Invoices vs. Recurring Subscription Contracts.
  * Invoices Table: `#INV-XXXX`, amount, due date, status (`SENT`, `PAID`), with one-click `[Record Payment]`.
  * Subscriptions Table: `#SUB-XXXX`, frequency (`MONTHLY`), rate, next charge date, and future billing calendar.
  * **Mid-Cycle Proration Calculator:** Interactive calculator that models tier changes on Day $d$ of a $D$-day cycle, calculating:
    $$\Delta\text{Prorated} = \left( \frac{D - d}{D} \right) \times (\text{NewRate} - \text{OldRate})$$
    and issuing a proration adjustment invoice.

---

### 4.7 Page 6: Deal Health Radar & Anomaly Dashboard (`/deal-health`)
* **Primary Roles:** Sales Manager, Sales Director, Admin.
* **Component:** `DealHealthRadarView.tsx`
* **Features:**
  * Stalled deals cards (quotes inactive $> 7$ days) with one-click **[Send Nudge]** action.
  * Discount anomaly alerts (rep discount $> 2.5\sigma$ above 90-day moving average).
  * Delivery promise slippage warnings (logistics carrier ETA exceeds promised date).
  * One-click drill-down to the affected quotation.

---

### 4.8 Page 7: Backend Admin Configuration Suite (`/admin/*`)
* **Primary Roles:** System Administrator.
* **Component Views:**
  * `/admin/discount-rules` — Customer tier baseline ceilings (Bronze $5\%$, Silver $10\%$, Gold $15\%$, Enterprise $20\%$) and category overrides (Hardware $15\%$, Software $20\%$, Services $10\%$).
  * `/admin/warehouses` — Warehouse registration, stock counts, and shipping cost weighting multipliers.
  * `/admin/subscriptions` — Recurring plan frequencies and day-count proration policy toggles.
  * `/admin/upsell-rules` — Co-purchase pairings, promotional boost flags, and margin safety floor ($18\%$).
  * `/admin/reports` — Sales performance reporting with granular filters (date, rep, status, category) and one-click **[Export to PDF]** / **[Export to XLS]**.

---

## 5. Summary of Architecture Benefits

1. **Clean Route Tree:** Unified routes like `/quotations/[id]` avoid route bloat and broken links.
2. **True Security at the Boundary:** Sensitive data is stripped at the backend controller level, not just hidden by CSS.
3. **5-Minute Live Pitch Ready:** The **Demo Role Switcher** allows instant switching between Sales Rep, Manager, Finance, and Admin perspectives right from the top navigation bar!
4. **100% Hackathon Spec Compliance:** Fulfills all requirements from Sections A (Backend Config) and B (Frontend Experience) with genuine, non-mocked application logic.
