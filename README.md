# 🪐 DealOrbit — Intelligent, Self-Governing Sales Operations Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express&logoColor=black)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.0-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br />

**"Don't just validate a deal. Explore it before the customer does."**

*A Next-Generation Configure, Price, Quote (CPQ), AI Deal Strategy Simulation, Multi-Tier Governance, Intelligent Multi-Warehouse Fulfillment, and Hybrid Subscription Billing Platform.*

</div>

---

## 📖 Executive Summary & Problem Framing

Traditional enterprise CRM and quotation tools treat B2B sales as a trivial, one-way conveyor belt:  
$$\text{Quotation} \longrightarrow \text{Order} \longrightarrow \text{Invoice}$$

In reality, enterprise B2B sales operations are volatile and interconnected:
* **Margin & Discount Blindspots**: A rogue 18% discount on a service line erodes gross margins, violates account ceilings, and triggers multi-tier executive approval delays.
* **Inventory & Multi-Warehouse Splitting**: Line item changes reshuffle stock across regional warehouses, causing split shipments, carrier surcharges, and backorders.
* **Hybrid Billing Complexity**: Bundling one-time capital hardware with recurring SaaS or SLA support plans requires simultaneous billing schedules, mid-term proration, and automated credit notes.
* **Real-time Counter-Offer Negotiations**: Customer procurement contacts negotiate terms dynamically, invalidating prior managerial approvals and forcing deals back into governance reviews.

**DealOrbit** places the **Deal at the center of the operational orbit**, surrounded by continuous gravitational forces: customer behavior, pricing governance, margin floors, inventory reality, multi-warehouse routing, approval chains, hybrid billing, and negotiation dynamics.

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
      • Margin Floors & Ceilings       • Historical Purchase Profile
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
              (Aggressive, Balanced, Conservative)
