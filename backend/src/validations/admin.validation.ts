import { z } from 'zod';

export const updateDiscountCeilingSchema = z.object({
  body: z.object({
    customerTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE'], {
      required_error: 'customerTier is required',
    }),
    categoryId: z.string().min(1, 'categoryId is required'),
    maxDiscountPercent: z
      .number({ required_error: 'maxDiscountPercent is required' })
      .min(0, 'maxDiscountPercent must be at least 0')
      .max(100, 'maxDiscountPercent cannot exceed 100'),
  }),
});

export const updateApprovalChainSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    minRiskScore: z
      .number({ required_error: 'minRiskScore is required' })
      .min(0, 'minRiskScore must be at least 0'),
    maxRiskScore: z
      .number({ required_error: 'maxRiskScore is required' })
      .min(0, 'maxRiskScore must be at least 0'),
    requiresManager: z.boolean({ required_error: 'requiresManager is required' }),
    requiresFinance: z.boolean({ required_error: 'requiresFinance is required' }),
    description: z.string().optional(),
  }),
});

export type UpdateDiscountCeilingInput = z.infer<typeof updateDiscountCeilingSchema>['body'];
export type UpdateApprovalChainInput = z.infer<typeof updateApprovalChainSchema>['body'];
