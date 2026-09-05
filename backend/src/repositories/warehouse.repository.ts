import { Warehouse, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';
import { IWarehouseFilter } from '../types/warehouse.types';

export interface IWarehouseRepository extends IBaseRepository<Warehouse, string, Prisma.WarehouseCreateInput> {
  findByCode(code: string): Promise<Warehouse | null>;
  findWithStockStats(id: string): Promise<any | null>;
  findAllWithFilters(filter?: IWarehouseFilter): Promise<any[]>;
  update(id: string, data: Prisma.WarehouseUpdateInput): Promise<Warehouse | null>;
}

export class WarehouseRepository implements IWarehouseRepository {
  public async findById(id: string): Promise<Warehouse | null> {
    return prisma.warehouse.findUnique({
      where: { id },
    });
  }

  public async findByCode(code: string): Promise<Warehouse | null> {
    return prisma.warehouse.findUnique({
      where: { code },
    });
  }

  public async findWithStockStats(id: string): Promise<any | null> {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        stockRecords: {
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
        },
      },
    });

    if (!warehouse) return null;

    const totalSkus = warehouse.stockRecords.length;
    const totalUnitsOnHand = warehouse.stockRecords.reduce((sum, s) => sum + s.onHandQuantity, 0);
    const totalUnitsReserved = warehouse.stockRecords.reduce((sum, s) => sum + s.reservedQuantity, 0);
    const lowStockSkuCount = warehouse.stockRecords.filter((s) => s.onHandQuantity <= s.reorderThreshold).length;

    return {
      ...warehouse,
      totalSkus,
      totalUnitsOnHand,
      totalUnitsReserved,
      lowStockSkuCount,
    };
  }

  public async findAll(filter?: Partial<Warehouse>): Promise<Warehouse[]> {
    return prisma.warehouse.findMany({
      where: filter,
      orderBy: [{ priorityOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  public async findAllWithFilters(filter?: IWarehouseFilter): Promise<any[]> {
    const where: Prisma.WarehouseWhereInput = {};

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
        { address: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const warehouses = await prisma.warehouse.findMany({
      where,
      include: {
        stockRecords: {
          select: {
            onHandQuantity: true,
            reservedQuantity: true,
            reorderThreshold: true,
          },
        },
      },
      orderBy: [{ priorityOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return warehouses.map((w) => {
      const totalSkus = w.stockRecords.length;
      const totalUnitsOnHand = w.stockRecords.reduce((sum, s) => sum + s.onHandQuantity, 0);
      const totalUnitsReserved = w.stockRecords.reduce((sum, s) => sum + s.reservedQuantity, 0);
      const lowStockSkuCount = w.stockRecords.filter((s) => s.onHandQuantity <= s.reorderThreshold).length;

      const { stockRecords, ...rest } = w;
      return {
        ...rest,
        totalSkus,
        totalUnitsOnHand,
        totalUnitsReserved,
        lowStockSkuCount,
      };
    });
  }

  public async create(data: Prisma.WarehouseCreateInput): Promise<Warehouse> {
    return prisma.warehouse.create({
      data,
    });
  }

  public async update(id: string, data: Prisma.WarehouseUpdateInput): Promise<Warehouse | null> {
    return prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    await prisma.warehouse.delete({
      where: { id },
    });
    return true;
  }
}

export const warehouseRepository = new WarehouseRepository();
