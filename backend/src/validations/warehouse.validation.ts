import { z } from 'zod';

export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Warehouse name is required' }).min(1, 'Warehouse name cannot be empty'),
    code: z.string({ required_error: 'Warehouse code is required' }).min(1, 'Warehouse code cannot be empty'),
    address: z.string().optional().nullable(),
    priorityOrder: z.number().int().min(1, 'Priority order must be at least 1').optional().default(1),
    shippingCostWeight: z.number().min(0.1, 'Shipping cost weight must be at least 0.1').max(10.0, 'Shipping cost weight maximum is 10.0').optional().default(1.0),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateWarehouseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID format'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    address: z.string().optional().nullable(),
    priorityOrder: z.number().int().min(1).optional(),
    shippingCostWeight: z.number().min(0.1).max(10.0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const queryWarehouseSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const configureStockSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID format'),
  }),
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID format'),
    onHandQuantity: z.number().int().min(0, 'On-hand quantity cannot be negative').optional(),
    reservedQuantity: z.number().int().min(0, 'Reserved quantity cannot be negative').optional(),
    reorderThreshold: z.number().int().min(0, 'Reorder threshold cannot be negative').optional(),
    replenishmentETA: z.union([z.string().datetime(), z.string().date(), z.null()]).optional(),
  }),
});

export const batchConfigureStockSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID format'),
  }),
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID format'),
        onHandQuantity: z.number().int().min(0).optional(),
        reservedQuantity: z.number().int().min(0).optional(),
        reorderThreshold: z.number().int().min(0).optional(),
        replenishmentETA: z.union([z.string().datetime(), z.string().date(), z.null()]).optional(),
      })
    ).min(1, 'Must provide at least one stock item'),
  }),
});

export const replenishStockSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID format'),
  }),
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID format'),
    quantityReceived: z.number().int().min(1, 'Quantity received must be at least 1'),
    newReplenishmentETA: z.union([z.string().datetime(), z.string().date(), z.null()]).optional(),
  }),
});
