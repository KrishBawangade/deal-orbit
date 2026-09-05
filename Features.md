# DealOrbit — Features Specification & Prioritization Matrix (Features.md)

> **Document Version:** 1.0.0  
> **Status:** Approved / Base Specification  
> **Target System:** DealOrbit (Intelligent, Self-Governing Sales Operations Platform)  
> **Direct Interoperability:** Traces 1-to-1 to `PRD.md`, `User_flows.md`, `Architecture.md`, `Database.md`, and `API.md`.

---

## 1. Feature Prioritization Framework

To guarantee flawless execution within the hackathon timeline while delivering the complete quotation-to-cash workflow, features are categorized into three distinct priority tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEALORBIT FEATURE TIERS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  P0: CORE ESSENTIAL / MAIN FEATURES (Hackathon Non-Negotiables)             │
│  • The complete end-to-end Quotation-to-Cash loop                           │
│  • The Deal Strategy Simulator innovation layer                             │
│  • Real application logic for Risk, Warehouse Split, and Proration          │
├─────────────────────────────────────────────────────────────────────────────┤
│  P1: SECONDARY / OPERATIONAL POLISH (High-Impact Differentiators)           │
│  • Deal Health Radar & Anomaly Alerts (>2.5σ outliers, stalled deals)       │
│  • Warehouse Manual Override & Backorder Consolidation prompt               │
│  • Sales Performance Reporting & PDF/XLS export                             │
│  • Kanban Deal Pipeline & Admin Master Configuration                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  P2: TERTIARY / POST-HACKATHON HORIZON (Documented Roadmap)                 │
│  • Multi-currency / Real-time FX conversion                                 │
│  • Odoo / SAP / Salesforce Bi-directional Sync Webhooks                     │
│  • Offline E-signature & automated DocuSign integration                     │
│  • Machine Learning feedback loop on closed deal win/loss corridors         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. P0: Main / Core Features (The Hackathon Baseline + Innovation)

Every feature in P0 is **mandatory** for the live demo and must execute real server-side application logic.

---

### FEAT-01: Living Quotation Builder with Live Margin & Feasibility
* **Priority:** `P0 (Main)`
* **Module:** Living Quotation Management
* **Target Users:** Sales Representative
* **Description:** Interactive workspace where sales reps build multi-category quotes (Hardware, Software, Services). Dynamically recalculates line totals, Cost of Goods Sold (COGS), line gross margins, and order-level blended margin badges in real time without page reloads.
* **Key Logic & Rules:**
  * Displays customer tier baseline ceiling badge.
  * Real-time aggregate margin formula:
    $$\text{Deal Margin \%} = \frac{\sum \text{Net Revenue}_i - \sum \text{Cost}_i}{\sum \text{Net Revenue}_i} \times 100$$
  * Instant inventory feasibility warning if aggregate requested quantity exceeds total cross-warehouse stock.
* **Technical Dependencies:**
  * DB: `quotations`, `quotation_lines`, `products`, `customers`.
  * API: `GET /api/v1/quotations/:id`, `PUT /api/v1/quotations/:id`.
  * UI: `QuotationBuilderScreen`, `CartTable`, `LiveMarginBadge`.
* **Complexity:** Medium (3 Days)

---

### FEAT-02: Multi-Tier Discount Governance (Customer Tier vs. Category Overrides)
* **Priority:** `P0 (Main)`
* **Module:** Pricing & Governance
* **Target Users:** Sales Representative, Sales Manager
* **Description:** Evaluates discounts against both customer tier ceilings (Bronze $5\%$, Silver $10\%$, Gold $15\%$, Enterprise $20\%$) and product category ceilings (Hardware $15\%$, Software $20\%$, Services $10\%$).
* **Key Logic & Rules:**
  * Category ceiling strictly overrides customer ceiling:
    $$\text{Effective Ceiling}_i = \min(\text{CustomerCeiling}, \text{CategoryCeiling}_i)$$
  * Violating lines are instantly tagged with `isViolation = true`, highlighted in amber, and display the exact overage points.
* **Technical Dependencies:**
  * DB: `discount_ceilings`, `categories`.
  * Service: `DiscountGovernanceService.evaluateLineCeilings()`.
