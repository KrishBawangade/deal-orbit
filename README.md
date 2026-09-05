# 🚀 Fullstack Hackathon Starter

A high-performance, modular fullstack starter template built for rapid hackathon development:
- **Frontend**: Next.js 16 (Turbopack, React 19, TypeScript, Tailwind CSS v4)
- **Backend**: Node.js & Express with **Clean Layered Architecture** (Routes → Controllers → Services → Repositories)
- **Database & ORM**: PostgreSQL with **Prisma ORM** (supports local Docker & Neon Cloud)
- **DevOps**: Docker Compose for single-command database and fullstack containerization

---

## ⚡ 60-Second Quickstart for Teammates

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
cd backend && npm install && npx prisma generate
cd ../frontend && npm install
cd ..
```

### 2. Start Local Database
Start the background PostgreSQL container with one command:
```bash
npm run db:up
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Start Development Servers
Start **both** Frontend and Backend simultaneously with live hot-reloading:
```bash
npm run dev
```

Your apps are now running:
- 🌐 **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- 📡 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 🩺 **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- 🗄️ **PostgreSQL**: `localhost:5432` (`user: postgres`, `password: password`, `db: odoo_hack`)

---

## 🛠️ Handy NPM Scripts (Run from Root)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts **both** Backend (:5000) & Frontend (:3000) concurrently |
| `npm run dev:backend` | Starts only the Express backend |
| `npm run dev:frontend` | Starts only the Next.js frontend |
| `npm run db:up` | Starts local PostgreSQL container in background |
| `npm run db:down` | Stops the PostgreSQL container |
| `npm run db:push` | Pushes Prisma schema changes directly to the database |
| `npm run db:studio` | Opens Prisma Studio visual database browser GUI |
| `npm run build` | Builds both backend and frontend for production |
| `npm run docker:up` | Builds and runs the full stack (all 3 containers) in Docker |
| `npm run docker:down` | Stops all Docker containers |

---

## ☁️ Switching to Neon Cloud Database

When you are ready to switch from local PostgreSQL to your team's Neon Cloud database:

1. Open `backend/.env`.
2. Replace `DATABASE_URL` and `DIRECT_URL` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://neondb_owner:password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://neondb_owner:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Run `npm run db:push` to sync all tables to Neon. That's it!

---

## 📁 Repository Structure

```
odoo_hack_starter/
├── docker-compose.yml      # Multi-container setup (postgres, backend, frontend)
├── package.json            # Root workspace scripts (npm run dev, npm run db:up)
├── README.md               # Quickstart guide for teammates
│
├── frontend/               # Next.js 16 Client & Server Components
│   ├── app/                # Next.js App Router (pages, layout, styles)
│   ├── Dockerfile          # Next.js production container
│   ├── package.json
│   └── tsconfig.json
│
└── backend/                # Express API with Clean Architecture
    ├── prisma/
    │   └── schema.prisma   # PostgreSQL database models & Prisma client
    ├── src/
    │   ├── config/         # Environment & database connection
    │   ├── routes/         # Express API endpoints (/api/v1/...)
    │   ├── controllers/    # Request/response handlers (asyncHandler)
    │   ├── services/       # Core business logic
    │   ├── repositories/   # Data access abstraction (Prisma queries)
    │   ├── middlewares/    # Error boundary, 404, request validation
    │   ├── utils/          # Standard response helpers & AppError
    │   ├── app.ts          # Express application setup
    │   └── server.ts       # Server bootstrap & graceful shutdown
    ├── Dockerfile          # Express production container
    ├── package.json
    └── tsconfig.json
```
