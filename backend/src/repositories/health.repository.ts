import os from 'os';
import { checkDatabaseHealth } from '../config/database';
import { IHealthStatus } from '../types';
import { env } from '../config/env';

export interface IHealthRepository {
  getSystemMetrics(): Promise<IHealthStatus>;
}

export class HealthRepository implements IHealthRepository {
  private formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  public async getSystemMetrics(): Promise<IHealthStatus> {
    const memUsage = process.memoryUsage();
    const dbHealth = await checkDatabaseHealth();

    const isSystemHealthy = dbHealth.connected;

    return {
      status: isSystemHealthy ? 'ok' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbHealth,
      memory: {
        rss: this.formatBytes(memUsage.rss),
        heapTotal: this.formatBytes(memUsage.heapTotal),
        heapUsed: this.formatBytes(memUsage.heapUsed),
        external: this.formatBytes(memUsage.external),
      },
    };
  }
}

export const healthRepository = new HealthRepository();
