/**
 * Multi-Warehouse Fulfillment & Logistics Types
 * Aligned with Database.md §4.5 and API.md §10
 */

import {
  OrderStatus,
  FulfillmentStatus,
  BackorderStatus,
} from './enums.types';
import { IProductSummary } from './product.types';

export interface IWarehouse {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  priorityOrder: number;
  shippingCostWeight: number;
  isActive: boolean;
  createdAt: Date | string;
}

export interface IWarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  onHandQuantity: number;
  reservedQuantity: number;
  reorderThreshold: number;
  replenishmentETA?: Date | string | null;
  updatedAt: Date | string;
  warehouse?: IWarehouse;
}

export interface ISalesOrder {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISalesOrderSummary {
  id: string;
  orderNumber: string;
  quoteNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  shipmentCount: number;
  backorderCount: number;
  createdAt: Date | string;
}

export interface IFulfillmentLine {
  id: string;
  fulfillmentSplitId: string;
  productId: string;
  quantityFulfilled: number;
  createdAt: Date | string;
  product?: IProductSummary;
}

export interface IFulfillmentSplit {
  id: string;
  salesOrderId: string;
  warehouseId: string;
  shipmentNumber: string;
  status: FulfillmentStatus;
  trackingNumber?: string | null;
  shippingCostWeight: number;
  dispatchedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  warehouse?: {
    id: string;
    name: string;
    costWeight: number;
  };
  lines?: Array<{
    sku: string;
    quantityFulfilled: number;
  }>;
}

export interface IBackorder {
  id: string;
  salesOrderId: string;
  productId: string;
  quantityShort: number;
  status: BackorderStatus;
  restockedAt?: Date | string | null;
  consolidatedAt?: Date | string | null;
  createdAt: Date | string;
  product?: IProductSummary;
}

export interface ISplitOrderResponse {
  orderId: string;
  orderNumber: string;
  totalShipments: number;
  fulfillmentSplits: IFulfillmentSplit[];
  backorders: IBackorder[];
}

export interface IConsolidateBackorderResponse {
  backorderId: string;
  status: BackorderStatus;
  shipmentNumber: string;
  quantityDispatched: number;
  warehouseName: string;
}

export interface IFeasibilityCheckResponse {
  isFeasible: boolean;
  totalItemsRequested: number;
  availableAcrossWarehouses: number;
  projectedSplits: number;
  projectedBackorders: number;
}
