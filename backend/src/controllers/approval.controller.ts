import { Request, Response } from 'express';
import { approvalService, ApprovalService } from '../services/approval.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class ApprovalController {
  constructor(private readonly service: ApprovalService = approvalService) {}

  public getPendingApprovals = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.service.getPendingApprovals();
      sendSuccess(res, result, 'Pending approvals retrieved successfully', 200);
    }
  );

  public recordDecision = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const { decision, reason, reviewerName, reviewerRole } = req.body;

      const result = await this.service.recordDecision(
        id,
        {
          decision,
          reason,
          reviewerName,
          reviewerRole,
        },
        req.user
      );

      sendSuccess(res, result.data, result.message, 200);
    }
  );
}

export const approvalController = new ApprovalController();
