import { OrderStatus, FulfillmentStatus, BackorderStatus } from '@prisma/client';
import { fulfillmentRepository, FulfillmentRepository } from '../repositories/fulfillment.repository';
import { warehouseStockRepository, WarehouseStockRepository } from '../repositories/warehouseStock.repository';
import { warehouseRepository, WarehouseRepository } from '../repositories/warehouse.repository';
import { prisma } from '../config/database';
import { AppError } from '../utils/appError';
import {
  ISplitOrderResponse,
  IConsolidateBackorderResponse,
  IFeasibilityCheckResponse,
} from '../types/fulfillment.types';

export class FulfillmentService {
  constructor(
    private readonly fulfillmentRepo: FulfillmentRepository = fulfillmentRepository,
    private readonly stockRepo: WarehouseStockRepository = warehouseStockRepository,
    private readonly whRepo: WarehouseRepository = warehouseRepository
  ) {}

  /**
   * Evaluates inventory feasibility and projected splits across regional warehouses
   * without mutating live stock or generating orders.
   */
  public async checkFeasibility(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<IFeasibilityCheckResponse> {
    const productIds = items.map((i) => i.productId);
    const warehouses = await this.stockRepo.findAllActiveWarehousesWithStocks(productIds);

    let totalItemsRequested = 0;
    let availableAcrossWarehouses = 0;
    let projectedSplits = 0;
    let projectedBackorders = 0;

    // Track simulated allocations per warehouse: Map<warehouseId, countOfLinesAllocated>
    const warehouseAllocations = new Set<string>();

    for (const item of items) {
      totalItemsRequested += item.quantity;
      let remainingQty = item.quantity;

      // Available stock across all warehouses for this product
      let totalStockForProduct = 0;
      for (const wh of warehouses) {
        const stockRecord = wh.stockRecords.find((s: any) => s.productId === item.productId);
        const onHand = stockRecord?.onHandQuantity ?? 0;
        const reserved = stockRecord?.reservedQuantity ?? 0;
        const available = Math.max(0, onHand - reserved);
        totalStockForProduct += available;
      }
      availableAcrossWarehouses += Math.min(item.quantity, totalStockForProduct);

      // 1. Single-Source Feasibility check: lowest shippingCostWeight where stock >= Q
      const singleSourceCandidates = warehouses
        .filter((wh) => {
          const stockRecord = wh.stockRecords.find((s: any) => s.productId === item.productId);
          const available = Math.max(0, (stockRecord?.onHandQuantity ?? 0) - (stockRecord?.reservedQuantity ?? 0));
          return available >= item.quantity;
        })
        .sort((a, b) => Number(a.shippingCostWeight) - Number(b.shippingCostWeight));

      if (singleSourceCandidates.length > 0) {
        warehouseAllocations.add(singleSourceCandidates[0].id);
        continue;
      }

      // 2. Multi-Source Greedy Allocation
      const sortedWarehouses = [...warehouses].sort((a, b) => {
        if (a.priorityOrder !== b.priorityOrder) return a.priorityOrder - b.priorityOrder;
        return Number(a.shippingCostWeight) - Number(b.shippingCostWeight);
      });

      for (const wh of sortedWarehouses) {
        const stockRecord = wh.stockRecords.find((s: any) => s.productId === item.productId);
        const available = Math.max(0, (stockRecord?.onHandQuantity ?? 0) - (stockRecord?.reservedQuantity ?? 0));
        const alloc = Math.min(available, remainingQty);

        if (alloc > 0) {
          warehouseAllocations.add(wh.id);
          remainingQty -= alloc;
        }

        if (remainingQty === 0) break;
      }

      // 3. Backorders
      if (remainingQty > 0) {
        projectedBackorders += remainingQty;
      }
    }

    projectedSplits = warehouseAllocations.size;

    return {
      isFeasible: projectedBackorders === 0,
      totalItemsRequested,
      availableAcrossWarehouses,
      projectedSplits,
      projectedBackorders,
    };
  }

  /**
   * Executes the deterministic greedy auto-split algorithm on a confirmed sales order.
   * Minimizes total shipment count weighted by warehouse shippingCostWeight.
   * Generates shipment manifests and backorders in an ACID transaction.
   */
  public async splitOrder(orderId: string): Promise<ISplitOrderResponse> {
    const order = await this.fulfillmentRepo.findSalesOrderById(orderId);
    if (!order) {
      throw new AppError(`Sales order '${orderId}' not found`, 404, {
        code: 'ORDER_NOT_FOUND',
      });
    }

    // If order already has fulfillment splits, check if they are already generated
    if (order.fulfillmentSplits && order.fulfillmentSplits.length > 0) {
      throw new AppError(`Sales order '${order.orderNumber}' has already been split into shipments`, 409, {
        code: 'ORDER_ALREADY_SPLIT',
      });
    }

    // Extract product lines from the order's quotation
    const quotationLines = order.quotation?.lines || [];
    if (quotationLines.length === 0) {
      throw new AppError(`Sales order '${order.orderNumber}' has no line items to fulfill`, 422, {
        code: 'ORDER_HAS_NO_LINES',
      });
    }

    const productIds = quotationLines.map((l: any) => l.productId);
    const warehouses = await this.stockRepo.findAllActiveWarehousesWithStocks(productIds);

    if (warehouses.length === 0) {
      throw new AppError('No active warehouses available for fulfillment', 422, {
        code: 'NO_ACTIVE_WAREHOUSES',
      });
    }

    // Map: warehouseId -> array of { productId, sku, quantityFulfilled }
    const warehouseLineAllocations = new Map<string, Array<{ productId: string; sku: string; quantityFulfilled: number }>>();
    const backordersToCreate: Array<{ productId: string; quantityShort: number }> = [];
    const stockReservationsToApply: Array<{ warehouseId: string; productId: string; quantity: number }> = [];

    // Local mutable stock tracker to account for allocations across consecutive order lines
    // Key: `${warehouseId}:${productId}` -> currentAvailable
    const virtualStock = new Map<string, number>();
    for (const wh of warehouses) {
      for (const s of wh.stockRecords) {
        const available = Math.max(0, s.onHandQuantity - s.reservedQuantity);
        virtualStock.set(`${wh.id}:${s.productId}`, available);
      }
    }

    for (const line of quotationLines) {
      const productId = line.productId;
      const sku = line.product?.sku || 'UNKNOWN';
      const quantityRequired = line.quantity;
      let remainingQty = quantityRequired;

      // 1. Single-Source Feasibility: Find warehouse where available >= Q with lowest shippingCostWeight
      const singleSourceWarehouse = warehouses
        .filter((wh) => {
          const key = `${wh.id}:${productId}`;
          const currentAvailable = virtualStock.get(key) ?? 0;
          return currentAvailable >= quantityRequired;
        })
        .sort((a, b) => Number(a.shippingCostWeight) - Number(b.shippingCostWeight))[0];

      if (singleSourceWarehouse) {
        // Allocate entire quantity to this single warehouse
        const key = `${singleSourceWarehouse.id}:${productId}`;
        const currentAvailable = virtualStock.get(key) ?? 0;
        virtualStock.set(key, currentAvailable - quantityRequired);

        if (!warehouseLineAllocations.has(singleSourceWarehouse.id)) {
          warehouseLineAllocations.set(singleSourceWarehouse.id, []);
        }
        warehouseLineAllocations.get(singleSourceWarehouse.id)!.push({
          productId,
          sku,
          quantityFulfilled: quantityRequired,
        });

        stockReservationsToApply.push({
          warehouseId: singleSourceWarehouse.id,
          productId,
          quantity: quantityRequired,
        });

        continue;
      }

      // 2. Multi-Source Greedy Allocation: Sort warehouses by Priority ASC, ShippingCostWeight ASC
      const candidateWarehouses = [...warehouses].sort((a, b) => {
        if (a.priorityOrder !== b.priorityOrder) return a.priorityOrder - b.priorityOrder;
        return Number(a.shippingCostWeight) - Number(b.shippingCostWeight);
      });

      for (const wh of candidateWarehouses) {
        const key = `${wh.id}:${productId}`;
        const currentAvailable = virtualStock.get(key) ?? 0;
        const alloc = Math.min(currentAvailable, remainingQty);

        if (alloc > 0) {
          virtualStock.set(key, currentAvailable - alloc);
          remainingQty -= alloc;

          if (!warehouseLineAllocations.has(wh.id)) {
            warehouseLineAllocations.set(wh.id, []);
          }
          warehouseLineAllocations.get(wh.id)!.push({
            productId,
            sku,
            quantityFulfilled: alloc,
          });

          stockReservationsToApply.push({
            warehouseId: wh.id,
            productId,
            quantity: alloc,
          });
        }

        if (remainingQty === 0) break;
      }

      // 3. Backorder Generation: If remaining quantity cannot be satisfied by any warehouse
      if (remainingQty > 0) {
        backordersToCreate.push({
          productId,
          quantityShort: remainingQty,
        });
      }
    }

    // Build shipment manifest objects
    const shipmentLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let shipmentIndex = 0;
    const splitsToCreate = [];

    for (const [whId, lines] of warehouseLineAllocations.entries()) {
      const wh = warehouses.find((w) => w.id === whId);
      const letter = shipmentLetters[shipmentIndex % shipmentLetters.length];
      shipmentIndex++;

      splitsToCreate.push({
        warehouseId: whId,
        shipmentNumber: `SHIP-${order.orderNumber}-${letter}`,
        shippingCostWeight: Number(wh?.shippingCostWeight ?? 1.0),
        status: FulfillmentStatus.READY_FOR_PICKING,
        lines: lines.map((l) => ({
          productId: l.productId,
          quantityFulfilled: l.quantityFulfilled,
        })),
      });
    }

    // Determine target order status
    let targetOrderStatus: OrderStatus = OrderStatus.PROCESSING;
    if (splitsToCreate.length > 0 && backordersToCreate.length === 0) {
      targetOrderStatus = OrderStatus.PROCESSING;
    } else if (backordersToCreate.length > 0 && splitsToCreate.length > 0) {
      targetOrderStatus = OrderStatus.PARTIALLY_FULFILLED;
    } else if (splitsToCreate.length === 0 && backordersToCreate.length > 0) {
      targetOrderStatus = OrderStatus.PARTIALLY_FULFILLED;
    }

    // Execute atomic ACID transaction
    const transactionResult = await this.fulfillmentRepo.createSplitsAndBackordersTransaction(
      order.id,
      splitsToCreate,
      backordersToCreate,
      stockReservationsToApply,
      targetOrderStatus
    );

    // Format output according to API.md §10.1
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalShipments: transactionResult.splits.length,
      fulfillmentSplits: transactionResult.splits.map((split: any) => ({
        id: split.id,
        salesOrderId: split.salesOrderId,
        warehouseId: split.warehouseId,
        shipmentNumber: split.shipmentNumber,
        status: split.status,
        trackingNumber: split.trackingNumber,
        shippingCostWeight: Number(split.shippingCostWeight),
        dispatchedAt: split.dispatchedAt,
        createdAt: split.createdAt,
        updatedAt: split.updatedAt,
        warehouse: {
          id: split.warehouse.id,
          name: split.warehouse.name,
          costWeight: Number(split.warehouse.shippingCostWeight),
        },
        lines: split.fulfillmentLines.map((fl: any) => ({
          sku: fl.product?.sku || '',
          quantityFulfilled: fl.quantityFulfilled,
        })),
      })),
      backorders: transactionResult.backorders.map((bo: any) => ({
        id: bo.id,
        salesOrderId: bo.salesOrderId,
        productId: bo.productId,
        quantityShort: bo.quantityShort,
        status: bo.status,
        restockedAt: bo.restockedAt,
        consolidatedAt: bo.consolidatedAt,
        createdAt: bo.createdAt,
        product: {
          id: bo.product.id,
          sku: bo.product.sku,
          name: bo.product.name,
        },
      })),
    };
  }

