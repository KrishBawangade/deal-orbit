import { IHealthRepository, healthRepository } from '../repositories/health.repository';
import { IHealthStatus } from '../types';

export class HealthService {
  constructor(private readonly repository: IHealthRepository = healthRepository) {}

  public async getHealth(): Promise<IHealthStatus> {
    const health = await this.repository.getSystemMetrics();
    return health;
  }
}

export const healthService = new HealthService();