* **Complexity:** Low-Medium (2 Days)

---

### FEAT-03: Blended Discount Risk Score Engine
* **Priority:** `P0 (Main)`
* **Module:** Governance & Risk
* **Target Users:** Sales Representative, Sales Manager, Finance Director
* **Description:** Mathematical scoring engine that evaluates the **aggregate discount leakage pattern** across all lines, catching scenarios where multiple small line violations accumulate into severe enterprise margin loss.
* **Key Logic & Rules:**
  $$\text{Risk Score} = 4.0 \cdot \sum_{i} \left( \frac{\text{Line Amount}_i}{\text{Total Amount}} \cdot \max(0, \text{Discount}_i - \text{Ceiling}_i) \right) + 25.0 \cdot \max(0, 0.20 - \text{DealMargin}) + 10.0 \cdot \text{RepVolatility}$$
  * Score $< 20$: `Auto-Approved`.
  * Score $20 - 50$: `Sales Manager Approval Required`.
  * Score $> 50$: `Sales Manager + Finance Director Required`.
* **Technical Dependencies:**
  * Service: `RiskScoringEngine.calculateScore()`.
  * API: Evaluated on `PUT /api/v1/quotations/:id` and `POST /submit-review`.
* **Complexity:** Medium (2 Days)

---

### FEAT-04: Automated Multi-Tier Approval Workflow & Immutable Audit Trail
* **Priority:** `P0 (Main)`
* **Module:** Approvals & Governance
* **Target Users:** Sales Manager, Finance Director
* **Description:** Automatically routes out-of-policy quotations to the appropriate reviewer inbox without manual emails. Enforces mandatory reason entry for approvals, rejections, and revision requests, logging each decision to an immutable audit ledger.
* **Key Logic & Rules:**
  * Sequential escalation: Manager approval unlocks Finance Director sign-off if Risk Score $> 50$.
  * **Mutation Invalidation:** If any line item or discount is modified after approval, active sign-offs are immediately revoked (`REVOKED_BY_MUTATION`) and the quote reverts to review.
* **Technical Dependencies:**
  * DB: `approval_requests`, `audit_logs`.
  * API: `GET /api/v1/approvals/pending`, `POST /api/v1/approvals/:id/decision`.
  * UI: `ApprovalInboxView`, `RiskScoreMeter`, `AuditTimeline`.
* **Complexity:** Medium (3 Days)

---

### FEAT-05: Deal Strategy Engine & Grounded Dual-Sided Simulator (Innovation)
* **Priority:** `P0 (Main / Innovation Core)`
* **Module:** Deal Strategy Engine
* **Target Users:** Sales Representative
* **Description:** An exploratory sandbox that allows the sales rep to simulate alternative deal structures before committing. Simulates both **Business Reality** (net margins, risk score, approval tiers, shipment counts) and **Customer Reality** (predicted response probabilities: Accept, Negotiate, Reject based on empirical history). Synthesizes and recommends three strategies (Scenarios A, B, C) with one-click application.
* **Key Logic & Rules:**
  * **Grounded Simulation:** Evaluates proposed discount against the customer's historical accepted corridor ($8-12\%$) and service affinity ($0.85$).
  * **Synthesizes 3 Scenarios:**
    * *Scenario A (Status Quo):* High discount, low margin ($14.2\%$), two approvals, $48\%$ acceptance.
    * *Scenario B (Recommended):* Moderated discount ($10\%$) + bundled 2-Yr Care Pack, $21.5\%$ margin, single approval, $68\%$ acceptance.
    * *Scenario C (Margin Defense):* $7\%$ discount + premium support, $25.2\%$ margin, zero approvals, $58\%$ acceptance.
  * Clicking **[Apply Scenario B]** dynamically updates active quotation cart lines and recalculates totals.
* **Technical Dependencies:**
  * DB: `customer_negotiation_profiles`, `deal_strategy_simulations`.
  * Service: `DealStrategyService.simulateDualSided()`.
  * API: `POST /api/v1/simulations/run`, `POST /api/v1/simulations/apply`.
  * UI: `DealStrategyModal`, `ScenarioComparatorMatrix`, `ProbabilityGauges`.