```

---

## ✨ Key Features & Capabilities

### ⚡ 1. Living Quotation Builder & CPQ Engine
- **Multi-Category Line Items**: Unified catalog supporting Hardware (physical capital goods), Software (licenses/cloud seats), and Services (SLA/consulting).
- **Dynamic Profitability Recalculation**: Instant recalculation of line-level Cost of Goods Sold (COGS), individual gross margins, and order-level blended margin badges.
- **Guardrails & Ceiling Compliance**: Automatic violation flags when discounts breach customer tier limits (Bronze, Silver, Gold, Platinum) or product category ceilings.
- **Inventory Feasibility**: Cross-checks multi-warehouse stock in real time, alerting reps before backorders occur.

### 🤖 2. Gemini-Powered Deal Strategy Simulator
- **Dual-Sided Behavioral Analytics**: Evaluates customer price elasticity, historical procurement tendencies, and negotiation patterns.
- **Multi-Scenario Trade-Offs**: Simulates three distinct closing options:
  - **Option A (Aggressive)**: Maximizes short-term revenue with low discount tolerance.
  - **Option B (Balanced)**: Optimal win-rate and healthy blended gross margin balance.
  - **Option C (Conservative / Value-Add)**: Preserves margins by bundling software and SLA services in lieu of cash discounts.
- **Actionable AI Copilot**: One-click application of recommended discounts directly to the live quotation.

### 🛡️ 3. Multi-Tier Governance & Approvals Inbox
- **Dynamic Approval Routing**:
  - **Tier-1**: Sales Manager approval triggered when discounts breach baseline ceilings.
  - **Tier-2**: Finance Director approval required when blended margins fall below danger thresholds or deal size breaches enterprise limits.
- **Risk Assessment Scoring**: Automated 0–100 risk score based on margin compression, customer credit, and contract terms.
- **Auditing & Digital Sign-off**: Immutable audit logs with timestamped managerial sign-offs, revision return notes, and digital e-signatures.

### 📦 4. Automated Multi-Warehouse Fulfillment
- **Intelligent Order Splitting**: Automatically evaluates regional warehouse availability (North, West, South hubs) and splits sales orders into optimized shipments.
- **Inventory Reservation & Release**: Real-time stock reservation upon quote approval, preventing phantom stock allocation.
- **Logistics & Carrier Integration**: Generates package tracking codes, estimated delivery windows, and shipment timelines.

### 💳 5. Hybrid Billing, Subscriptions & Proration
- **Hybrid Revenue Engine**: Invoices one-time capital hardware while establishing recurring subscription contracts for software seats and support.
- **Flexible Billing Frequencies**: Monthly, Quarterly, and Annual recurring billing runs.
- **Mid-Cycle Proration Calculator**: Mathematically sound proration calculations for mid-cycle seat additions, tier upgrades, plan downgrades, and cancellations.
- **Credit Note Generation**: Automatic credit note generation for cancelled subscriptions or revised agreements.

### 🌐 6. Customer Proposal Room & Negotiation Portal
- **Zero-Confidential-Leakage Customer Hub**: External customer portal (`/portal/:token`) displaying client pricing, deliverables, and terms while strictly excluding internal margins, COGS, and risk scores.
- **Interactive Counter-Offer Negotiations**: Allows customers to submit notes or counter-proposals that sync directly to the sales rep's inbox.
- **Digital E-Signature & Instant Conversion**: Customers sign agreements online, instantly converting quotations into verified Sales Orders and active Subscription Contracts.

### 💫 7. Universal GPU-Accelerated Shimmer Loading Engine
- **Hardware-Accelerated Specular Sweep**: Zero-CLS sweeping light-wave skeleton loaders powered by GPU `transform: translateX` with custom cubic-bezier easing.
- **Full Theme Adaptation**: Custom specular gradients tailored for both crisp light mode and ambient dark glassmorphism.
- **Complete Coverage**: Integrated across KPI telemetry, filter counts, multi-column tables, deal cards, Kanban boards, and the customer portal.

---

## 🏗️ System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEALORBIT PLATFORM                              │
├────────────────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js 16 + React 19 + TypeScript + Tailwind CSS v4)      │
│  • App Router (Workspace Routes: /dashboard, /pipeline, /quotations,   │
│                /approvals, /fulfillment, /billing; Portal: /portal)     │
│  • Telemetry KPI Tiles, Glassmorphic Design System, GPU Shimmer       │
│  • QuotationsContext with instant cross-tab sync & optimistic state   │
├────────────────────────────────────────────────────────────────────────┤
│  BACKEND API (Node.js + Express + Clean Layered Architecture)          │
│  • Routes  ──▶  Controllers  ──▶  Services  ──▶  Repositories         │
│  • Zod Request Validation & Centralized Error Boundary Middleware     │
│  • Gemini AI Deal Strategy Simulation Engine                          │
├────────────────────────────────────────────────────────────────────────┤
│  PERSISTENCE & DATA (Prisma ORM 6.4 + PostgreSQL 16)                   │
│  • Users & Roles (Sales Rep, Sales Manager, Finance Director, Admin)  │
│  • Customers, Products, Warehouses, Inventory Lots                     │
│  • Quotations, Quotation Lines, Audit Trail, Negotiation Messages      │
│  • Sales Orders, Shipments, Subscription Contracts, Invoices           │
└────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.3.4** | Turbopack engine, React 19 Server & Client Components, App Router |
| **Styling & Theme** | **Tailwind CSS v4** | CSS variables, modern glassmorphism, responsive light & dark themes |
| **Animation & UX** | **Framer Motion & Custom CSS** | Hardware-accelerated `@keyframes shimmerSweep`, smooth transitions |
| **Icons & Feedback** | **Lucide React & Sonner** | Enterprise iconography and toast notifications |
| **Backend Framework** | **Node.js & Express 4.21** | TypeScript, Clean Layered Architecture (Routes/Controllers/Services/Repos) |
| **ORM & Database** | **Prisma 6.4 & PostgreSQL 16** | Neon Cloud or local Docker container |
| **AI Simulation** | **Google Gemini 2.0 Flash** | Pricing elasticity, risk analysis, multi-scenario recommendations |
| **Validation & Auth** | **Zod, JWT & Bcrypt.js** | Strict schema validation, JWT auth, role-based access control (RBAC) |
| **DevOps & Tooling** | **Docker & Docker Compose** | Single-command multi-container environment |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (recommended: `v20+` or `v22+`)
- **npm**: `v9.0.0` or higher
- **Docker Desktop** (optional, for local PostgreSQL container)

---

### Step 1: Clone & Install Dependencies

From the repository root:
```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies & generate Prisma client
cd backend
npm install
npx prisma generate
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 2: Configure Environment Variables

Create `.env` in the `backend/` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=dealorbit_super_secret_jwt_key_2026

# PostgreSQL Database (Local Docker or Neon Cloud)
DATABASE_URL="postgresql://postgres:password@localhost:5432/odoo_hack?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/odoo_hack?schema=public"

# Google Gemini API Key (for Deal Strategy Simulator)
GEMINI_API_KEY=your_gemini_api_key_here
```

Create `.env.local` in the `frontend/` directory (optional, defaults to `http://localhost:5000`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Step 3: Start Database & Push Schema

**Option A: Local Docker PostgreSQL (Recommended)**
```bash
# Start the background PostgreSQL container
npm run db:up

# Push Prisma schema to create tables
npm run db:push
```

**Option B: Neon Cloud PostgreSQL**
Set your `DATABASE_URL` in `backend/.env`, then run:
```bash
npm run db:push
```

---

