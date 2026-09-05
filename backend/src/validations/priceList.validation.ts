import { z } from 'zod';

export const createPriceListSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Price list name is required' }).min(1, 'Name cannot be empty'),
    description: z.string().optional().nullable(),
    currency: z.string().min(1).default('INR'),
    customerTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE']).optional().nullable(),
    isDefault: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
    validFrom: z.string().datetime({ offset: true }).optional().nullable(),
    validTo: z.string().datetime({ offset: true }).optional().nullable(),
  }),
});

export const updatePriceListSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    currency: z.string().min(1).optional(),
    customerTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE']).optional().nullable(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    validFrom: z.string().datetime({ offset: true }).optional().nullable(),
    validTo: z.string().datetime({ offset: true }).optional().nullable(),
  }),
});

export const createPriceListRuleSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID format'),
    variantId: z.string().uuid('Invalid variant ID format').optional().nullable(),
    customPrice: z.number().min(0, 'Custom price must be non-negative').optional().nullable(),
    discountPercent: z.number().min(0).max(100, 'Discount percentage must be between 0 and 100').optional().nullable(),
    minQuantity: z.number().int().min(1, 'Minimum quantity must be at least 1').optional().default(1),
  }).refine((data) => data.customPrice !== undefined || data.discountPercent !== undefined, {
    message: 'Either customPrice or discountPercent must be specified',
  }),
});

export const updatePriceListRuleSchema = z.object({
  body: z.object({
    customPrice: z.number().min(0).optional().nullable(),
    discountPercent: z.number().min(0).max(100).optional().nullable(),
    minQuantity: z.number().int().min(1).optional(),
  }),
});

export const calculatePriceSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }),
    variantId: z.string().optional().nullable(),
    customerTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE']).optional(),
    priceListId: z.string().optional(),
    currency: z.string().optional().default('INR'),
    quantity: z.number().int().min(1).optional().default(1),
  }),
});
