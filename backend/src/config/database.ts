import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

/**
 * Singleton Prisma Client instance
 * Prevents multiple active connections in development during hot-reload.
 */
export const prisma =
  globalThis.prismaClient ??
  new PrismaClient({
    log: env.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (env.isDevelopment) {
  globalThis.prismaClient = prisma;
}

export interface IDatabaseHealth {
  connected: boolean;
  type: string;
  latencyMs?: number;
  error?: string;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
  } catch (error) {
    console.warn('⚠️  Could not connect to PostgreSQL on startup:', (error as Error).message);
    console.warn('   (Ensure DATABASE_URL is configured and PostgreSQL is running)');
  }
};

export const checkDatabaseHealth = async (): Promise<IDatabaseHealth> => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      type: 'PostgreSQL (Prisma)',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      type: 'PostgreSQL (Prisma)',
      error: (error as Error).message,
    };
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('PostgreSQL disconnected cleanly.');
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
};
