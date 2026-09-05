import { Warehouse, Prisma } from '@prisma/client';
import { warehouseRepository, IWarehouseRepository } from '../repositories/warehouse.repository';
import { warehouseStockRepository, WarehouseStockRepository } from '../repositories/warehouseStock.repository';
import { productRepository } from '../repositories/product.repository';
import { prisma } from '../config/database';
import { AppError } from '../utils/appError';
import {
  ICreateWarehouseDto,
  IUpdateWarehouseDto,
  IWarehouseFilter,
  IConfigureStockDto,
  IReplenishStockDto,
  ILowStockAlert,
  IWarehouseWithStockSummary,
} from '../types/warehouse.types';

export class WarehouseService {
  constructor(
    private readonly whRepo: IWarehouseRepository = warehouseRepository,
    private readonly stockRepo: WarehouseStockRepository = warehouseStockRepository
  ) {}

  public async createWarehouse(dto: ICreateWarehouseDto): Promise<Warehouse> {
    const existingCode = await this.whRepo.findByCode(dto.code.trim().toUpperCase());
    if (existingCode) {
      throw new AppError(`Warehouse code '${dto.code}' is already registered`, 409, {
        code: 'WAREHOUSE_CODE_EXISTS',
      });
    }

    return this.whRepo.create({
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
      address: dto.address?.trim() || null,
      priorityOrder: dto.priorityOrder ?? 1,
      shippingCostWeight: dto.shippingCostWeight ?? 1.0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
  }

  public async getWarehouseById(id: string): Promise<IWarehouseWithStockSummary> {
    const warehouse = await this.whRepo.findWithStockStats(id);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${id}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }
    return warehouse;
  }

  public async listWarehouses(filter?: IWarehouseFilter): Promise<IWarehouseWithStockSummary[]> {
    return this.whRepo.findAllWithFilters(filter);
  }

  public async updateWarehouse(id: string, dto: IUpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.whRepo.findById(id);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${id}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }

    if (dto.code && dto.code.trim().toUpperCase() !== warehouse.code) {
      const existing = await this.whRepo.findByCode(dto.code.trim().toUpperCase());
      if (existing && existing.id !== id) {
        throw new AppError(`Warehouse code '${dto.code}' is already in use by another warehouse`, 409, {
          code: 'WAREHOUSE_CODE_EXISTS',
        });
      }
    }

    const updated = await this.whRepo.update(id, {
      name: dto.name ? dto.name.trim() : undefined,
      code: dto.code ? dto.code.trim().toUpperCase() : undefined,
      address: dto.address !== undefined ? (dto.address ? dto.address.trim() : null) : undefined,
      priorityOrder: dto.priorityOrder !== undefined ? dto.priorityOrder : undefined,
      shippingCostWeight: dto.shippingCostWeight !== undefined ? new Prisma.Decimal(dto.shippingCostWeight) : undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : undefined,
    });

    if (!updated) {
      throw new AppError('Failed to update warehouse', 500);
    }

    return updated;
  }

  public async deleteWarehouse(id: string): Promise<{ message: string }> {
    const warehouse = await this.whRepo.findById(id);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${id}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }

    // Check if warehouse has fulfillment splits
    const splitCount = await prisma.fulfillmentSplit.count({
      where: { warehouseId: id },
    });

    if (splitCount > 0) {
      // Soft-deactivate if fulfillment records exist to maintain historical integrity
      await this.whRepo.update(id, { isActive: false });
      return {
        message: `Warehouse has ${splitCount} associated shipment manifests and was deactivated instead of deleted.`,
      };
    }

    await this.whRepo.delete(id);
    return { message: 'Warehouse deleted successfully' };
  }

  public async getWarehouseStocks(warehouseId: string, lowStockOnly: boolean = false): Promise<any[]> {
    const warehouse = await this.whRepo.findById(warehouseId);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${warehouseId}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }

    return this.stockRepo.findStocksByWarehouse(warehouseId, lowStockOnly);
  }

  public async configureStock(warehouseId: string, dto: IConfigureStockDto): Promise<any> {
    const warehouse = await this.whRepo.findById(warehouseId);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${warehouseId}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }

    const product = await productRepository.findById(dto.productId);
    if (!product) {
      throw new AppError(`Product with ID '${dto.productId}' not found`, 404, {
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    const eta = dto.replenishmentETA ? new Date(dto.replenishmentETA) : dto.replenishmentETA === null ? null : undefined;

    return this.stockRepo.upsertStock({
      warehouseId,
      productId: dto.productId,
      onHandQuantity: dto.onHandQuantity,
      reservedQuantity: dto.reservedQuantity,
      reorderThreshold: dto.reorderThreshold,
      replenishmentETA: eta,
    });
  }

  public async batchConfigureStock(warehouseId: string, items: IConfigureStockDto[]): Promise<any[]> {
    const warehouse = await this.whRepo.findById(warehouseId);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${warehouseId}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }

    const results = [];
    for (const item of items) {
      const updated = await this.configureStock(warehouseId, item);
      results.push(updated);
    }
    return results;
  }

  public async replenishStock(warehouseId: string, dto: IReplenishStockDto): Promise<any> {
    const warehouse = await this.whRepo.findById(warehouseId);
    if (!warehouse) {
      throw new AppError(`Warehouse with ID '${warehouseId}' not found`, 404, {
        code: 'WAREHOUSE_NOT_FOUND',
      });
    }

    const product = await productRepository.findById(dto.productId);
    if (!product) {
      throw new AppError(`Product with ID '${dto.productId}' not found`, 404, {
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    // Increment stock
    const updatedStock = await this.stockRepo.adjustStock(warehouseId, dto.productId, dto.quantityReceived, 0);

    // If new replenishment ETA specified or null, update it
    if (dto.newReplenishmentETA !== undefined) {
      const eta = dto.newReplenishmentETA ? new Date(dto.newReplenishmentETA) : null;
      await this.stockRepo.upsertStock({
        warehouseId,
        productId: dto.productId,
        replenishmentETA: eta,
      });
    }

    // Check for open backorders for this product (FEAT-13 Backorder Consolidation Prompt)
    const openBackorders = await prisma.backorder.findMany({
      where: {
        productId: dto.productId,
        status: 'PENDING',
      },
      include: {
        salesOrder: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
      },
    });

    return {
      warehouseId,
      warehouseName: warehouse.name,
      productId: dto.productId,
      productName: product.name,
      quantityReceived: dto.quantityReceived,
      newOnHandQuantity: updatedStock.onHandQuantity,
      openBackordersCount: openBackorders.length,
      eligibleBackorders: openBackorders.map((bo) => ({
        backorderId: bo.id,
        salesOrderId: bo.salesOrderId,
        orderNumber: bo.salesOrder.orderNumber,
        quantityShort: bo.quantityShort,
        canFulfillFully: updatedStock.onHandQuantity >= bo.quantityShort,
      })),
    };
  }

  public async getReplenishmentAlerts(): Promise<ILowStockAlert[]> {
    return this.stockRepo.findLowStockAcrossWarehouses();
  }
}

export const warehouseService = new WarehouseService();