### Step 4: Seed Enterprise Datasets

Populate the database with enterprise customers, multi-category catalogs, multi-warehouse inventory, 200+ realistic quotations, approval workflows, and subscription contracts:

```bash
cd backend
npm run seed:large
cd ..
```

---

### Step 5: Start Development Servers

Launch both backend and frontend concurrently with live hot-reloading:
```bash
npm run dev
```

Your applications will be live at:
- 🌐 **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- 📡 **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- 🩺 **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- 🗄️ **Prisma Studio (Visual Database Browser)**: Run `npm run db:studio`

---

## 👥 Demo User Personas & Role-Based Access Control

DealOrbit implements strict Role-Based Access Control (RBAC):

| User Persona | Role | Credentials | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Sam Seller** | `SALES_REP` | `sam@dealorbit.io` / `password123` | Drafts quotations, runs Gemini strategy simulator, submits for governance review |
| **Morgan Cross** | `SALES_MANAGER` | `morgan@dealorbit.io` / `password123` | Tier-1 approver: reviews ceiling breaches, approves, returns for revision |
| **Elena Rostova** | `FINANCE_DIRECTOR` | `elena@dealorbit.io` / `password123` | Tier-2 approver: margin health audit, discount floor approval, financial release |
| **Alex Rivera** | `ADMIN` | `alex@dealorbit.io` / `password123` | System governance master configuration, warehouse & user management |
| **Customer Contact** | `CUSTOMER` | External Token Access | Accesses customer portal via `/portal/:token` (e.g. `cust-001`) |

---

## 🗺️ Key Application Routes

### Internal Workspace Pages
| Route | Page Name | Primary Function |
| :--- | :--- | :--- |
| `/dashboard` | **Executive Command Center** | Real-time sales telemetry, pipeline value, margin averages, pending approvals |
| `/pipeline` | **Deal Pipeline Kanban** | 5-Stage interactive deal board (Draft, In Review, Approved, Converted, Lost) |
| `/quotations` | **Quotations Hub** | Paginated quotations list with status filters, search, and CSV export |
| `/quotations/[id]` | **Living Quotation Builder** | Multi-category CPQ builder, margin engine, Gemini strategy simulator |
| `/approvals` | **Governance & Approvals** | Tier-1 and Tier-2 executive review queues, audit logs, sign-offs |
| `/fulfillment` | **Fulfillment Operations** | Multi-warehouse order splitting, inventory allocations, carrier dispatch |
| `/billing` | **Hybrid Subscriptions** | Recurring contracts, MRR metrics, billing runs, proration calculator |
| `/billing/[id]` | **Contract Details** | Subscription details, seat modification, cancellation, credit note preview |

### External Customer Facing
| Route | Page Name | Primary Function |
| :--- | :--- | :--- |
| `/portal/[token]` | **Customer Proposal Room** | Zero-leakage proposal review, counter-offer negotiations, and e-signatures |

---

## 📡 Core API Reference

Base URL: `http://localhost:5000/api/v1`

### Authentication & Users
- `POST /api/v1/auth/login` — User authentication & JWT issuance
- `GET /api/v1/auth/me` — Current user profile & active role permissions

### Quotations & CPQ
- `GET /api/v1/quotations` — List quotations (pagination, status filter, search)
- `POST /api/v1/quotations` — Create new quotation draft
- `GET /api/v1/quotations/:id` — Retrieve comprehensive quotation details
- `PUT /api/v1/quotations/:id` — Update lines, recalculate margins & check ceilings
- `POST /api/v1/quotations/:id/submit` — Submit quotation for managerial approval

### Gemini AI Deal Strategy Simulation
- `POST /api/v1/simulation/simulate` — Execute dual-sided AI analysis and generate 3 closing scenarios

### Governance & Approvals
- `GET /api/v1/approvals` — Retrieve pending approval queues by role tier
- `POST /api/v1/approvals/:id/approve` — Approve quotation (Tier-1 or Tier-2 sign-off)
- `POST /api/v1/approvals/:id/reject` — Reject proposal with justification
- `POST /api/v1/approvals/:id/return` — Return proposal to sales rep for revision

### Fulfillment & Inventory
- `GET /api/v1/fulfillment/orders` — List sales orders and fulfillment splits
- `POST /api/v1/fulfillment/orders/:id/dispatch` — Release inventory and initiate dispatch

### Billing & Subscriptions
- `GET /api/v1/billing/contracts` — List active recurring subscription contracts
- `GET /api/v1/billing/contracts/:id` — Contract details & billing history
- `POST /api/v1/billing/contracts/:id/modify` — Seat modification with calculated proration
- `POST /api/v1/billing/contracts/:id/cancel` — Cancel subscription & generate credit note

