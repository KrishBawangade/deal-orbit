import { Request, Response } from 'express';
import { GovernanceService, governanceService } from '../services/governance.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class AdminController {
  constructor(private readonly service: GovernanceService = governanceService) {}

  public getDiscountCeilings = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.service.getDiscountCeilingsMatrix();
      sendSuccess(res, result, 'Discount ceilings retrieved successfully', 200);
    }
  );

  public updateDiscountCeiling = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await this.service.updateDiscountCeiling(req.body);
      sendSuccess(res, null, 'Discount ceiling updated successfully', 200);
    }
  );

  public getApprovalChains = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.service.getApprovalChainRules();
      sendSuccess(res, result, 'Approval chain rules retrieved successfully', 200);
    }
  );

  public updateApprovalChain = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this.service.updateApprovalChainRule(req.body);
      sendSuccess(res, result, 'Approval chain rule updated successfully', 200);
    }
  );
}

export const adminController = new AdminController();
