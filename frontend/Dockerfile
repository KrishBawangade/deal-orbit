FROM node:20-alpine

WORKDIR /app

# Install libc6-compat for Next.js on Alpine
RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./

# Install all dependencies (including devDependencies like TypeScript and Tailwind)
RUN npm ci

COPY . .

# Build Next.js application
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
