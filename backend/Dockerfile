FROM node:20-alpine

WORKDIR /app

# Install openssl and libc6-compat for Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code
COPY . .

# Dummy environment variables for build-time Prisma client generation
# (Overridden by docker-compose.yml or runtime environment)
ENV DATABASE_URL="postgresql://postgres:password@localhost:5432/odoo_hack?schema=public"
ENV DIRECT_URL="postgresql://postgres:password@localhost:5432/odoo_hack?schema=public"

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