  /**
   * Consolidates replenishing inventory into a dispatch manifest for an open backorder.
   * Implements FEAT-13: "Consolidate Remaining Backorder" prompt handling.
   */
  public async consolidateBackorder(
    backorderId: string,
    preferredWarehouseId?: string
  ): Promise<IConsolidateBackorderResponse> {
    const backorder = await this.fulfillmentRepo.findBackorderById(backorderId);
    if (!backorder) {
      throw new AppError(`Backorder '${backorderId}' not found`, 404, {
        code: 'BACKORDER_NOT_FOUND',
      });
    }

    if (backorder.status !== BackorderStatus.PENDING) {
      throw new AppError(`Backorder '${backorderId}' is already ${backorder.status}`, 409, {
        code: 'BACKORDER_ALREADY_RESOLVED',
      });
    }

    // Find warehouse with sufficient stock to fulfill this backorder
    let targetWarehouse: any = null;

    if (preferredWarehouseId) {
      const wh = await this.whRepo.findById(preferredWarehouseId);
      if (!wh) {
        throw new AppError(`Warehouse '${preferredWarehouseId}' not found`, 404);
      }
      const stock = await this.stockRepo.findByWarehouseAndProduct(preferredWarehouseId, backorder.productId);
      const available = (stock?.onHandQuantity ?? 0) - (stock?.reservedQuantity ?? 0);
      if (available < backorder.quantityShort) {
        throw new AppError(
          `Warehouse '${wh.name}' has insufficient available stock (${available}) for backorder quantity (${backorder.quantityShort})`,
          422,
          { code: 'INSUFFICIENT_STOCK' }
        );
      }
      targetWarehouse = wh;
    } else {
      // Find lowest shipping cost warehouse with available stock
      const warehouses = await this.stockRepo.findAllActiveWarehousesWithStocks([backorder.productId]);
      const eligible = warehouses
        .filter((wh) => {
          const s = wh.stockRecords.find((r: any) => r.productId === backorder.productId);
          const available = (s?.onHandQuantity ?? 0) - (s?.reservedQuantity ?? 0);
          return available >= backorder.quantityShort;
        })
        .sort((a, b) => Number(a.shippingCostWeight) - Number(b.shippingCostWeight));

      if (eligible.length === 0) {
        throw new AppError(
          `No warehouse has sufficient available stock to fulfill backorder of ${backorder.quantityShort} units`,
          422,
          { code: 'INSUFFICIENT_STOCK' }
        );
      }
      targetWarehouse = eligible[0];
    }

    // Generate unique shipment number
    const existingSplits = await this.fulfillmentRepo.findSplitsByOrderId(backorder.salesOrderId);
    const letter = String.fromCharCode(65 + existingSplits.length);
    const shipmentNumber = `SHIP-${backorder.salesOrder.orderNumber}-${letter}`;

    const result = await this.fulfillmentRepo.consolidateBackorderTransaction(
      backorderId,
      targetWarehouse.id,
      shipmentNumber,
      backorder.quantityShort,
      Number(targetWarehouse.shippingCostWeight)
    );

    return {
      backorderId: result.backorder.id,
      status: result.backorder.status,
      shipmentNumber: result.split.shipmentNumber,
      quantityDispatched: backorder.quantityShort,
      warehouseName: targetWarehouse.name,
    };
  }

