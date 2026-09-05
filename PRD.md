# DealOrbit — Product Requirements Document (PRD)

> **Document Version:** 1.1.0 (Validated against Official Hackathon Specification & Master Strategy)  
> **Status:** Base Specification / Validated  
> **Official Problem:** *An Intelligent, Self-Governing Sales Operations Platform (Quotation-to-Cash)*  
> **Product Name:** **DealOrbit**  
> **Product Tagline:** *Don't just validate a deal. Explore it before the customer does.*  
> **Official Mockup Reference:** [Excalidraw Official Mockup](https://app.excalidraw.com/l/65VNwvy7c4X/7Fb5SR3WKu2)

---

## 1. Executive Summary & Problem Framing

### 1.1 The Real B2B Sales Operations Challenge
Most basic sales software models commerce as a trivial, one-way pipeline:
$$\text{Quotation} \longrightarrow \text{Order} \longrightarrow \text{Invoice}$$

Real-world enterprise B2B sales operations are inherently multi-dimensional, interconnected, and volatile. A single commercial transaction involves interdependent operational, financial, and relational constraints:
* **Margin & Discount Governance:** An unvetted $18\%$ discount on a service line destroys profitability, violates corporate category ceilings, and triggers multi-tier executive approval latency.
* **Logistics & Multi-Warehouse Fulfillment:** Changing product configurations reshuffles cross-warehouse inventory, splits orders into multiple regional shipments, inflates logistics costs, or triggers backorders.
* **Hybrid Billing & Subscriptions:** Bundling hardware with recurring software or support plans creates hybrid revenue streams that require simultaneous one-time invoicing, recurring billing schedules, mid-cycle proration math, and credit note handling.
* **Live Negotiation Dynamics:** Customer procurement contacts negotiate line-items and counter-offer discounts in real time, invalidating prior managerial sign-offs and forcing deals back into governance loops.
* **Management Blindspots:** Sales managers often only discover stalled deals, margin leakage, or rogue discounting long after deal velocity has stalled.

### 1.2 The DealOrbit Solution
**DealOrbit** places the **Deal at the center of the operational orbit**, surrounded by continuous gravitational forces: customer behavior, pricing governance, margin floors, inventory reality, multi-warehouse routing, approval chains, hybrid billing, and negotiation dynamics.

Rather than acting as another passive CRM, quotation form, or ungrounded AI chatbot, DealOrbit introduces an active, self-evaluating **Deal Strategy Engine** that operates as an intelligent co-pilot for sales representatives.

```
                    CUSTOMER (Procurement)
                              │
                              ▼
                   SALES REPRESENTATIVE
                     (Human Judgment)
                              │
                              ▼
             ╔═══════════════════════════════════╗
             ║             DEALORBIT             ║
             ║      DEAL STRATEGY ENGINE         ║
             ╚════════════════╤══════════════════╝
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      BUSINESS REALITY                 CUSTOMER REALITY
     ──────────────────               ──────────────────
     • Margin Floor & Ceilings        • Historical Purchase Profile
     • Tier & Category Ceilings       • Discount Sensitivity Corridor
     • Multi-Warehouse Inventory      • Negotiation Propensity
     • Multi-Tier Approval Chain      • Bundle / Add-on Acceptance
     • Hybrid Billing & Proration     • Acceptance Likelihood
              │                               │
              └───────────────┬───────────────┘
                              ▼
                DUAL-SIDED SCENARIO SIMULATOR
                              │
                              ▼
                MULTI-STRATEGY RECOMMENDATIONS
                     (Scenarios A, B, C)
                              │
                              ▼
                   SALES REPRESENTATIVE
                     (Strategic Choice)
                              │
                              ▼
                      EXECUTABLE DEAL
                              │
                              ▼
                  CUSTOMER PORTAL NEGOTIATION
                              │
                              └──────→ RE-SIMULATE ON COUNTER
```

---

## 2. Core Product Philosophy & Critical Boundaries

### 2.1 Tenet 1: Human-Led, System-Intelligent Selling
* **We do NOT replace the Sales Representative.**
* An enterprise sales rep possesses irreplaceable context: customer empathy, negotiation nuance, organizational politics, and commercial strategy.
* The system manages calculations, rule evaluation, inventory allocation, approval workflows, proration math, and predictive simulations.
* **The human knows the customer. The system knows the complexity. Together, they construct the optimal executable deal.**

### 2.2 Tenet 2: Required Functional Baseline ≠ Innovation
* The official specification mandates: multi-tier discount governance, blended risk scoring, approval routing, live upsell/cross-sell, multi-warehouse splitting, backorder handling, hybrid billing, subscription proration, customer portal negotiation, and deal health tracking.
* **Strategy:** Implement every baseline requirement with rock-solid, real application logic (never mocked or faked).
* **Innovation:** Build the **Deal Strategy Layer & Dual-Sided Simulator**, which transforms the quotation from a static document into an exploratory decision space.

### 2.3 Tenet 3: Grounded Simulation (No Pure LLM "Magic")
* Judges will ask: *"What is the simulation based on?"*
* If the answer is *"an ungrounded LLM hallucinating behavior,"* the credibility collapses.
* In DealOrbit, customer response predictions ($P(\text{Accept})$, $P(\text{Negotiate})$, $P(\text{Reject})$) are grounded in **empirical customer behavioral data**: historical purchase ranges, tier corridors, category price sensitivity, and prior discount acceptance patterns.

### 2.4 Product Guardrails (What We Must NOT Do)
* **DO NOT** present official requirements as our unique innovation.
* **DO NOT** build a generic conversational chatbot.
* **DO NOT** claim an AI magically predicts human behavior without observable data.
* **DO NOT** build half-working features; ensure complete, demonstrable end-to-end execution.
* **DO NOT** make the innovation too convoluted to demonstrate within a 5-minute presentation.

---

## 3. Target User Roles & Permissions Matrix

| Role | Core Responsibilities | System Access & UI Views |
| :--- | :--- | :--- |
| **System Administrator** | Master data setup: products, variants, price lists, discount tiers, warehouses, recurring plans, upsell rules. | Backend Configuration Area (`/admin/*`), Platform Analytics. |
| **Sales Representative** | Deal building, exploring strategies, applying discounts, adding upsell items, customer negotiation. | Sales Workspace, Quotation Builder, Deal Strategy Sandbox, Kanban Pipeline, Customer Thread. |
| **Sales Manager** | Tier-1 discount approvals, discount tier governance, deal health monitoring, rep performance benchmarking. | Approvals Inbox, Deal Health & Anomaly Radar, Team Analytics, Escalation Actions. |
| **Finance / Operations** | Tier-2 high-risk discount approvals, warehouse split oversight, backorder consolidation, hybrid billing & proration. | Finance Approval Queue, Warehouse Fulfillment Screen, Subscriptions & Invoicing Screen, Credit Notes. |
| **Customer (Portal User)** | Online quotation review, line-level inquiries, counter-discount proposals, one-click digital confirmation. | Dedicated Restricted Customer Portal (Tokenized link, no internal margins/costs/risk scores visible). |

---

## 4. Complete Functional Specifications (Baseline Modules)

### 4.1 Section A: Sales Backend (Configuration Area)

#### A1. Authentication & Workspace Access
* **Internal Users (Rep, Manager, Finance, Admin):** Sign up and login via email/password credentials with session tokens and role-based route guards.
* **Customer Portal Users:** Access via secure, unique tokenized links (magic links) or portal email/password authentication.
* **Workspace Entry:** Upon internal login, users access the sales workspace or navigate to the backend configuration area based on role permissions.

#### A2. Product & Price List Management
* **General Information:** SKU, Name, Category (`Hardware`, `Software`, `Services`), Base Unit Price, Unit of Measure (`Units`, `Hours`, `Months`), Applicable Tax Rate (%), Detailed Description.
* **Product Variants:** Attribute configurations (e.g., *Size*, *Pack*, *Tier*), attribute values, and associated delta pricing (+₹X).
* **Price Lists & Rules:** Tier-based pricing rules (Bronze, Silver, Gold, Enterprise) and currency-specific pricing configurations.

#### A3. Discount Tier & Approval Chain Setup
* **Customer Tier Ceilings:** Define default maximum allowable discount ceilings per tier:
  * Bronze: Up to $5\%$
  * Silver: Up to $10\%$
  * Gold: Up to $15\%$
  * Platinum / Enterprise: Up to $20\%$
* **Category-Specific Ceilings:** Independent category limits that govern specific line items:
  * *Hardware:* Up to $15\%$ (Healthier gross margins)
  * *Software Licenses:* Up to $20\%$ (Negligible marginal reproduction cost)
  * *Professional Services / Support:* Up to $10\%$ (Strict labor cost floors)
* **Approval Chain Rules:**
  * Discount $\le \text{Ceiling}$ and Blended Risk Score $\le 20 \longrightarrow$ **Auto-Approved**.
  * Discount over ceiling or Blended Risk Score $20 - 50 \longrightarrow$ **Sales Manager Approval**.
  * Severe violation or Blended Risk Score $> 50 \longrightarrow$ **Sales Manager followed by Finance Director**.
* **Audit Trail Requirements:** All approval decisions (`APPROVED`, `REJECTED`, `CHANGES_REQUESTED`) must log: `User`, `Role`, `Timestamp`, `Previous State`, `New State`, and `Mandatory Reason`.

#### A4. Warehouse & Fulfillment Setup
* **Warehouse Management:** Setup physical nodes (e.g., *"Main Warehouse"*, *"East Depot"*, *"West Hub"*).
* **Stock & Replenishment Rules:** Live on-hand stock counts, re-order trigger levels, and replenishment lead times per warehouse.
* **Shipping Cost Weighting:** Configurable distance/cost multipliers used by the auto-split allocation algorithm to minimize total shipment count and logistics overhead.

#### A5. Subscription & Recurring Plan Setup
* **Billing Frequencies:** Recurring plans (`Monthly`, `Quarterly`, `Yearly`) attachable to software licenses or support services.
* **Proration Rules:** Exact day-count proration formula for mid-cycle quantity changes or tier upgrades.
* **Cancellation & Refund Rules:** Automated calculation of unconsumed service balances and credit note triggers upon contract termination.

#### A6. Upsell & Cross-Sell Rule Setup
* **Rule Definitions:** Product pairing associations driven by historical co-purchase graphs (e.g., `Server X` $\rightarrow$ `Care Pack Gold`).
* **Promotional Boosts:** Flag SKUs as *Promoted* to elevate recommendation ranking.
* **Margin Safety Floors:** Configurable minimum gross margin threshold (e.g., $18\%$) below which upsell suggestions are suppressed.

#### A7. Reporting & Analytics Configuration
* **Sales Performance Dashboard:** High-level metrics tracking total pipeline value, booked revenue, average deal cycle time, and blended discount averages.
* **Data Export:** Instant export of quotation, order, and sales data to **PDF** and **XLS (Excel)** formats.
* **Granular Reporting Filters:**
  * *Period:* Today, This Week, This Month, Custom Date Range.
  * *Sales Team / Rep:* Individual rep vs. aggregate team performance.
  * *Approval Status:* Filter by Pending, Approved, or Rejected deals.
  * *Product / Category:* Track best-selling SKUs and most-heavily-discounted categories.

---

### 4.2 Section B: Sales Frontend (Rep Workspace Experience)

#### B1. Sales Workspace & Navigation Menu
* **Top Navigation:**
  * `Quotations`: Direct list view of active, draft, and closed quotations.
  * `Pipeline`: Interactive Kanban board organized by deal stage (`Draft`, `Under Review`, `Negotiating`, `Confirmed`, `Fulfillment`).
* **Header Actions:**
  * `Reload Data`: Instantly refreshes pricing rules, warehouse inventory counts, and approval statuses from the backend.
  * `Go to Backend`: Opens administrative settings and configuration (role-gated).
  * `Close Workspace`: Ends the active working session.

#### B2. Quotation List & Pipeline View
* **Card-Based Pipeline:** Selectable cards displaying Customer Name, Deal Value, Active Stage, Blended Risk Badge, and Assigned Rep (e.g., *"Acme Corp — ₹10,00,000 — Draft"*, *"Beta Industries — ₹4,50,000 — Pending Manager Approval"*).
* **Quick Access:** Clicking any card opens the Quotation Builder for that specific transaction.

#### B3. Quotation Builder Screen (Products + Cart)
* **Product Catalog Selector:** Filter and select products across Hardware, Services, and Subscriptions.
* **Quantity & Discount Controls:** Real-time quantity adjustments (`+/-`) and line-level or order-level discount inputs (%).
* **Live Margin & Subtotal Indicator:** Instant recalculation of line totals, line gross margins, and aggregate deal margin badge.
* **Immediate Ceilings & Feasibility Indicators:**
  * Visual highlight (amber badge) when a line exceeds customer or category discount ceilings.
  * Live warehouse inventory feasibility indicator (*"Available: 15 / Requested: 20 — 5 Shortage"*).
* **Action Buttons:** `[Save Draft]`, `[Simulate Deal Strategy]`, `[Confirm & Move to Approval / Fulfillment]`.

#### B4. Discount Approval Screen
* **Blended Risk Score Display:** Visual gauge showing aggregate risk score with itemized violation breakdowns.
* **Approval Chain Sequence:** Visual stepper depicting required reviewers (`Sales Manager`, and `Finance Director` when required).
* **Reviewer Actions:**
  * `[Approve]` — Progresses deal with mandatory confirmation.
  * `[Reject]` — Terminates deal with recorded rationale.
  * `[Return for Revision]` — Sends deal back to rep with mandatory feedback comments.
* **Audit Trail Card:** Append-only ledger displaying reviewer name, action taken, timestamp, and logged notes.

#### B5. Upsell & Cross-Sell Panel (Special Flow)
* **Contextual Placement:** Docked alongside the active quotation cart.
* **Ranked Recommendations:** Displays suggestions based on co-purchase history and active promotion flags.
* **Card Information:**
  * Suggested Product Name & SKU.
  * Live Margin Delta ($\Delta\%$ Gross Margin if added).
  * Promotion Tag (e.g., `PROMOTED`, `POPULAR PAIRING`).
* **Actions:**
  * `[Add to Quote]` — Automatically injects item into cart and updates totals/margins immediately.
  * `[Dismiss]` — Removes card from current recommendation stack.

#### B6. Fulfillment & Warehouse Split Screen
* **Live Stock Allocation:** Analyzes inventory across regional warehouses (e.g., Main Warehouse, East Depot).
* **Recommended Split Display:**
  * Warehouse Name.
  * Quantity allocated from that node.
  * Estimated shipment count and associated logistics cost weighting.
* **Operations Actions:**
  * `[Accept Suggested Split]` — Commits auto-split allocation.
  * `[Manual Override]` — Allows warehouse managers to adjust quantities per location manually.
* **Backorder Consolidation Prompt:** When partial stock is fulfilled, a linked `BACKORDER` record is generated. When stock arrives mid-fulfillment via replenishment, a **"Consolidate Remaining Backorder"** prompt appears automatically.

#### B7. Subscription & Billing Screen
* **Split Line Presentation:** Clean visual separation between One-Time Product Lines and Recurring Subscription Lines on the same order.
* **Upcoming Billing Schedule:** Visual calendar/schedule showing future recurring charge dates and amounts (Monthly, Quarterly, Annually).
* **Mid-Cycle Proration Calculator:** Handles mid-term quantity or tier alterations, displaying prorated charge or credit amounts.
* **Contract Controls:** `[Modify Subscription]`, `[Cancel Subscription]` with automated credit note generation.

#### B8. Restricted Customer Portal Negotiation Screen
* **Separate Restricted Environment:** Dedicated interface accessible by the customer without internal internal financial data.
* **Quotation Overview:** Displays formal proposal details, specifications, quantities, list prices, approved discounts, and status (`Sent`, `Under Negotiation`, `Confirmed`).
* **Interactive Collaboration:**
  * **Line-Level Commenting:** In-line inquiry and change request tool for specific items.
  * **Counter-Discount Tool:** Field for proposing counter-discounts or alternate quantities.
* **Customer Actions:**
  * `[Submit Request]` — Transmits counter-offer back to the sales workspace.
  * `[Confirm Quotation]` — Digitally signs and accepts terms.
* **Self-Governing Invalidation Rule:** If the customer counters and terms breach discount ceilings, DealOrbit automatically revokes prior approvals and re-routes the quote into the B4 approval workflow.

#### B9. Deal Health & Anomaly Dashboard
* **Stalled Deals Monitor:** Flags quotes inactive beyond a configured SLA (e.g., $> 7$ days without customer or rep activity).
* **Discount Anomaly Alerts:** Emits an alert when a rep proposes a discount significantly exceeding their personal 90-day moving average or peer benchmark ($> 2.5\sigma$).
* **Delivery Promise Slippage:** Alerts managers when warehouse lead times exceed promised customer delivery dates.
* **Direct Intervention:** Clicking any alert opens the deal directly. Managers can trigger automated nudges or escalate to department heads.

---

## 5. Mathematical Formulations & The Blended Risk Score

### 5.1 The Blended Discount Risk Score
As specified in Page 11–12 of the official problem statement, risk evaluation must look at the **total pattern across the quotation**, not merely the single worst line item.

#### The Problem Scenario:
* Customer Tier: **Gold** (Allowed up to $15\%$ baseline).
* Category Rules: **Hardware** allowed up to $15\%$; **Services** allowed only up to $10\%$.
* Quote Lines:
  * Laptop (Hardware): Given $12\%$ discount (Allowed $15\%$) $\rightarrow$ Compliant.
  * Setup Service (Service): Given $18\%$ discount (Allowed $10\%$) $\rightarrow$ **Violation (+8 points over)**.
* **Result:** Even though the aggregate discount is within $15\%$, the service line violates its category limit, requiring managerial intervention.

#### The "Blended" Leakage Pattern:
Multiple lines with minor violations (e.g., $+2\%$, $+3\%$, $+2\%$) quietly accumulate massive enterprise margin leakage.

#### Exact Mathematical Formula:
$$\text{Risk Score} = w_1 \cdot \sum_{i=1}^{n} \left( \frac{\text{Line Amount}_i}{\text{Total Amount}} \cdot \max(0, \text{Discount}_i - \text{Ceiling}_i) \right) + w_2 \cdot (1 - \text{Deal Margin}) + w_3 \cdot \text{Rep Volatility Index}$$

Where:
* $w_1 = 4.0$ (Weighted category discount leakage factor)
* $w_2 = 25.0$ (Gross margin erosion penalty factor)
* $w_3 = 10.0$ (Rep historical deviation factor)

| Blended Risk Score Range | Risk Classification | Action Required |
| :---: | :---: | :--- |
| **Score $< 20$** | **Low Risk** | Auto-Approved. Direct move to fulfillment or customer dispatch. |
| **Score $20 - 50$** | **Medium Risk** | Sales Manager Approval required. |
| **Score $> 50$** | **High Risk** | Two-Tier Sequential: Sales Manager followed by Finance Director. |

### 5.2 Subscription Proration Formula
For mid-cycle subscription changes (e.g., upgrading from Plan A to Plan B on Day $d$ of a $D$-day billing period):
$$\text{Prorated Charge} = \left( \frac{D - d}{D} \right) \times (\text{Rate}_{\text{New}} - \text{Rate}_{\text{Old}})$$

If unconsumed service is canceled:
$$\text{Credit Note Amount} = \left( \frac{D - d}{D} \right) \times \text{Rate}_{\text{Paid}}$$

---

## 6. The Innovation Layer: Deal Strategy Engine & Dual-Sided Simulator

Traditional quoting platforms validate deals *after* the sales rep constructs them. DealOrbit empowers the sales rep to **explore the decision space before committing**.

```
                           CURRENT QUOTE CONFIGURATION
                      (Products, Discounts, Add-ons, Terms)
                                        │
                                        ▼
                      ╔════════════════════════════════╗
                      ║      DEAL STRATEGY ENGINE      ║
                      ╚════════════════╤═══════════════╝
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
      [BUSINESS-SIDE SIMULATION]                 [CUSTOMER-SIDE SIMULATION]
      • Net Blended Margin                       • Grounded Behavioral Profile
      • Blended Risk Score                       • Historical Discount Range (8–12%)
      • Required Approval Tiers                  • Price Sensitivity Index: High
      • Fulfillment Splits (Shipments)           • Add-on Service Acceptance: High
      • 12-Month Recurring Run Rate (ARR)        • Predicted Outcomes:
                                                   - Accept: 48%
                                                   - Negotiate: 42%
                                                   - Reject: 10%
                 │                                           │
                 └─────────────────────┬─────────────────────┘
                                       ▼
                       SCENARIO EXPLORER & SYNTHESIZER
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
[SCENARIO A: Aggressive]     [SCENARIO B: Recommended]     [SCENARIO C: Conservative]
• Discount: 15%              • Discount: 10% + 2Yr War.    • Discount: 7% + Prem Support
• Margin: 14%                • Margin: 21.5%               • Margin: 25.2%
• Approvals: Finance         • Approvals: Mgr Only         • Approvals: None (Instant)
• Acceptance: 48%            • Acceptance: 68%             • Acceptance: 58%
• Risk: High                 • Risk: Low-Medium            • Risk: Negligible
```

### 6.1 Dual-Sided Simulation Mechanics

#### 1. Business-Side Simulation:
* **Margin Impact:** Real-time calculation of net margin dollars and gross margin percentage across the entire cart.
* **Governance Impact:** Computes the Blended Risk Score and maps the exact approval sequence required.
* **Logistics Impact:** Checks multi-warehouse inventory to project shipment count and logistics overhead.
* **Revenue Profile:** Projects immediate one-time cash vs. 12/24/36-month Annual Recurring Revenue (ARR).

#### 2. Customer-Side Simulation:
* Grounded in the **Customer Negotiation Profile** (stored empirical history):
  * *Acme Corp:* High hardware price sensitivity, historical accepted discount range: $8\% - 12\%$, high willingness to accept service/warranty bundles, low payment-term flexibility.
* **Calculates Probabilities:**
  * $P(\text{Acceptance})$: Likelihood of frictionless sign-off.
  * $P(\text{Negotiation})$: Likelihood of counter-offer, including predicted counter targets (e.g., *“Customer likely to counter for +3% discount or Net 60”*).
  * $P(\text{Rejection})$: Likelihood of deal stalling or dropping out.

### 6.2 The Three-Scenario Synthesis
DealOrbit automatically projects three strategic pathways:
1. **Scenario A (Status Quo / High Discount):** Maximum initial customer discount ($15\%$), but compressed margin ($14\%$) and slow multi-tier approvals.
2. **Scenario B (Recommended / Balanced):** Trims hardware discount to $10\%$, attaches a 2-Year Extended Care Pack at a promotional price. Yields $21.5\%$ margin, raises customer acceptance probability to $68\%$, and requires only a single manager approval.
3. **Scenario C (Margin Preservation):** Tight discount ($7\%$) with premium SLA. Delivers $25.2\%$ margin and zero approval latency, with a moderate acceptance rate ($58\%$).

The Sales Rep can review the trade-off matrix and click **[Apply Scenario]** to reconfigure the quote instantly.

---

## 7. Official 8-Step Quick Test Flow (Acceptance Benchmark)

This section maps directly to Page 11 of the official hackathon specification. The application must pass this end-to-end verification sequence:

| Step | Action | Expected Outcome | Verification Metric |
| :---: | :--- | :--- | :--- |
| **1** | Admin signs up/logs in; sets up Gold Tier ($15\%$), Main + East Warehouses, and Monthly Subscription Plan. | Data saved successfully in database. | Configuration tables populated. |
| **2** | Rep creates quote for Gold Customer; adds Service line with $18\%$ discount ($> 10\%$ ceiling). | Line flagged in amber; Blended Risk Score updates; "Manager Approval Required" status shown. | Automatic rule detection. |
| **3** | Rep clicks submit. | Quote automatically routes to Sales Manager approval inbox without manual rep request. | Automated state transition. |
| **4** | Rep accepts live upsell recommendation. | Order total, gross margin badge, and recurring ARR update immediately. | In-line calculation update. |
| **5** | Sales Manager logs in and approves quote with mandatory reason logged. | State changes to `APPROVED`; system generates recommended warehouse split (e.g., 12 from Main, 8 from East). | Audit logged + logistics split. |
| **6** | Convert quote to order. | System splits order into two linked records: One-Time Invoice + Recurring Subscription Schedule. | Hybrid billing generation. |
| **7** | Open Customer Portal link; submit counter-discount as customer. | Quote status transitions to `NEGOTIATING`; prior approval is revoked; quote automatically re-enters approval flow. | Self-governing invalidation. |
| **8** | Customer accepts terms; Finance records payment. | Order confirmed; invoice marked `PAID`; warehouse split manifests marked `READY_FOR_PICKING`. | End-to-end completion. |

---

## 8. Technical Architecture & Implementation Guidelines

* **Fullstack Stack:**
  * **Frontend:** Next.js 16 (React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion).
  * **Backend:** Node.js & Express with Clean Layered Architecture (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories).
  * **Database & ORM:** PostgreSQL with Prisma ORM (supports local Docker and Neon Cloud).
* **Authentic Business Logic:** Core rules (risk scoring, warehouse splitting, subscription proration, customer negotiation) must be executed in actual server-side application logic—never hardcoded or faked.
* **Separation of Customer Portal:** The customer negotiation interface must be an isolated, token-authenticated, restricted view that strictly excludes internal operational data (margins, COGS, risk scores).
* **Performance SLAs:**
  * Blended risk score calculation: $< 50\text{ms}$.
  * Dual-sided deal simulation: $< 150\text{ms}$.
  * Warehouse auto-split optimization: $< 80\text{ms}$.

---

## 9. Hackathon Demonstration Strategy (5-Minute Script)

* **Minute 0:00 – 1:00 (The Problem):** Demonstrate traditional quoting friction: arbitrary discounting, unseen margin erosion, stockout blindspots.
* **Minute 1:00 – 2:15 (The Deal Strategy Simulator):** Build a quotation for Acme Corp. Show the $18\%$ service violation and inventory shortage. Launch the Deal Strategy Simulator: compare Scenario A vs Recommended Scenario B (10% discount + 2-Yr Care Pack). Apply Scenario B with one click.
* **Minute 2:15 – 3:15 (Approval & Customer Portal):** Submit quote. Show automated Manager approval with reason logging. Switch to incognito Customer Portal: show line-item negotiation and one-click digital confirmation.
* **Minute 3:15 – 4:15 (Operations & Hybrid Billing):** Show automated warehouse splitting across Main Hub (12) and East Depot (8). Show hybrid split: immediate commercial invoice + monthly subscription billing schedule. Demonstrate mid-cycle proration calculator.
* **Minute 4:15 – 5:00 (Deal Health & Closing):** Open Deal Health Dashboard: highlight stalled deal alerts, discount anomaly flags, and delivery slippage indicators. Close on core value proposition: *"Don't just validate a deal. Explore it before the customer does."*

---

## 10. PRD Sign-off & Document Interoperability

This PRD serves as the authoritative blueprint for DealOrbit. The subsequent documentation files strictly derive from this specification:
1. `User_flows.md` — Detailed step-by-step user interaction states and UI transitions.
2. `Architecture.md` — Clean layered architecture, system components, simulation engine, and state machines.
3. `Database.md` — Relational schema design, Prisma models, enums, and seed data.
4. `API.md` — RESTful endpoint contracts, request/response JSON schemas, and error definitions.
5. `Features.md` — Feature-by-feature acceptance criteria and test matrices.
6. `Memory.md` — State persistence, caching, session governance, and audit trails.
7. `Pages.md` — Frontend view layouts, route trees, and component trees.
