/**
 * Living Quotation & Pricing Engine Types
 * Aligned with Database.md §4.4 and API.md §5
 */

import {
  QuoteStatus,
  BillingFrequency,
  ApprovalRequirement,
  CustomerTier,
  ProductCategory,
} from './enums.types';
import { ICustomerSummary } from './customer.types';
import { IProduct } from './product.types';

export interface IQuotationLineInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  discountPercent: number;
  isRecurring?: boolean;
  billingFrequency?: BillingFrequency;
}

export interface IQuotationLine {
  id: string;
  quotationId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Confidential internal COGS
  discountPercent: number;
  effectiveCeiling: number;
  isViolation: boolean;
  violationPoints: number;
  netLinePrice: number;
  lineMarginPercent: number; // Confidential internal margin
  isRecurring: boolean;
  billingFrequency: BillingFrequency;
  createdAt: Date | string;
  updatedAt: Date | string;
  product?: IProduct;
}

export interface IQuotationLineCalculated {
  id: string;
  productName: string;
  sku?: string;
  category: ProductCategory | string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  effectiveCeiling: number;
  isViolation: boolean;
  violationPoints: number;
  netLinePrice: number;
  lineMarginPercent: number; // Confidential
  isRecurring?: boolean;
  billingFrequency?: BillingFrequency;
}

export interface IInventoryFeasibilitySummary {
  isFeasible: boolean;
  availableStock: number;
  requestedStock: number;
  shortage: number;
  estimatedShipments: number;
}

export interface IQuotation {
  id: string;
  quoteNumber: string;
  version: number;
  customerId: string;
  salesRepId: string;
  status: QuoteStatus;
  paymentTerms: string;
  subtotalAmount: number;
  totalDiscountAmount: number;
  taxAmount: number;
  grandTotal: number;
  totalCostBasis: number; // Confidential
  dealMarginPercent: number; // Confidential
  blendedRiskScore: number; // Confidential
  portalToken: string;
  portalTokenExpiresAt: Date | string;
  expiresAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  lines?: IQuotationLine[];
}

export interface IQuotationSummary {
  id: string;
  quoteNumber: string;
  version: number;
  customer: {
    id: string;
    name: string;
    tier: CustomerTier;
  };
  salesRep: {
    id: string;
    name: string;
  };
  status: QuoteStatus;
  grandTotal: number;
  dealMarginPercent: number;
  blendedRiskScore: number;
  lineCount: number;
  createdAt: Date | string;
}

export interface IQuotationDetail {
  id: string;
  quoteNumber: string;
  version: number;
  status: QuoteStatus;
  customerId: string;
  customerTier?: CustomerTier;
  effectiveCeiling?: number;
  paymentTerms: string;
  subtotalAmount: number;
  totalDiscountAmount: number;
  taxAmount: number;
  grandTotal: number;
  dealMarginPercent: number;
  blendedRiskScore: number;
  approvalRequirement?: ApprovalRequirement | string;
  portalToken: string;
  lines: IQuotationLineCalculated[];
  inventoryFeasibility?: IInventoryFeasibilitySummary;
  expiresAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICreateQuotationDto {
  customerId: string;
  paymentTerms?: string;
  lines?: IQuotationLineInput[];
}

export interface IUpdateQuotationDto {
  version: number; // Mandatory for optimistic concurrency
  paymentTerms?: string;
  lines: IQuotationLineInput[];
}

export interface IQuotationListQuery {
  status?: QuoteStatus;
  customerId?: string;
  salesRepId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ISubmitReviewResponse {
  quoteId: string;
  status: QuoteStatus;
  blendedRiskScore: number;
  assignedTier: number;
  assignedApproverRole: string;
  auditEntryId: string;
}
