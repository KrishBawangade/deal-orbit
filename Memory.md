# DealOrbit — System Memory & Project Progress Ledger (Memory.md)

> **Document Version:** 1.0.0  
> **Status:** Active / Living Project Memory  
> **Target System:** DealOrbit (Intelligent, Self-Governing Sales Operations Platform)  
> **Document Purpose:** Serves as the authoritative source of truth for all historical decisions, completed tasks, architectural milestones, state persistence models, and pending execution roadmaps for agents and engineers.

---

## 1. Project Master Context & Core Decisions

### 1.1 Project Identity & Purpose
* **Project Name:** **DealOrbit** *(Not DealFlow360, QuoteAI, or CRM++)*
* **Core Metaphor:** The **Deal sits at the center of the orbit**, with pricing, margin, inventory, fulfillment, approvals, billing, and live customer negotiation revolving around it.
* **Tagline:** *Don't just validate a deal. Explore it before the customer does.*
* **Official Hackathon Problem:** *"An Intelligent, Self-Governing Sales Operations Platform (Quotation-to-Cash)."*
* **Primary Philosophy:** **Human-Led, System-Intelligent Selling.** We do NOT replace the sales representative. The human manages the customer relationship, context, and negotiation strategy; the system governs calculations, constraints, inventory, proration, and risk.

### 1.2 Baseline Requirements vs. True Innovation Boundary
A critical team principle established early in product definition:
* **Required Baseline (NOT our innovation):** Multi-tier discount governance, Blended Discount Risk Score, approval routing, live upsell/cross-sell, multi-warehouse splitting, backorders, hybrid billing, subscription proration, customer portal negotiation, and deal health tracking. *Strategy: Implement with rock-solid, authentic server-side business logic (never mocked or faked).*
* **DealOrbit's True Innovation:** The **Deal Strategy Engine & Dual-Sided Simulator**. Turns the quotation into an exploratory decision space where sales reps can simulate business consequences (margin, risk, approvals, logistics) and grounded customer response probabilities (Acceptance, Negotiation, Rejection based on empirical profile) before committing.

---

## 2. Completed Milestones & Documentation Registry

The following technical specifications have been drafted, cross-validated against the official 13-page hackathon specification, and verified:

