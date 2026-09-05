import { Request, Response } from 'express';
import { subscriptionPlanService } from '../services/subscriptionPlan.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';

export class SubscriptionPlanController {
  public getSetupConfiguration = asyncHandler(async (req: Request, res: Response) => {
    const config = await subscriptionPlanService.getSetupConfiguration();
    return sendSuccess(res, config, 'Subscription setup configuration retrieved successfully');
  });

  public createPlan = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.createPlan(req.body);
    return sendSuccess(res, plan, 'Recurring plan created successfully', 201);
  });

  public updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.updatePlan(req.params.id, req.body);
    return sendSuccess(res, plan, 'Recurring plan updated successfully');
  });

  public deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.deletePlan(req.params.id);
    const msg = result.deactivated
      ? 'Recurring plan deactivated (in use by existing contracts)'
      : 'Recurring plan deleted successfully';
    return sendSuccess(res, result, msg);
  });

  public updateRules = asyncHandler(async (req: Request, res: Response) => {
    const updated = await subscriptionPlanService.updateRules(req.body);
    return sendSuccess(res, updated, 'Proration and cancellation rules updated successfully');
  });
}

export const subscriptionPlanController = new SubscriptionPlanController();