### Customer Portal
- `GET /api/v1/portal/:token` — Retrieve client proposal (strictly sanitized)
- `POST /api/v1/portal/:token/negotiate` — Submit client counter-offer message
- `POST /api/v1/portal/:token/confirm` — Digitally sign agreement and confirm order

---

## 🛠️ Handy NPM Scripts Cheat Sheet

Run from the **repository root**:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Concurrently starts **both** Backend (:5000) & Frontend (:3000) |
| `npm run dev:backend` | Starts only the Express backend with hot-reloading (`tsx watch`) |
| `npm run dev:frontend` | Starts only the Next.js frontend with Turbopack |
| `npm run build` | Compiles both backend TypeScript and frontend Next.js production builds |
| `npm run db:up` | Starts local PostgreSQL container in the background |
| `npm run db:down` | Stops local PostgreSQL container |
| `npm run db:push` | Pushes Prisma schema changes directly to PostgreSQL |
| `npm run db:studio` | Opens Prisma Studio visual GUI in your browser |
| `npm run docker:up` | Builds and runs the full stack (Postgres + Backend + Frontend) in Docker |
| `npm run docker:down` | Stops all running Docker containers |

---

## 📁 Repository Structure

```
deal-orbit/
├── docker-compose.yml              # Multi-container local orchestration (Postgres, Backend, Frontend)
├── package.json                    # Monorepo root workspace scripts
├── README.md                       # Comprehensive platform documentation
├── PRD.md                          # Product Requirements Document & Master Strategy
├── Architecture.md                 # System architecture, data flow & security specifications
├── Features.md                     # Feature matrix & prioritization specifications
├── Database.md                     # Data models, schema relationships & indexing strategy
├── API.md                          # Complete REST API specifications & envelopes
│
├── frontend/                       # Next.js 16 App Router Client
│   ├── app/                        # Workspace & portal routes
│   │   ├── (workspace)/            # Authenticated internal routes
│   │   │   ├── dashboard/          # Executive telemetry dashboard
│   │   │   ├── pipeline/           # Sales pipeline Kanban board
│   │   │   ├── quotations/         # Quotation management & CPQ builder
│   │   │   ├── approvals/          # Multi-tier governance inbox
│   │   │   ├── fulfillment/        # Multi-warehouse order fulfillment
│   │   │   └── billing/            # Hybrid subscription contracts
│   │   ├── (portal)/portal/        # Customer Proposal Room
│   │   ├── globals.css             # Shimmer keyframes, specular sweeps & CSS variables
│   │   └── theme.css               # Design system color tokens & glassmorphic classes
│   ├── components/                 # Modular React components
│   │   ├── ui/Shimmer.tsx          # Universal GPU-accelerated shimmer skeletons
│   │   ├── quotations/             # Quotation tables, builders, skeletons
│   │   ├── approvals/              # Governance inbox & approval cards
│   │   ├── fulfillment/            # Warehouse split tables & timeline
│   │   ├── billing/                # Subscription contracts & proration
│   │   └── portal/                 # Customer negotiation hub
│   ├── context/                    # React Context providers (QuotationsContext)
│   ├── types/                      # Frontend TypeScript interfaces
│   └── package.json
│
└── backend/                        # Express Clean Architecture API
    ├── prisma/
    │   └── schema.prisma           # Complete PostgreSQL schema & relations
    ├── src/
    │   ├── routes/                 # Express API routes (/api/v1/...)
    │   ├── controllers/            # Request handlers & response formatting
    │   ├── services/               # Core business logic (CPQ, Simulation, Billing, Proration)
    │   ├── repositories/           # Prisma data access abstractions
    │   ├── middlewares/            # JWT auth, RBAC, error handling, Zod validation
    │   ├── utils/                  # Seed utilities (seedLargeDataset.ts, seedGovernance.ts)
    │   ├── app.ts                  # Express application setup & middleware stack
    │   └── server.ts               # Server startup & graceful shutdown
    ├── package.json
    └── tsconfig.json
```

---

## 🔒 Security & Data Privacy

- **Zero-Confidential-Leakage Customer Portal**: Sensitive financial metrics (COGS, vendor cost, gross margins, risk scores, and approval matrices) are completely stripped before serving customer-facing endpoints.
- **JWT & Role-Based Authorization**: Route-level middleware ensures only authorized roles can access or execute sensitive workflows (e.g., only `FINANCE_DIRECTOR` or `SALES_MANAGER` can approve quotations).
- **Prisma Parameterized Queries**: All database operations use Prisma ORM with parameterized queries, eliminating SQL injection vectors.
- **Strict Input Validation**: Zod schemas validate every inbound request payload before controllers process domain logic.

---

## 📜 License

This project is developed for enterprise sales operations and CPQ innovation under the **ISC License**.
