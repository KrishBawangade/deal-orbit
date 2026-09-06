import { Prisma, InvoiceType, InvoiceStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { AppError } from '../utils/appError';
import { IProrationBreakdown, IModifySubscriptionResponse } from '../types/billing.types';

export class ProrationService {
  /**
   * Pure calculation helper for day-count proration
   */
  public calculateProrationDelta(params: {
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    effectiveDate: Date;
    previousRate: number;
    newRate: number;
    prorationMethod?: 'EXACT_DAY_COUNT' | 'CALENDAR_30_DAYS' | 'NONE';
    minimumRemainingDays?: number;
  }): IProrationBreakdown {
    const {
      currentPeriodStart,
      currentPeriodEnd,
      effectiveDate,
      previousRate,
      newRate,
      prorationMethod = 'EXACT_DAY_COUNT',
      minimumRemainingDays = 1,
    } = params;

    const rateDelta = Number((newRate - previousRate).toFixed(2));

    if (prorationMethod === 'NONE') {
      return {
        daysRemaining: 0,
        daysInPeriod: 0,
        prorationFraction: 0,
        previousRate,
        newRate,
        rateDelta,
        proratedChargeAmount: 0,
        isCredit: rateDelta < 0,
      };
    }

    const msPerDay = 1000 * 60 * 60 * 24;

    let daysInPeriod = Math.max(
      1,
      Math.round((currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / msPerDay)
    );

    if (prorationMethod === 'CALENDAR_30_DAYS') {
      daysInPeriod = 30;
    }

    const rawRemaining = Math.round((currentPeriodEnd.getTime() - effectiveDate.getTime()) / msPerDay);
    const daysRemaining = Math.max(0, Math.min(daysInPeriod, rawRemaining));

    if (daysRemaining < minimumRemainingDays) {
      return {
        daysRemaining,
        daysInPeriod,
        prorationFraction: 0,
        previousRate,
        newRate,
        rateDelta,
        proratedChargeAmount: 0,
        isCredit: rateDelta < 0,
      };
    }

    const rawFraction = daysRemaining / daysInPeriod;
    const prorationFraction = Number(rawFraction.toFixed(4));
    const rawDeltaAmount = rawFraction * rateDelta;
    const proratedChargeAmount = Number(Math.abs(rawDeltaAmount).toFixed(2));

    return {
      daysRemaining,
      daysInPeriod,
      prorationFraction,
      previousRate,
      newRate,
      rateDelta,
      proratedChargeAmount,
      isCredit: rateDelta < 0,
    };
  }

  /**
   * Commit a mid-cycle subscription change (tier upgrade/downgrade or quantity change).
   * Transactionally updates the contract, generates ProrationAdjustment, issues Invoice or Credit Note,
   * and recalculates future billing schedules.
   */
  public async modifySubscription(
    subscriptionId: string,
    params: {
      newPlanId?: string;
      newPlanRate?: number;
      newQuantity?: number;
      effectiveDate?: Date | string;
      notes?: string;
    }
  ): Promise<IModifySubscriptionResponse> {
    const subscription = await subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new AppError(`Subscription contract not found`, 404);
    }

    if (subscription.status !== 'ACTIVE') {
      throw new AppError(`Cannot modify subscription with status "${subscription.status}"`, 422);
    }

    const effectiveDate = params.effectiveDate ? new Date(params.effectiveDate) : new Date();
    const periodStart = new Date(subscription.currentPeriodStart);
    const periodEnd = new Date(subscription.currentPeriodEnd);

    // Determine new plan and rates
    let newUnitPrice = Number(subscription.unitPrice);
    let newQuantity = params.newQuantity !== undefined ? params.newQuantity : subscription.quantity;
    let targetPlanId = subscription.planId;

    if (params.newPlanId && params.newPlanId !== subscription.planId) {
      const targetPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: params.newPlanId },
      });
      if (!targetPlan) {
        throw new AppError(`Target subscription plan not found`, 404);
      }
      targetPlanId = targetPlan.id;
      newUnitPrice = Number(targetPlan.baseRecurringPrice);
    }

    if (params.newPlanRate !== undefined) {
      newUnitPrice = params.newPlanRate;
    }

    const previousRate = Number(subscription.recurringAmount);
    const newRate = Number((newQuantity * newUnitPrice).toFixed(2));

    // Get active proration rule
    const rule = subscription.plan?.prorationRule;
    const prorationMethod = (rule?.prorationMethod || 'EXACT_DAY_COUNT') as any;
    const minDays = rule?.minimumRemainingDays || 1;

    // Calculate proration
    const breakdown = this.calculateProrationDelta({
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      effectiveDate,
      previousRate,
      newRate,
      prorationMethod,
      minimumRemainingDays: minDays,
    });

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      let adjustmentInvoiceNumber: string | undefined;
      let creditNoteNumber: string | undefined;

      // 1. If rate increased and prorated amount > 0: generate adjustment invoice
      if (!breakdown.isCredit && breakdown.proratedChargeAmount > 0) {
        const timestamp = Date.now().toString().slice(-4);
        adjustmentInvoiceNumber = `INV-PRORATE-${subscription.contractNumber}-${timestamp}`;

        // Create or find a sales order ID or fallback
        const orderId = subscription.salesOrderId || (await this.ensureFallbackSalesOrder(tx, subscription.customerId));

        await tx.invoice.create({
          data: {
            invoiceNumber: adjustmentInvoiceNumber,
            salesOrderId: orderId,
            customerId: subscription.customerId,
            type: InvoiceType.PRORATION_ADJUSTMENT,
            status: InvoiceStatus.SENT,
            subtotal: new Prisma.Decimal(breakdown.proratedChargeAmount),
            taxAmount: new Prisma.Decimal(Number((breakdown.proratedChargeAmount * 0.18).toFixed(2))),
            totalAmount: new Prisma.Decimal(Number((breakdown.proratedChargeAmount * 1.18).toFixed(2))),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days due
          },
        });
      }

      // 2. If rate decreased (downgrade) and prorated amount > 0: generate credit note
      if (breakdown.isCredit && breakdown.proratedChargeAmount > 0) {
        const timestamp = Date.now().toString().slice(-4);
        creditNoteNumber = `CN-PRORATE-${subscription.contractNumber}-${timestamp}`;

        await tx.creditNote.create({
          data: {
            creditNoteNumber,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            amount: new Prisma.Decimal(breakdown.proratedChargeAmount),
            reason: `Mid-cycle downgrade proration: ${breakdown.daysRemaining} days unconsumed`,
          },
        });
      }

      // 3. Append immutable ProrationAdjustment record
      await tx.prorationAdjustment.create({
        data: {
          subscriptionId: subscription.id,
          previousPlanRate: new Prisma.Decimal(previousRate),
          newPlanRate: new Prisma.Decimal(newRate),
          effectiveDate,
          daysRemaining: breakdown.daysRemaining,
          daysInPeriod: breakdown.daysInPeriod,
          proratedDelta: new Prisma.Decimal(breakdown.rateDelta),
          appliedInvoiceId: adjustmentInvoiceNumber || creditNoteNumber || null,
        },
      });

      // 4. Update subscription rates and contract
      const updatedSub = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: targetPlanId,
          quantity: newQuantity,
          unitPrice: new Prisma.Decimal(newUnitPrice),
          recurringAmount: new Prisma.Decimal(newRate),
        },
        include: {
          customer: true,
          plan: true,
          billingSchedules: {
            where: { isProcessed: false },
            orderBy: { scheduledDate: 'asc' },
          },
        },
      });

      // 5. Update amount on future unbilled schedules
      await tx.billingSchedule.updateMany({
        where: {
          subscriptionId: subscription.id,
          isProcessed: false,
        },
        data: {
          amount: new Prisma.Decimal(newRate),
        },
      });

      return {
        updatedSub,
        adjustmentInvoiceNumber,
        creditNoteNumber,
      };
    });

    breakdown.adjustmentInvoiceNumber = result.adjustmentInvoiceNumber;
    breakdown.creditNoteNumber = result.creditNoteNumber;

    return {
      contractNumber: subscription.contractNumber,
      previousRate,
      newRate,
      proration: breakdown,
      subscription: {
        id: result.updatedSub.id,
        contractNumber: result.updatedSub.contractNumber,
        customerId: result.updatedSub.customerId,
        customerName: result.updatedSub.customer.name,
        planName: result.updatedSub.plan?.name,
        status: result.updatedSub.status,
        billingFrequency: result.updatedSub.billingFrequency,
        recurringAmount: Number(result.updatedSub.recurringAmount),
        quantity: result.updatedSub.quantity,
        unitPrice: Number(result.updatedSub.unitPrice),
        currentPeriodStart: result.updatedSub.currentPeriodStart.toISOString(),
        currentPeriodEnd: result.updatedSub.currentPeriodEnd.toISOString(),
        nextBillingDate: result.updatedSub.nextBillingDate.toISOString(),
      },
    };
  }

  private async ensureFallbackSalesOrder(tx: any, customerId: string): Promise<string> {
    const existing = await tx.salesOrder.findFirst({
      where: { customerId },
      select: { id: true },
    });
    if (existing) return existing.id;

    // Check if quotation exists
    let quote = await tx.quotation.findFirst({
      where: { customerId },
      select: { id: true },
    });

    if (!quote) {
      const user = await tx.user.findFirst({ select: { id: true } });
      quote = await tx.quotation.create({
        data: {
          quoteNumber: `QT-SYS-${Date.now().toString().slice(-6)}`,
          customerId,
          createdById: user!.id,
          subtotal: 0,
          totalDiscount: 0,
          taxAmount: 0,
          grandTotal: 0,
          status: 'ACCEPTED',
        },
        select: { id: true },
      });
    }

    const order = await tx.salesOrder.create({
      data: {
        orderNumber: `SO-SYS-${Date.now().toString().slice(-6)}`,
        quotationId: quote.id,
        customerId,
        totalAmount: 0,
        status: 'PROCESSING',
      },
      select: { id: true },
    });

    return order.id;
  }
}

export const prorationService = new ProrationService();