* **Complexity:** High (4 Days) — *Primary Hackathon Differentiator*

---

### FEAT-06: Live Upsell & Cross-Sell Recommendation Tray
* **Priority:** `P0 (Main)`
* **Module:** In-line Quoting Intelligence
* **Target Users:** Sales Representative
* **Description:** Contextual sidebar drawer docked beside the quotation cart that serves ranked upsell (higher-tier SKUs) and cross-sell (accessories, care packs) recommendations.
* **Key Logic & Rules:**
  * Suggestion ranking driven by co-purchase affinity score and promotional tags.
  * Suppresses items that breach the configured minimum margin floor ($18\%$).
  * Displays live margin delta badge ($+\Delta 2.4\%$ Margin) and one-click `[Add to Quote]`.
* **Technical Dependencies:**
  * DB: `upsell_rules`, `products`.
  * Service: `UpsellCrossSellService.getRecommendations()`.
  * API: `POST /api/v1/upsell/recommendations`.
* **Complexity:** Low-Medium (2 Days)

---

### FEAT-07: Restricted Customer Negotiation Portal with Physical Data Masking
* **Priority:** `P0 (Main)`
* **Module:** Customer Collaboration
* **Target Users:** Customer Procurement Contact, Sales Representative
* **Description:** Secure, token-authenticated portal where external customers review proposals, post line-level questions, and submit counter-discount proposals.
* **Key Logic & Rules:**
  * **Server-Side Data Masking:** DTO physically strips COGS, unit costs, line margins, deal margins, and risk scores before returning JSON.
  * **Self-Governing Re-Approval:** If customer proposes a counter-discount that breaches ceilings, DealOrbit automatically revokes prior approvals and transitions status to `NEGOTIATING / PENDING_REAPPROVAL`.
  * One-click digital confirmation generates an accepted contract and initiates sales order creation.
* **Technical Dependencies:**
  * DB: `quotations`, `customer_negotiation_threads`.
  * Service: `CustomerPortalService.getSanitizedQuote()`.
  * API: `GET /api/v1/portal/:token`, `POST /api/v1/portal/:token/counter-offer`, `POST /api/v1/portal/:token/confirm`.
  * UI: `CustomerPortalView`, `LineDiscussionThread`, `CounterOfferModal`.
* **Complexity:** High (3 Days)

---

### FEAT-08: Multi-Warehouse Auto-Split Allocation & Feasibility
* **Priority:** `P0 (Main)`
* **Module:** Logistics & Fulfillment
* **Target Users:** Operations Manager, Sales Representative
* **Description:** Automatically evaluates stock distribution across regional warehouses (`Main Central Hub`, `East Depot`, `West Hub`) and splits confirmed orders to minimize total shipment count and logistics cost weighting.
* **Key Logic & Rules:**
  * Single-source preference: If one warehouse has full stock, allocate $100\%$ there.
  * Greedy multi-source allocation: Fills remaining quantities from the nearest node with lowest shipping cost multiplier.
  * Splits unfulfillable quantities into a linked `BACKORDER` manifest.
* **Technical Dependencies:**
  * DB: `warehouses`, `warehouse_stocks`, `fulfillment_splits`, `backorders`.
  * Service: `FulfillmentService.optimizeWarehouseSplit()`.
  * API: `POST /api/v1/fulfillment/split-order/:orderId`.
* **Complexity:** High (3 Days)

---

### FEAT-09: Hybrid Billing Split (One-Time Invoice + Recurring Subscription Schedule)
* **Priority:** `P0 (Main)`
* **Module:** Hybrid Billing & Invoicing
* **Target Users:** Finance / Billing Clerk
* **Description:** Automatically partitions a single confirmed sales order containing both physical goods and recurring services into two independent financial workflows: an immediate Commercial Invoice and an ongoing Subscription Contract.
* **Key Logic & Rules:**
  * One-time lines $\rightarrow$ Generated as Invoice `#INV-XXXX` (Status: `SENT`, Due: Net 30).
  * Recurring lines $\rightarrow$ Generated as Subscription `#SUB-XXXX` with recurring billing schedules (Monthly, Quarterly, Annually).
