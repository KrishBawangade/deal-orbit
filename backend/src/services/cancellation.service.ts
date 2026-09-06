import { Prisma, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { AppError } from '../utils/appError';
import { ICancelSubscriptionResponse } from '../types/billing.types';

export class CancellationService {
  /**
   * Execute subscription cancellation and issue credit note for unconsumed service
   */
  public async cancelSubscription(
    subscriptionId: string,
    params: {
      effectiveDate?: Date | string;
      reason?: string;
    }
  ): Promise<ICancelSubscriptionResponse> {
    const subscription = await subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new AppError(`Subscription contract not found`, 404);
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new AppError(`Subscription is already cancelled`, 422);
    }

    const effectiveDate = params.effectiveDate ? new Date(params.effectiveDate) : new Date();
    const periodStart = new Date(subscription.currentPeriodStart);
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const createdAt = new Date(subscription.createdAt);
    const recurringAmount = Number(subscription.recurringAmount);

    const rule = subscription.plan?.cancellationRule;
    const policy = rule?.cancellationPolicy || 'IMMEDIATE_WITH_PRORATED_REFUND';
    const coolingOffDays = rule?.coolingOffPeriodDays || 7;
    const feePercent = rule ? Number(rule.cancellationFeePercent) : 0;

    const msPerDay = 1000 * 60 * 60 * 24;

    // Check cooling-off period eligibility
    const contractAgeDays = Math.max(0, Math.round((effectiveDate.getTime() - createdAt.getTime()) / msPerDay));
    const isCoolingOffEligible = contractAgeDays <= coolingOffDays;

    let unconsumedBalance = 0;
    let feeDeducted = 0;
    let refundAmount = 0;

    if (policy === 'NO_REFUND') {
      unconsumedBalance = 0;
      refundAmount = 0;
    } else if (policy === 'END_OF_BILLING_PERIOD') {
      // Runs until periodEnd, zero mid-cycle refund
      unconsumedBalance = 0;
      refundAmount = 0;
    } else {
      // IMMEDIATE_WITH_PRORATED_REFUND
      if (isCoolingOffEligible) {
        // 100% full refund
        unconsumedBalance = recurringAmount;
        feeDeducted = 0;
        refundAmount = recurringAmount;
      } else {
        const totalDays = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / msPerDay));
        const remainingDays = Math.max(
          0,
          Math.min(totalDays, Math.round((periodEnd.getTime() - effectiveDate.getTime()) / msPerDay))
        );

        const fraction = remainingDays / totalDays;
        unconsumedBalance = Number((fraction * recurringAmount).toFixed(2));

        if (feePercent > 0) {
          feeDeducted = Number((unconsumedBalance * (feePercent / 100)).toFixed(2));
        }

        refundAmount = Number(Math.max(0, unconsumedBalance - feeDeducted).toFixed(2));
      }
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      let creditNoteNumber: string | undefined;

      // 1. Delete future pending schedules
      await tx.billingSchedule.deleteMany({
        where: {
          subscriptionId: subscription.id,
          isProcessed: false,
        },
      });

      // 2. If refundAmount > 0, generate Credit Note
      if (refundAmount > 0) {
        const timestamp = Date.now().toString().slice(-4);
        creditNoteNumber = `CN-CANCEL-${subscription.contractNumber}-${timestamp}`;

        await tx.creditNote.create({
          data: {
            creditNoteNumber,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            amount: new Prisma.Decimal(refundAmount),
            reason:
              params.reason ||
              `Subscription cancellation refund (${isCoolingOffEligible ? 'Cooling-off window' : 'Pro-rata unconsumed'})`,
          },
        });
      }

      // 3. Mark subscription as CANCELLED
      const updated = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: effectiveDate,
          cancellationReason: params.reason || 'User cancelled subscription',
          refundAmount: new Prisma.Decimal(refundAmount),
        },
      });

      return {
        updated,
        creditNoteNumber,
      };
    });

    return {
      contractNumber: subscription.contractNumber,
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: effectiveDate,
      unconsumedBalance,
      cancellationFeeDeducted: feeDeducted,
      refundAmount,
      creditNoteNumber: result.creditNoteNumber,
    };
  }
}

export const cancellationService = new CancellationService();