  public async overrideSplit(
    splitId: string,
    dto: { warehouseId?: string; status?: FulfillmentStatus; trackingNumber?: string | null }
  ): Promise<any> {
    const split = await this.fulfillmentRepo.findSplitById(splitId);
    if (!split) {
      throw new AppError(`Fulfillment split '${splitId}' not found`, 404, {
        code: 'SPLIT_NOT_FOUND',
      });
    }

    const updateData: any = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.trackingNumber !== undefined) updateData.trackingNumber = dto.trackingNumber;
    if (dto.warehouseId && dto.warehouseId !== split.warehouseId) {
      const newWh = await this.whRepo.findById(dto.warehouseId);
      if (!newWh) {
        throw new AppError(`Warehouse '${dto.warehouseId}' not found`, 404);
      }
      updateData.warehouseId = dto.warehouseId;
      updateData.shippingCostWeight = newWh.shippingCostWeight;
    }

    if (dto.status === FulfillmentStatus.SHIPPED && !split.dispatchedAt) {
      updateData.dispatchedAt = new Date();
    }

    return this.fulfillmentRepo.updateSplit(splitId, updateData);
  }

  public async getOrderFulfillment(orderId: string): Promise<any> {
    const order = await this.fulfillmentRepo.findSalesOrderById(orderId);
    if (!order) {
      throw new AppError(`Sales order '${orderId}' not found`, 404, {
        code: 'ORDER_NOT_FOUND',
      });
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      fulfillmentSplits: order.fulfillmentSplits,
      backorders: order.backorders,
    };
  }
}

export const fulfillmentService = new FulfillmentService();