* **Technical Dependencies:**
  * DB: `invoices`, `subscriptions`, `billing_schedules`.
  * Service: `HybridBillingService.partitionSalesOrder()`.
  * API: `GET /api/v1/billing/orders/:orderId/invoices`, `GET /api/v1/billing/orders/:orderId/subscriptions`.
* **Complexity:** Medium (2 Days)

---

### FEAT-10: Exact Day-Count Subscription Proration Engine
* **Priority:** `P0 (Main)`
* **Module:** Subscriptions & Proration
* **Target Users:** Finance / Billing Clerk
* **Description:** Computes exact day-count adjustments when a customer upgrades, downgrades, or modifies seat counts mid-billing cycle.
* **Key Logic & Rules:**
  $$\text{Prorated Delta} = \left( \frac{\text{Days Remaining}}{\text{Days in Period}} \right) \times (\text{New Plan Rate} - \text{Old Plan Rate})$$
  * Generates an immediate Proration Adjustment Invoice or Credit Note.
* **Technical Dependencies:**
  * DB: `proration_adjustments`, `credit_notes`.
  * Service: `HybridBillingService.calculateMidTermProration()`.
  * API: `POST /api/v1/billing/subscriptions/:id/modify`.
* **Complexity:** Medium (2 Days)

---

## 3. P1: Secondary Features (Operational Polish & Management Radar)

Features in P1 elevate the platform into a true enterprise-grade system and provide critical demonstration highlights.

---

### FEAT-11: Deal Health Anomaly Radar & Automated Nudges
* **Priority:** `P1 (Secondary)`
* **Module:** Management & Analytics
* **Target Users:** Sales Manager, Sales Director
* **Description:** Background monitoring radar that identifies stalled quotations ($>7$ days without activity), discount anomalies ($>2.5\sigma$ above rep historical 90-day average), and logistics delivery slippage.
* **Key Logic & Rules:**
  * Calculates rep discount Z-scores: $Z = \frac{\text{Proposed} - \mu_{\text{rep}}}{\sigma_{\text{rep}}}$. If $Z > 2.5$, emits high-severity alert.
  * One-click **[Send Nudge]** action triggers an automated follow-up notification to the assigned sales representative.
* **Technical Dependencies:**
  * DB: `deal_health_alerts`.
  * API: `GET /api/v1/deal-health/radar`, `POST /api/v1/deal-health/nudge/:quoteId`.
  * UI: `DealHealthRadarView`, `AnomalyAlertCard`.
* **Complexity:** Medium (2 Days)

---

### FEAT-12: Operations Manual Warehouse Split Override
* **Priority:** `P1 (Secondary)`
* **Module:** Logistics & Fulfillment
* **Target Users:** Operations / Logistics Manager
* **Description:** Allows warehouse managers to adjust the automated multi-warehouse allocation manually when local physical constraints (e.g., loading dock repairs) dictate an alternate split.
* **Technical Dependencies:**
  * API: `PUT /api/v1/fulfillment/split-order/:splitId/override`.
  * UI: `WarehouseSplitMatrix` with editable quantity cells.
* **Complexity:** Low (1 Day)

---

### FEAT-13: Backorder Consolidation Prompt & Replenishment Dispatch
* **Priority:** `P1 (Secondary)`
* **Module:** Logistics & Fulfillment
* **Target Users:** Operations / Logistics Manager
* **Description:** When replenishment inventory is received for an item with open backorders, the platform displays an automated **"Consolidate Remaining Backorder"** action banner, allowing one-click shipment creation.
* **Technical Dependencies:**
  * DB: `backorders`.
  * API: `POST /api/v1/fulfillment/backorders/:id/consolidate`.
* **Complexity:** Low-Medium (1.5 Days)

---

