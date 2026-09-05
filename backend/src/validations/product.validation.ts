import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).min(1, 'Product name cannot be empty'),
    sku: z.string().min(1, 'SKU cannot be empty').optional(),
    categoryId: z.string().uuid('Invalid category ID format').optional(),
    category: z.enum(['HARDWARE', 'SOFTWARE', 'SERVICES']).optional(),
    basePrice: z.number({ required_error: 'Base price is required' }).min(0, 'Base price must be non-negative'),
    costPrice: z.number().min(0, 'Cost price must be non-negative').optional().default(0),
    unit: z.string().optional().default('Unit'),
    taxRate: z.number().min(0).max(100).optional().default(18.0),
    description: z.string().optional().nullable(),
    isPromoted: z.boolean().optional().default(false),
    minMarginThreshold: z.number().min(0).max(100).optional().default(18.0),
    isRecurringDefault: z.boolean().optional().default(false),
    defaultBillingCycle: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional().default('ONE_TIME'),
    isActive: z.boolean().optional().default(true),
    variants: z
      .array(
        z.object({
          attributeName: z.string().min(1, 'Attribute name is required (e.g. Size or Pack)'),
          attributeValue: z.string().min(1, 'Attribute value is required'),
          priceDelta: z.number().default(0),
          costDelta: z.number().default(0),
          skuModifier: z.string().optional().nullable(),
        })
      )
      .optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    categoryId: z.string().uuid().optional(),
    category: z.enum(['HARDWARE', 'SOFTWARE', 'SERVICES']).optional(),
    basePrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    unit: z.string().optional(),
    taxRate: z.number().min(0).max(100).optional(),
    description: z.string().optional().nullable(),
    isPromoted: z.boolean().optional(),
    minMarginThreshold: z.number().min(0).max(100).optional(),
    isRecurringDefault: z.boolean().optional(),
    defaultBillingCycle: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createVariantSchema = z.object({
  body: z.object({
    attributeName: z.string({ required_error: 'Attribute name is required (e.g. Size or Pack)' }).min(1),
    attributeValue: z.string({ required_error: 'Attribute value is required' }).min(1),
    priceDelta: z.number().default(0),
    costDelta: z.number().default(0),
    skuModifier: z.string().optional().nullable(),
  }),
});

export const updateVariantSchema = z.object({
  body: z.object({
    attributeName: z.string().min(1).optional(),
    attributeValue: z.string().min(1).optional(),
    priceDelta: z.number().optional(),
    costDelta: z.number().optional(),
    skuModifier: z.string().optional().nullable(),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    category: z.string().optional(),
    isPromoted: z.string().optional(),
    isActive: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
