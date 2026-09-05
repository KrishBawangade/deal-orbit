import { Request, Response } from 'express';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { creditNoteRepository } from '../repositories/creditNote.repository';
import { prorationService } from '../services/proration.service';
import { cancellationService } from '../services/cancellation.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class BillingController {
  public listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, status, billingFrequency, salesOrderId, search } = req.query;
    const subscriptions = await subscriptionRepository.findAll({
      customerId: customerId as string,
      status: status as any,
      billingFrequency: billingFrequency as any,
      salesOrderId: salesOrderId as string,
      search: search as string,
    });

    return sendSuccess(res, subscriptions, 'Subscriptions retrieved successfully');
  });

  public getSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
    const subscription = await subscriptionRepository.findById(req.params.id);
    if (!subscription) {
      throw new AppError('Subscription contract not found', 404);
    }
    return sendSuccess(res, subscription, 'Subscription contract details retrieved');
  });

  public modifySubscription = asyncHandler(async (req: Request, res: Response) => {
    const result = await prorationService.modifySubscription(req.params.id, req.body);
    return sendSuccess(
      res,
      result,
      result.proration.isCredit
        ? 'Subscription modified. Mid-cycle downgrade credit note issued.'
        : 'Subscription modified. Mid-cycle proration adjustment invoice generated.'
    );
  });

  public cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const result = await cancellationService.cancelSubscription(req.params.id, req.body);
    return sendSuccess(res, result, 'Subscription cancelled successfully');
  });

  public listCreditNotes = asyncHandler(async (req: Request, res: Response) => {
    const creditNotes = await creditNoteRepository.findAll();
    return sendSuccess(res, creditNotes, 'Credit notes retrieved successfully');
  });
}

export const billingController = new BillingController();