### FEAT-14: Admin Master Data Configuration Suite
* **Priority:** `P1 (Secondary)`
* **Module:** Administration & Setup
* **Target Users:** System Administrator
* **Description:** Dedicated administrative views for configuring customer discount tiers, category limits, approval chains, warehouses, stock levels, and recurring billing plans.
* **Technical Dependencies:**
  * API: `/api/v1/admin/*` endpoints.
  * UI: `/admin/discount-rules`, `/admin/warehouses`, `/admin/subscriptions`.
* **Complexity:** Medium (2.5 Days)

---

### FEAT-15: Sales Performance Reporting with PDF / XLS Export
* **Priority:** `P1 (Secondary)`
* **Module:** Administration & Reporting
* **Target Users:** System Admin, Sales Director
* **Description:** Sales reporting menu featuring granular filters (Period, Rep/Team, Approval Status, Product Category) with instant export to formatted PDF summaries and downloadable XLS sheets.
* **Technical Dependencies:**
  * Libraries: `exceljs` / `jspdf`.
  * API: `GET /api/v1/admin/reports/sales?format=pdf|xls`.
* **Complexity:** Medium (2 Days)

---

### FEAT-16: Subscription Cancellation & Automated Credit Note Issuance
* **Priority:** `P1 (Secondary)`
* **Module:** Hybrid Billing & Subscriptions
* **Target Users:** Finance / Billing Clerk
* **Description:** Cancels active subscription contracts, calculates unconsumed pre-paid balances, and automatically issues an official Credit Note (`#CN-XXXX`).
* **Technical Dependencies:**
  * DB: `credit_notes`, `subscriptions`.
  * API: `POST /api/v1/billing/subscriptions/:id/cancel`.
* **Complexity:** Low-Medium (1.5 Days)

---

### FEAT-17: Kanban Deal Pipeline View
* **Priority:** `P1 (Secondary)`
* **Module:** Sales Workspace Experience
* **Target Users:** Sales Representative, Sales Manager
* **Description:** Visual Kanban board organizing quotations by lifecycle stage (`Draft`, `In Review`, `Customer Review`, `Negotiating`, `Accepted`) with drag-and-drop or card click navigation.
* **Technical Dependencies:**
  * UI: `PipelineKanbanBoard`, `DealCard`.
* **Complexity:** Low-Medium (1.5 Days)

---

## 4. P2: Tertiary Features (Future-Work Roadmap)

Documented in the pitch and architecture to demonstrate system scalability and post-hackathon vision:

| Feature ID | Feature Name | Description & Strategic Value |
| :--- | :--- | :--- |
| **FEAT-18** | **Multi-Currency & Real-Time FX** | Auto-converts quotations into customer local currencies (USD, EUR, GBP) with live FX rate feeds and hedging margin buffers. |
| **FEAT-19** | **ERP Bi-Directional Sync (Odoo/SAP)** | Webhook connectors that automatically sync confirmed sales orders, stock receipts, and ledger journals with external ERP systems. |
| **FEAT-20** | **DocuSign & E-Signature Automation** | Out-of-the-box legally binding digital signature dispatch upon quote acceptance. |
| **FEAT-21** | **Machine Learning Feedback Loop** | Automated retraining of customer acceptance probability models based on historical won vs. lost deal corridors. |

---

## 5. Comprehensive Feature Traceability & Dependency Matrix

