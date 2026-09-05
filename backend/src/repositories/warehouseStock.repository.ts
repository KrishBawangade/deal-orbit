import { WarehouseStock, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { ILowStockAlert } from '../types/warehouse.types';

export interface IUpsertStockParams {
  warehouseId: string;
  productId: string;
  onHandQuantity?: number;
  reservedQuantity?: number;
  reorderThreshold?: number;
  replenishmentETA?: Date | null;
}

export class WarehouseStockRepository {
  public async findByWarehouseAndProduct(warehouseId: string, productId: string): Promise<any | null> {
    return prisma.warehouseStock.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      include: {
        warehouse: true,
        product: true,
      },
    });
  }

  public async findStocksByWarehouse(warehouseId: string, lowStockOnly: boolean = false): Promise<any[]> {
    const stocks = await prisma.warehouseStock.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            basePrice: true,
            unit: true,
            isActive: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (lowStockOnly) {
      return stocks.filter((s) => s.onHandQuantity <= s.reorderThreshold);
    }

    return stocks;
  }

  public async upsertStock(params: IUpsertStockParams): Promise<WarehouseStock> {
    const { warehouseId, productId, onHandQuantity, reservedQuantity, reorderThreshold, replenishmentETA } = params;

    const updateData: Prisma.WarehouseStockUpdateInput = {};
    if (onHandQuantity !== undefined) updateData.onHandQuantity = onHandQuantity;
    if (reservedQuantity !== undefined) updateData.reservedQuantity = reservedQuantity;
    if (reorderThreshold !== undefined) updateData.reorderThreshold = reorderThreshold;
    if (replenishmentETA !== undefined) updateData.replenishmentETA = replenishmentETA;

    return prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      create: {
        warehouse: { connect: { id: warehouseId } },
        product: { connect: { id: productId } },
        onHandQuantity: onHandQuantity ?? 0,
        reservedQuantity: reservedQuantity ?? 0,
        reorderThreshold: reorderThreshold ?? 10,
        replenishmentETA: replenishmentETA ?? null,
      },
      update: updateData,
    });
  }

  public async adjustStock(
    warehouseId: string,
    productId: string,
    deltaOnHand: number,
    deltaReserved: number = 0
  ): Promise<WarehouseStock> {
    return prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      create: {
        warehouse: { connect: { id: warehouseId } },
        product: { connect: { id: productId } },
        onHandQuantity: Math.max(0, deltaOnHand),
        reservedQuantity: Math.max(0, deltaReserved),
        reorderThreshold: 10,
      },
      update: {
        onHandQuantity: { increment: deltaOnHand },
        reservedQuantity: { increment: deltaReserved },
      },
    });
  }

  public async findLowStockAcrossWarehouses(): Promise<ILowStockAlert[]> {
    const stocks = await prisma.warehouseStock.findMany({
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ warehouse: { priorityOrder: 'asc' } }, { onHandQuantity: 'asc' }],
    });

    return stocks
      .filter((s) => s.warehouse.isActive && s.product.isActive && s.onHandQuantity <= s.reorderThreshold)
      .map((s) => {
        const availableQuantity = Math.max(0, s.onHandQuantity - s.reservedQuantity);
        return {
          warehouseId: s.warehouse.id,
          warehouseName: s.warehouse.name,
          warehouseCode: s.warehouse.code,
          productId: s.product.id,
          productName: s.product.name,
          sku: s.product.sku,
          onHandQuantity: s.onHandQuantity,
          reservedQuantity: s.reservedQuantity,
          availableQuantity,
          reorderThreshold: s.reorderThreshold,
          replenishmentETA: s.replenishmentETA,
          isUrgent: availableQuantity <= 0,
        };
      });
  }

  public async findAllActiveWarehousesWithStocks(productIds?: string[]): Promise<any[]> {
    const whereClause: Prisma.WarehouseStockWhereInput = {};
    if (productIds && productIds.length > 0) {
      whereClause.productId = { in: productIds };
    }

    return prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        stockRecords: {
          where: whereClause,
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ priorityOrder: 'asc' }, { shippingCostWeight: 'asc' }],
    });
  }
}

export const warehouseStockRepository = new WarehouseStockRepository();
