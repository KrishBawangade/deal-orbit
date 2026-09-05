import { Request, Response } from 'express';
import { HealthService, healthService } from '../services/health.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class HealthController {
  constructor(private readonly service: HealthService = healthService) {}

  public check = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const health = await this.service.getHealth();
    sendSuccess(res, health, 'System is operating normally');
  });
}

export const healthController = new HealthController();