| Feature ID | Feature Name | Priority | Module | Depends On DB Models | API Endpoints |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **FEAT-01** | Living Quotation Builder | **P0** | Quotation | `Quotation`, `QuotationLine` | `GET/PUT /quotations/:id` |
| **FEAT-02** | Multi-Tier Governance | **P0** | Pricing | `DiscountCeiling`, `Category` | `GET /admin/discount-ceilings` |
| **FEAT-03** | Blended Risk Score | **P0** | Governance | `Quotation`, `User` | `PUT /quotations/:id` |
| **FEAT-04** | Multi-Tier Approvals | **P0** | Approvals | `ApprovalRequest`, `AuditLog` | `POST /approvals/:id/decision` |
| **FEAT-05** | Deal Strategy Simulator | **P0** | Innovation | `CustomerProfile`, `Simulation` | `POST /simulations/run, /apply` |
| **FEAT-06** | Live Upsell Tray | **P0** | Quoting | `UpsellRule`, `Product` | `POST /upsell/recommendations` |
| **FEAT-07** | Customer Portal (Masked) | **P0** | Portal | `Quotation`, `NegotiationThread`| `GET/POST /portal/:token/*` |
| **FEAT-08** | Warehouse Auto-Split | **P0** | Logistics | `WarehouseStock`, `Split` | `POST /fulfillment/split-order` |
| **FEAT-09** | Hybrid Billing Split | **P0** | Billing | `Invoice`, `Subscription` | `GET /billing/orders/:id/*` |
| **FEAT-10** | Subscription Proration | **P0** | Billing | `ProrationAdjustment` | `POST /subscriptions/:id/modify` |
| **FEAT-11** | Deal Health Radar | **P1** | Health | `DealHealthAlert` | `GET /deal-health/radar` |
| **FEAT-12** | Warehouse Split Override | **P1** | Logistics | `FulfillmentSplit` | `PUT /fulfillment/split/:id/override`|
| **FEAT-13** | Backorder Consolidator | **P1** | Logistics | `Backorder` | `POST /backorders/:id/consolidate` |
| **FEAT-14** | Admin Master Suite | **P1** | Admin | `All Master Tables` | `/api/v1/admin/*` |
| **FEAT-15** | Reporting & Export | **P1** | Reporting | `Quotation`, `SalesOrder` | `GET /admin/reports/sales` |
| **FEAT-16** | Credit Note Generator | **P1** | Billing | `CreditNote` | `POST /subscriptions/:id/cancel` |
| **FEAT-17** | Kanban Pipeline | **P1** | Workspace | `Quotation` | `GET /quotations` |

---

## 6. Official 5-Minute Live Demo Feature Execution Map

```
Minute 0:00 - 1:00 (The Problem)
├── FEAT-01: Build quote for Acme Corp (Gold Tier)
└── FEAT-02: Show 18% Service discount breach (8 points over 10% ceiling)

Minute 1:00 - 2:15 (The Innovation: Deal Strategy Simulator)
├── FEAT-03: Blended Risk Score updates to 38.5 (Amber flag)
├── FEAT-05: Open Simulator -> Compare Scenario A (Status Quo) vs Scenario B (Recommended)
└── FEAT-06: Accept Upsell (2-Year Care Pack) -> Apply Scenario B (+730 bps margin)

Minute 2:15 - 3:15 (Governance & Restricted Portal Negotiation)
├── FEAT-04: Submit quote -> Auto-route to Sales Manager -> Approve with reason log
└── FEAT-07: Open Customer Portal in incognito (Data Masked) -> Submit counter-offer -> Confirm quote

Minute 3:15 - 4:15 (Operations & Hybrid Billing)
├── FEAT-08: Show Auto-Split across Main Hub (12 units) & East Depot (8 units)
├── FEAT-09: Show Hybrid Split (Commercial Invoice #INV-01 + Monthly Subscription #SUB-01)
└── FEAT-10: Demonstrate mid-cycle plan upgrade with exact day-count proration

Minute 4:15 - 5:00 (Management Radar & Closing Punchline)
├── FEAT-11: Open Deal Health Radar (Stalled quote alert + >2.5σ discount anomaly flag)
└── Tagline: "Don't just validate a deal. Explore it before the customer does."
```

---

## 7. Document Interoperability & Next Steps

This feature matrix provides the scope definitions for development. The final two documents in the suite complete the architectural blueprint:
1. `PRD.md` — Product Requirements & Core Philosophy *(Completed)*.
2. `User_flows.md` — User Stories & Step-by-Step State Machines *(Completed)*.
3. `Architecture.md` — Clean Layered System Architecture *(Completed)*.
4. `Database.md` — PostgreSQL Relational Schema & Prisma Models *(Completed)*.
5. `API.md` — RESTful Endpoint Specifications *(Completed)*.
6. `Features.md` — Feature Prioritization Matrix & Technical Specs *(Completed)*.
7. **`Memory.md`** *(Next Up)* — State Persistence, Audit Logging Ledger, Session Governance, and Simulation Caching.
8. `Pages.md` — Frontend View Layouts, Route Trees, and Component Hierarchy.
