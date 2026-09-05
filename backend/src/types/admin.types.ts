/**
 * Admin Configuration, System Settings & Reporting Types
 * Aligned with API.md §4
 */

import { CustomerTier, QuoteStatus } from './enums.types';

export interface ISalesReportQuery {
  startDate?: string;
  endDate?: string;
  repId?: string;
  status?: QuoteStatus;
  format?: 'json' | 'pdf' | 'xls';
}

export interface ISalesReportSummary {
  totalQuotes: number;
  totalBookedValue: number;
  averageMarginPercent: number;
  averageDiscountPercent: number;
  stalledDealCount: number;
}

export interface ISalesReportQuoteItem {
  quoteNumber: string;
  customerName: string;
  repName: string;
  grandTotal: number;
  dealMarginPercent: number;
  blendedRiskScore: number;
  status: QuoteStatus;
}

export interface ISalesReportResponse {
  summary: ISalesReportSummary;
  quotes: ISalesReportQuoteItem[];
}

export interface IUpdateDiscountCeilingDto {
  customerTier: CustomerTier;
  categoryId: string;
  maxDiscountPercent: number;
}

export interface IUpdateApprovalChainDto {
  id?: string;
  minRiskScore: number;
  maxRiskScore: number;
  requiresManager: boolean;
  requiresFinance: boolean;
  description?: string;
}

export interface IUpdateWarehouseStockDto {
  productId: string;
  onHandQuantity?: number;
  reservedQuantity?: number;
  reorderThreshold?: number;
  replenishmentETA?: Date | string | null;
}
