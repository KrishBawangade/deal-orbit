import { z } from 'zod';
import { BillingFrequency } from '@prisma/client';

export const createSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
    description: z.string().optional(),
    billingFrequency: z.nativeEnum(BillingFrequency),
    billingCycleDays: z.number().int().positive().optional(),
    planType: z.string().optional(),
    baseRecurringPrice: z.number().positive('Recurring price must be positive'),
    setupFee: z.number().nonnegative().optional(),
    minCommitmentMonths: z.number().int().positive().optional(),
    trialDays: z.number().int().nonnegative().optional(),
    productId: z.string().uuid().optional(),
    prorationRuleId: z.string().uuid().optional(),
    cancellationRuleId: z.string().uuid().optional(),
  }),
});

export const updateSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    billingFrequency: z.nativeEnum(BillingFrequency).optional(),
    billingCycleDays: z.number().int().positive().optional(),
    planType: z.string().optional(),
    baseRecurringPrice: z.number().positive().optional(),
    setupFee: z.number().nonnegative().optional(),
    minCommitmentMonths: z.number().int().positive().optional(),
    trialDays: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    productId: z.string().uuid().nullable().optional(),
    prorationRuleId: z.string().uuid().nullable().optional(),
    cancellationRuleId: z.string().uuid().nullable().optional(),
  }),
});

export const updateRulesSchema = z.object({
  body: z.object({
    prorationRule: z
      .object({
        id: z.string().uuid().optional(),
        prorationMethod: z.enum(['EXACT_DAY_COUNT', 'CALENDAR_30_DAYS', 'NONE']).optional(),
        allowMidCyclePlanChange: z.boolean().optional(),
        allowMidCycleQtyChange: z.boolean().optional(),
        creditOnDowngrade: z.boolean().optional(),
        chargeImmediately: z.boolean().optional(),
        minimumRemainingDays: z.number().int().nonnegative().optional(),
      })
      .optional(),
    cancellationRule: z
      .object({
        id: z.string().uuid().optional(),
        cancellationPolicy: z.enum(['IMMEDIATE_WITH_PRORATED_REFUND', 'END_OF_BILLING_PERIOD', 'NO_REFUND']).optional(),
        cancellationNoticeDays: z.number().int().nonnegative().optional(),
        cancellationFeePercent: z.number().min(0).max(100).optional(),
        refundMethod: z.enum(['CREDIT_NOTE', 'DIRECT_REFUND', 'WALLET_BALANCE']).optional(),
        coolingOffPeriodDays: z.number().int().nonnegative().optional(),
      })
      .optional(),
  }),
});

export const modifySubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Subscription ID or contract number is required'),
  }),
  body: z.object({
    newPlanId: z.string().optional(),
    newPlanRate: z.number().positive().optional(),
    newQuantity: z.number().int().positive().optional(),
    effectiveDate: z.string().datetime({ offset: true }).or(z.string()).optional(),
    notes: z.string().optional(),
  }),
});

export const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Subscription ID or contract number is required'),
  }),
  body: z.object({
    effectiveDate: z.string().datetime({ offset: true }).or(z.string()).optional(),
    reason: z.string().max(500).optional(),
  }),
});
