import { FulfillmentSplit, FulfillmentLine, Backorder, OrderStatus, FulfillmentStatus, BackorderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface ISplitLineItemInput {
  productId: string;
  quantityFulfilled: number;
}

export interface ISplitInput {
  warehouseId: string;
  shipmentNumber: string;
  shippingCostWeight: number;
  status?: FulfillmentStatus;
  lines: ISplitLineItemInput[];
}

export interface IBackorderInput {
  productId: string;
  quantityShort: number;
}

export interface IStockReservationInput {
  warehouseId: string;
  productId: string;
  quantity: number;
}

export class FulfillmentRepository {
  public async findSalesOrderById(orderId: string): Promise<any | null> {
    return prisma.salesOrder.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            code: true,
            tier: true,
          },
        },
        quotation: {
          include: {
            lines: {
              include: {
                product: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                    category: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
        fulfillmentSplits: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
                shippingCostWeight: true,
              },
            },
            fulfillmentLines: {
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
          orderBy: { createdAt: 'asc' },
        },
        backorders: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  public async createSplitsAndBackordersTransaction(
    salesOrderId: string,
    splits: ISplitInput[],
    backorders: IBackorderInput[],
    stockReservations: IStockReservationInput[],
    targetOrderStatus: OrderStatus
  ): Promise<any> {
    return prisma.$transaction(async (tx) => {
      // 1. Create fulfillment splits and lines
      const createdSplits = [];
      for (const split of splits) {
        const createdSplit = await tx.fulfillmentSplit.create({
          data: {
            salesOrderId,
            warehouseId: split.warehouseId,
            shipmentNumber: split.shipmentNumber,
            status: split.status || FulfillmentStatus.READY_FOR_PICKING,
            shippingCostWeight: split.shippingCostWeight,
            fulfillmentLines: {
              create: split.lines.map((line) => ({
                productId: line.productId,
                quantityFulfilled: line.quantityFulfilled,
              })),
            },
          },
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
                shippingCostWeight: true,
              },
            },
            fulfillmentLines: {
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
        });
        createdSplits.push(createdSplit);
      }

      // 2. Create backorders
      const createdBackorders = [];
      for (const bo of backorders) {
        const createdBo = await tx.backorder.create({
          data: {
            salesOrderId,
            productId: bo.productId,
            quantityShort: bo.quantityShort,
            status: BackorderStatus.PENDING,
          },
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
        });
        createdBackorders.push(createdBo);
      }

      // 3. Update warehouse stock counts (deduct onHand, increment reserved)
      for (const res of stockReservations) {
        await tx.warehouseStock.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: res.warehouseId,
              productId: res.productId,
            },
          },
          create: {
            warehouse: { connect: { id: res.warehouseId } },
            product: { connect: { id: res.productId } },
            onHandQuantity: 0,
            reservedQuantity: res.quantity,
          },
          update: {
            reservedQuantity: {
              increment: res.quantity,
            },
          },
        });
      }

      // 4. Update SalesOrder status
      await tx.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: targetOrderStatus },
      });

      return {
        splits: createdSplits,
        backorders: createdBackorders,
      };
    });
  }

  public async findBackorderById(id: string): Promise<any | null> {
    return prisma.backorder.findUnique({
      where: { id },
      include: {
        product: true,
        salesOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });
  }

  public async updateBackorder(id: string, data: Prisma.BackorderUpdateInput): Promise<Backorder> {
    return prisma.backorder.update({
      where: { id },
      data,
    });
  }

  public async consolidateBackorderTransaction(
    backorderId: string,
    warehouseId: string,
    shipmentNumber: string,
    quantityDispatched: number,
    shippingCostWeight: number
  ): Promise<any> {
    return prisma.$transaction(async (tx) => {
      const bo = await tx.backorder.findUnique({
        where: { id: backorderId },
        include: { product: true, salesOrder: true },
      });

      if (!bo) throw new Error('Backorder not found');

      // 1. Mark backorder consolidated
      const updatedBackorder = await tx.backorder.update({
        where: { id: backorderId },
        data: {
          status: BackorderStatus.CONSOLIDATED,
          consolidatedAt: new Date(),
        },
      });

      // 2. Create new fulfillment split
      const split = await tx.fulfillmentSplit.create({
        data: {
          salesOrderId: bo.salesOrderId,
          warehouseId,
          shipmentNumber,
          status: FulfillmentStatus.READY_FOR_PICKING,
          shippingCostWeight,
          fulfillmentLines: {
            create: [
              {
                productId: bo.productId,
                quantityFulfilled: quantityDispatched,
              },
            ],
          },
        },
        include: {
          warehouse: true,
          fulfillmentLines: {
            include: { product: true },
          },
        },
      });

      // 3. Deduct stock from warehouse
      await tx.warehouseStock.upsert({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: bo.productId,
          },
        },
        create: {
          warehouse: { connect: { id: warehouseId } },
          product: { connect: { id: bo.productId } },
          onHandQuantity: 0,
          reservedQuantity: quantityDispatched,
        },
        update: {
          reservedQuantity: { increment: quantityDispatched },
        },
      });

      // 4. Check if all backorders for this sales order are now resolved
      const remainingBackorders = await tx.backorder.count({
        where: {
          salesOrderId: bo.salesOrderId,
          status: BackorderStatus.PENDING,
        },
      });

      if (remainingBackorders === 0) {
        await tx.salesOrder.update({
          where: { id: bo.salesOrderId },
          data: { status: OrderStatus.FULFILLED },
        });
      }

      return {
        backorder: updatedBackorder,
        split,
      };
    });
  }

  public async findSplitsByOrderId(salesOrderId: string): Promise<FulfillmentSplit[]> {
    return prisma.fulfillmentSplit.findMany({
      where: { salesOrderId },
      include: {
        warehouse: true,
        fulfillmentLines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findSplitById(splitId: string): Promise<any | null> {
    return prisma.fulfillmentSplit.findUnique({
      where: { id: splitId },
      include: {
        warehouse: true,
        fulfillmentLines: {
          include: {
            product: true,
          },
        },
        salesOrder: true,
      },
    });
  }

  public async updateSplit(splitId: string, data: Prisma.FulfillmentSplitUpdateInput): Promise<FulfillmentSplit> {
    return prisma.fulfillmentSplit.update({
      where: { id: splitId },
      data,
    });
  }
}

export const fulfillmentRepository = new FulfillmentRepository();