| File Name | Version | Primary Purpose & Contents | Verification Status |
| :--- | :---: | :--- | :---: |
| **[`PRD.md`](file:///c:/projects/next/js/projects/deal-orbit/PRD.md)** | `v1.1.0` | Product requirements, 8 baseline modules, innovation framework, mathematical formulas, 8-step quick test flow, 5-minute pitch script. | **Approved & Validated** |
| **[`User_flows.md`](file:///c:/projects/next/js/projects/deal-orbit/User_flows.md)** | `v1.1.0` | Comprehensive user stories for all 5 personas (Given-When-Then format), 8 sequence diagrams, state machines, and edge-case exception matrix. | **Approved & Validated** |
| **[`Architecture.md`](file:///c:/projects/next/js/projects/deal-orbit/Architecture.md)** | `v1.0.0` | C4 topology (Levels 1 & 2), Clean Layered Backend (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories), Next.js 16 frontend design, physical DTO data masking, and calculation engines. | **Approved & Validated** |
| **[`Database.md`](file:///c:/projects/next/js/projects/deal-orbit/Database.md)** | `v1.0.0` | Complete PostgreSQL ERD, copy-paste ready Prisma Schema (`schema.prisma`), optimistic concurrency locking, compound indexes, and seed dataset. | **Approved & Validated** |
| **[`API.md`](file:///c:/projects/next/js/projects/deal-orbit/API.md)** | `v1.0.0` | Complete REST API endpoint contracts across 10 modules, request/response JSON schemas, error codes (`409 Conflict`), and customer portal endpoints. | **Approved & Validated** |
| **[`Features.md`](file:///c:/projects/next/js/projects/deal-orbit/Features.md)** | `v1.0.0` | Feature prioritization matrix (P0 Main, P1 Secondary, P2 Tertiary), technical specs, dependency mapping, and 5-minute live demo execution map. | **Approved & Validated** |
| **[`Memory.md`](file:///c:/projects/next/js/projects/deal-orbit/Memory.md)** | `v1.0.0` | *(This Document)* Living project ledger, state persistence architecture, session governance, and progress memory. | **Active** |
| **`Pages.md`** | `v1.0.0` | *(Next Up)* Complete frontend view architecture, App Router trees, page wireframes, and component hierarchies. | *Pending* |

---

## 3. System Memory & Persistence Architecture (Application Layer)

DealOrbit maintains state and context across four concentric memory layers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEALORBIT STATE & MEMORY ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. EPHEMERAL CLIENT MEMORY (React 19 State / Zustand / URL Query Params)    │
│    • Active cart modifications, What-If slider adjustments                  │
│    • Uncommitted simulation scenarios, in-line filter states                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SESSION & TOKEN MEMORY (JWT Access & Refresh Token Rotation)             │
│    • Short-lived JWTs (15 min) in Authorization headers                     │
│    • Persistent Refresh Tokens stored in DB with device metadata            │
│    • Secure Portal Tokens (UUIDv4) with 14-day validity for customers       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. TRANSACTIONAL APPLICATION MEMORY (PostgreSQL via Prisma ORM)             │
│    • Living quotations, line items, version numbers                         │
│    • Warehouses, live stock levels, sales orders, fulfillment splits        │
│    • Hybrid invoices, subscription contracts, recurring billing schedules   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. IMMUTABLE AUDIT LEDGER MEMORY (Append-Only Governance Store)             │
│    • Immutable history of all approvals, rejections, and revision comments │
│    • Revocation logs triggered by quote mutation or counter-offers          │
│    • Proration calculation snapshots and credit note audit trails           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Concurrency & Mutation Memory (Optimistic Locking)
* **The Problem:** A sales rep might adjust discounts at the same time a customer counters in the portal.
* **The Memory Rule:** Every quotation holds an integer `version` field.
* **The Execution:** When saving modifications, the backend executes:
  ```sql
  UPDATE quotations 
  SET status = $new_status, version = version + 1 
  WHERE id = $id AND version = $expected_version;
  ```
* If zero records are updated, the request is rejected with `409 Conflict: Concurrent Mutation Detected`.

### 3.2 Customer Negotiation Memory & Invalidation Rule
* **The Problem:** An approved quote is published; the customer counters for a higher discount.
* **The Memory Rule:** Approval state is **ephemeral with respect to quote mutations**.
* **The Execution:**
  1. The counter-offer is logged in `customer_negotiation_threads`.
  2. The existing `ApprovalRequest` is marked `REVOKED_BY_MUTATION`.
  3. The `Quotation` status automatically reverts to `NEGOTIATING / IN_REVIEW`.
  4. The `RiskScoringEngine` recalculates the Blended Risk Score based on the customer's proposed figures.

### 3.3 Simulation Caching & Scenario Memory
* What-If simulations executed by the `DealStrategyService` are persisted in the `deal_strategy_simulations` table linked to the parent `quotationId`.
* Stores:
  * Scenario Name (`SCENARIO_A`, `SCENARIO_B`, `SCENARIO_C`).
  * Simulated Discount %, Simulated Margin %, Simulated Risk Score.
  * Predicted Customer Outcome Probabilities ($P(\text{Accept})$, $P(\text{Negotiate})$, $P(\text{Reject})$).
  * `configurationJson`: Complete line item overrides and promotional bundle IDs.
  * `isApplied`: Boolean flag indicating which scenario the sales rep committed to the active cart.

---

## 4. Key Architectural & Mathematical Formulations

To ensure consistency across future coding tasks, these key algorithms are standardized:

### 4.1 Blended Discount Risk Score Formula
$$\text{Risk Score} = 4.0 \cdot \sum_{i} \left( \frac{\text{Line Amount}_i}{\text{Total Amount}} \cdot \max(0, \text{Discount}_i - \text{Ceiling}_i) \right) + 25.0 \cdot \max(0, 0.20 - \text{DealMargin}) + 10.0 \cdot \text{RepVolatility}$$
* Score $< 20$: Auto-approved.
* Score $20 - 50$: Sales Manager required.
* Score $> 50$: Sales Manager followed by Finance Director.

### 4.2 Exact Day-Count Subscription Proration Formula
$$\text{Prorated Delta} = \left( \frac{D - d}{D} \right) \times (\text{New Plan Rate} - \text{Old Plan Rate})$$
Where:
* $D$ is the total number of calendar days in the active billing period (e.g., 30, 31, 365).
* $d$ is the number of days elapsed prior to the modification date.

### 4.3 Grounded Customer Acceptance Probability Formula
$$P(\text{Accept}) = \text{BaseAcceptance} \times \left( 1 - \frac{\max(0, \text{TargetDisc} - \text{ProposedDisc})}{\text{HistSpan}} \right) + \text{BundleAffinityBonus}$$
* Calibrated against Acme Corp's empirical corridor ($8\% - 12\%$).
* If proposed discount is $< 8\%$, $P(\text{Negotiate})$ spikes.
* If proposed discount is $> 12\%$, $P(\text{Accept})$ plateaus while company margin leaks.
* Adding a bundled service/warranty boosts $P(\text{Accept})$ by up to $+20\%$ due to high service affinity ($0.85$).

---

## 5. Current Workspace State & Next Action Items

### 5.1 Workspace Health & Codebase State
* **Root Directory:** `c:\projects\next js projects\deal-orbit`
* **Docker Compose:** Configured for `postgres:16`, `backend (Node.js/Express)`, and `frontend (Next.js 16)`.
* **Database Connection:** Pre-configured for local Docker PostgreSQL (`deal_orbit`) and Neon Cloud.
* **Backend Skeleton:** Express routes, controllers, and Prisma client initial structure established in `backend/src/`.
* **Frontend Skeleton:** Next.js 16 App Router with Tailwind CSS v4 initialized in `frontend/app/`.

### 5.2 Immediate Next Steps (Sequential Roadmap)
1. **Document 8:** Complete **`Pages.md`** (Frontend view architecture, App Router trees, page layouts, component hierarchies, and wireframes).
2. **Phase 1 Implementation:**
   * Push the updated Prisma schema from `Database.md` to PostgreSQL (`npm run db:push`).
   * Seed the database with demo users, customers (Acme, Beta, StartUp), warehouses, and products (`prisma/seed.ts`).
3. **Phase 2 Implementation:**
   * Build core backend domain services: `DiscountGovernanceService`, `RiskScoringEngine`, `ApprovalWorkflowService`, `DealStrategyService`, `FulfillmentService`, and `HybridBillingService`.
4. **Phase 3 Implementation:**
   * Build Next.js 16 frontend screens: Quotation Builder, Deal Strategy Simulator Modal, Approval Inbox, Restricted Customer Portal, and Deal Health Radar.
5. **Phase 4 Verification:**
   * Execute the Official 8-Step Quick Test Flow end-to-end and rehearse the 5-minute live pitch.
