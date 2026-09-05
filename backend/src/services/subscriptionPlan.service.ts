import { BillingFrequency, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { subscriptionPlanRepository, ISubscriptionPlanFilter } from '../repositories/subscriptionPlan.repository';
import { prorationRuleRepository } from '../repositories/prorationRule.repository';
import { cancellationRuleRepository } from '../repositories/cancellationRule.repository';
import { AppError } from '../utils/appError';
import { ISubscriptionSetupDto } from '../types/billing.types';

export class SubscriptionPlanService {
  /**
   * Single-call bulk configuration payload for the Admin screen:
   * Returns recurring plans, proration rules, cancellation rules, and attachable products.
   */
  public async getSetupConfiguration(): Promise<ISubscriptionSetupDto> {
    const [plans, prorationRules, cancellationRules, eligibleProducts] = await Promise.all([
      subscriptionPlanRepository.findAll(),
      prorationRuleRepository.findAll(),
      cancellationRuleRepository.findAll(),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          name: true,
          category: { select: { name: true } },
          basePrice: true,
          unit: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      plans: plans.map((p) => ({
        ...p,
        baseRecurringPrice: Number(p.baseRecurringPrice),
        setupFee: Number(p.setupFee),
        product: p.product
          ? {
              ...p.product,
              basePrice: Number(p.product.basePrice),
            }
          : null,
      })),
      prorationRules: prorationRules.map((r) => ({
        ...r,
        prorationMethod: r.prorationMethod as any,
      })),
      cancellationRules: cancellationRules.map((r) => ({
        ...r,
        cancellationFeePercent: Number(r.cancellationFeePercent),
        cancellationPolicy: r.cancellationPolicy as any,
        refundMethod: r.refundMethod as any,
      })),
      eligibleProducts: eligibleProducts.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category.name,
        basePrice: Number(p.basePrice),
        unit: p.unit,
      })),
    };
  }

  /**
   * Create a recurring plan attached to an optional product or service
   */
  public async createPlan(data: {
    name: string;
    code: string;
    description?: string;
    billingFrequency: BillingFrequency;
    billingCycleDays?: number;
    planType?: string;
    baseRecurringPrice: number;
    setupFee?: number;
    minCommitmentMonths?: number;
    trialDays?: number;
    productId?: string;
    prorationRuleId?: string;
    cancellationRuleId?: string;
  }) {
    // 1. Verify code uniqueness
    const existing = await subscriptionPlanRepository.findByCode(data.code);
    if (existing) {
      throw new AppError(`Subscription plan with code "${data.code}" already exists`, 409);
    }

    // 2. Validate product if attached
    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!product) {
        throw new AppError(`Attached product ID "${data.productId}" not found`, 404);
      }
    }

    // 3. Fallback default cycle days based on frequency if not explicitly supplied
    let cycleDays = data.billingCycleDays;
    if (!cycleDays) {
      switch (data.billingFrequency) {
        case BillingFrequency.MONTHLY:
          cycleDays = 30;
          break;
        case BillingFrequency.QUARTERLY:
          cycleDays = 90;
          break;
        case BillingFrequency.YEARLY:
          cycleDays = 365;
          break;
        default:
          cycleDays = 30;
      }
    }

    // 4. Fallback default proration & cancellation rules if not specified
    let prorationRuleId = data.prorationRuleId;
    if (!prorationRuleId) {
      const defProrate = await prorationRuleRepository.findDefault();
      if (defProrate) prorationRuleId = defProrate.id;
    }

    let cancellationRuleId = data.cancellationRuleId;
    if (!cancellationRuleId) {
      const defCancel = await cancellationRuleRepository.findDefault();
      if (defCancel) cancellationRuleId = defCancel.id;
    }

    return subscriptionPlanRepository.create({
      name: data.name,
      code: data.code,
      description: data.description,
      billingFrequency: data.billingFrequency,
      billingCycleDays: cycleDays,
      planType: data.planType || 'SOFTWARE_LICENSE',
      baseRecurringPrice: new Prisma.Decimal(data.baseRecurringPrice),
      setupFee: new Prisma.Decimal(data.setupFee || 0),
      minCommitmentMonths: data.minCommitmentMonths || 1,
      trialDays: data.trialDays || 0,
      isActive: true,
      product: data.productId ? { connect: { id: data.productId } } : undefined,
      prorationRule: prorationRuleId ? { connect: { id: prorationRuleId } } : undefined,
      cancellationRule: cancellationRuleId ? { connect: { id: cancellationRuleId } } : undefined,
    });
  }

  /**
   * Update plan details or attached product
   */
  public async updatePlan(
    id: string,
    data: {
      name?: string;
      description?: string;
      billingFrequency?: BillingFrequency;
      billingCycleDays?: number;
      planType?: string;
      baseRecurringPrice?: number;
      setupFee?: number;
      minCommitmentMonths?: number;
      trialDays?: number;
      isActive?: boolean;
      productId?: string | null;
      prorationRuleId?: string | null;
      cancellationRuleId?: string | null;
    }
  ) {
    const existing = await subscriptionPlanRepository.findById(id);
    if (!existing) {
      throw new AppError(`Subscription plan not found`, 404);
    }

    const updateData: Prisma.SubscriptionPlanUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.billingFrequency !== undefined) updateData.billingFrequency = data.billingFrequency;
    if (data.billingCycleDays !== undefined) updateData.billingCycleDays = data.billingCycleDays;
    if (data.planType !== undefined) updateData.planType = data.planType;
    if (data.baseRecurringPrice !== undefined)
      updateData.baseRecurringPrice = new Prisma.Decimal(data.baseRecurringPrice);
    if (data.setupFee !== undefined) updateData.setupFee = new Prisma.Decimal(data.setupFee);
    if (data.minCommitmentMonths !== undefined) updateData.minCommitmentMonths = data.minCommitmentMonths;
    if (data.trialDays !== undefined) updateData.trialDays = data.trialDays;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.productId !== undefined) {
      if (data.productId === null) {
        updateData.product = { disconnect: true };
      } else {
        updateData.product = { connect: { id: data.productId } };
      }
    }

    if (data.prorationRuleId !== undefined) {
      if (data.prorationRuleId === null) {
        updateData.prorationRule = { disconnect: true };
      } else {
        updateData.prorationRule = { connect: { id: data.prorationRuleId } };
      }
    }

    if (data.cancellationRuleId !== undefined) {
      if (data.cancellationRuleId === null) {
        updateData.cancellationRule = { disconnect: true };
      } else {
        updateData.cancellationRule = { connect: { id: data.cancellationRuleId } };
      }
    }

    return subscriptionPlanRepository.update(id, updateData);
  }

  /**
   * Delete or deactivate plan
   */
  public async deletePlan(id: string) {
    const existing = await subscriptionPlanRepository.findById(id);
    if (!existing) {
      throw new AppError(`Subscription plan not found`, 404);
    }

    return subscriptionPlanRepository.delete(id);
  }

  /**
   * Update proration and cancellation rules configuration
   */
  public async updateRules(data: {
    prorationRule?: {
      id?: string;
      prorationMethod?: 'EXACT_DAY_COUNT' | 'CALENDAR_30_DAYS' | 'NONE';
      allowMidCyclePlanChange?: boolean;
      allowMidCycleQtyChange?: boolean;
      creditOnDowngrade?: boolean;
      chargeImmediately?: boolean;
      minimumRemainingDays?: number;
    };
    cancellationRule?: {
      id?: string;
      cancellationPolicy?: 'IMMEDIATE_WITH_PRORATED_REFUND' | 'END_OF_BILLING_PERIOD' | 'NO_REFUND';
      cancellationNoticeDays?: number;
      cancellationFeePercent?: number;
      refundMethod?: 'CREDIT_NOTE' | 'DIRECT_REFUND' | 'WALLET_BALANCE';
      coolingOffPeriodDays?: number;
    };
  }) {
    const results: any = {};

    if (data.prorationRule) {
      let targetId = data.prorationRule.id;
      if (!targetId) {
        const def = await prorationRuleRepository.findDefault();
        if (def) targetId = def.id;
      }

      if (targetId) {
        const updatePayload: Prisma.ProrationRuleUpdateInput = {};
        if (data.prorationRule.prorationMethod)
          updatePayload.prorationMethod = data.prorationRule.prorationMethod;
        if (data.prorationRule.allowMidCyclePlanChange !== undefined)
          updatePayload.allowMidCyclePlanChange = data.prorationRule.allowMidCyclePlanChange;
        if (data.prorationRule.allowMidCycleQtyChange !== undefined)
          updatePayload.allowMidCycleQtyChange = data.prorationRule.allowMidCycleQtyChange;
        if (data.prorationRule.creditOnDowngrade !== undefined)
          updatePayload.creditOnDowngrade = data.prorationRule.creditOnDowngrade;
        if (data.prorationRule.chargeImmediately !== undefined)
          updatePayload.chargeImmediately = data.prorationRule.chargeImmediately;
        if (data.prorationRule.minimumRemainingDays !== undefined)
          updatePayload.minimumRemainingDays = data.prorationRule.minimumRemainingDays;

        results.prorationRule = await prorationRuleRepository.update(targetId, updatePayload);
      }
    }

    if (data.cancellationRule) {
      let targetId = data.cancellationRule.id;
      if (!targetId) {
        const def = await cancellationRuleRepository.findDefault();
        if (def) targetId = def.id;
      }

      if (targetId) {
        const updatePayload: Prisma.CancellationRuleUpdateInput = {};
        if (data.cancellationRule.cancellationPolicy)
          updatePayload.cancellationPolicy = data.cancellationRule.cancellationPolicy;
        if (data.cancellationRule.cancellationNoticeDays !== undefined)
          updatePayload.cancellationNoticeDays = data.cancellationRule.cancellationNoticeDays;
        if (data.cancellationRule.cancellationFeePercent !== undefined)
          updatePayload.cancellationFeePercent = new Prisma.Decimal(data.cancellationRule.cancellationFeePercent);
        if (data.cancellationRule.refundMethod)
          updatePayload.refundMethod = data.cancellationRule.refundMethod;
        if (data.cancellationRule.coolingOffPeriodDays !== undefined)
          updatePayload.coolingOffPeriodDays = data.cancellationRule.coolingOffPeriodDays;

        results.cancellationRule = await cancellationRuleRepository.update(targetId, updatePayload);
      }
    }

    return results;
  }
}

export const subscriptionPlanService = new SubscriptionPlanService();
