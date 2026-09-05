# Backend API (Node.js + Express + TypeScript)

A clean, modular backend architecture implementing the **Routes → Controllers → Services → Repositories** pattern.

## Architecture

```
Request ────> Route ────> Middleware (validate, auth)
                              │
                              ▼
                         Controller (HTTP req/res, status codes)
                              │
                              ▼
                          Service (Core business logic)
                              │
                              ▼
                         Repository (Data access abstraction)
                              │
                              ▼
                         Database / Storage
```

### Folder Structure

```
src/
├── config/             # Environment variables & database client setup
├── controllers/        # Request handling, status codes, response formatting
├── services/           # Business logic & domain operations
├── repositories/       # Data persistence & database query abstraction
├── routes/             # Express route definitions
├── middlewares/        # Error handlers, 404 handler, and request validators
├── utils/              # Standard response helper, AppError, and asyncHandler
├── types/              # Shared interfaces and TypeScript types
├── app.ts              # Express application configuration
└── server.ts           # Server bootstrap and graceful shutdown
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Database & Prisma Commands
Prisma handles schema migrations and client generation for PostgreSQL:
```bash
npm run prisma:generate   # Re-generate Prisma Client types
npm run prisma:migrate    # Run migrations in development
npm run prisma:push       # Push schema changes directly to DB (hackathons/prototyping)
npm run prisma:studio     # Open visual GUI database browser
```

### 4. Development Server
Start hot-reloading development server:
```bash
npm run dev
```

### 5. Build & Production Run
```bash
npm run build
npm start
```

## How to Add a New Feature

1. **Database Schema**: Add your model to [prisma/schema.prisma](file:///c:/projects/next%20js%20projects/odoo_hack_starter/backend/prisma/schema.prisma) and run `npm run prisma:generate` (or `npm run prisma:push`).
2. **Repository**: Create `src/repositories/<feature>.repository.ts` implementing data queries using `prisma.<model>`.
3. **Service**: Create `src/services/<feature>.service.ts` implementing business rules and consuming the repository.
4. **Controller**: Create `src/controllers/<feature>.controller.ts` with `asyncHandler` calling the service.
5. **Route**: Create `src/routes/<feature>.route.ts` and mount it in `src/routes/index.ts`.
