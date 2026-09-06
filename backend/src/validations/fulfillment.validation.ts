import { z } from 'zod';

export const checkFeasibilitySchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID format'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    ).min(1, 'At least one item is required for feasibility check'),
  }),
});

export const splitOrderSchema = z.object({
  params: z.object({
    orderId: z.string({ required_error: 'Order ID is required' }),
  }),
});

export const consolidateBackorderSchema = z.object({
  params: z.object({
    id: z.string().optional(),
    orderId: z.string().optional(),
  }),
  body: z.object({
    warehouseId: z.string().optional(),
  }).optional(),
});

export const overrideSplitSchema = z.object({
  params: z.object({
    splitId: z.string({ required_error: 'Split ID is required' }).uuid('Invalid split ID format'),
  }),
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID format').optional(),
    status: z.enum(['PENDING', 'READY_FOR_PICKING', 'SHIPPED', 'DELIVERED']).optional(),
    trackingNumber: z.string().optional().nullable(),
  }),
});
