/**
 * Warehouse and Stock Management Types & DTOs
 * Aligned with PRD.md §4.1 A4, Architecture.md §3, Database.md §4.5, and API.md §4 & §10
 */

import { IWarehouse, IWarehouseStock } from './fulfillment.types';

export interface ICreateWarehouseDto {
  name: string;
  code: string;
  address?: string | null;
  priorityOrder?: number;
  shippingCostWeight?: number;
  isActive?: boolean;
}

export interface IUpdateWarehouseDto {
  name?: string;
  code?: string;
  address?: string | null;
  priorityOrder?: number;
  shippingCostWeight?: number;
  isActive?: boolean;
}

export interface IWarehouseFilter {
  search?: string;
  isActive?: boolean;
}

export interface IConfigureStockDto {
  productId: string;
  onHandQuantity?: number;
  reservedQuantity?: number;
  reorderThreshold?: number;
  replenishmentETA?: Date | string | null;
}

export interface IBatchConfigureStockDto {
  items: IConfigureStockDto[];
}

export interface IReplenishStockDto {
  productId: string;
  quantityReceived: number;
  newReplenishmentETA?: Date | string | null;
}

export interface ILowStockAlert {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  sku: string;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderThreshold: number;
  replenishmentETA: Date | string | null;
  isUrgent: boolean;
}

export interface IWarehouseWithStockSummary extends IWarehouse {
  totalSkus: number;
  totalUnitsOnHand: number;
  totalUnitsReserved: number;
  lowStockSkuCount: number;
}
