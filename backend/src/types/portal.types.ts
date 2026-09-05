/**
 * Restricted Customer Portal & Negotiation Types
 * Aligned with Database.md §4.4 and API.md §9
 * 
 * SECURITY GUARANTEE: All types here represent sanitized, masked projections.
 * Confidential fields (costPrice, unitCost, margins, risk scores) are strictly omitted.
 */

import { QuoteStatus } from './enums.types';

export interface IPortalLineItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  netLinePrice: number;
}

export interface IPortalQuotation {
  quoteNumber: string;
  version: number;
  customerName: string;
  status: QuoteStatus;
  currency: string;
  lineItems: IPortalLineItem[];
  subtotalAmount: number;
  totalDiscountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentTerms: string;
  expiresAt: Date | string;
}

export interface ICounterOfferRequest {
  lineItemId: string;
  proposedDiscount: number;
  proposedQuantity?: number;
  message: string;
}

export interface ICounterOfferResponse {
  quoteNumber: string;
  status: QuoteStatus;
  reApprovalRequired: boolean;
  messageId: string;
}

export interface IConfirmQuotationRequest {
  signerName: string;
  signerTitle: string;
  acceptanceNotes?: string;
}

export interface IConfirmQuotationResponse {
  quoteNumber: string;
  status: QuoteStatus;
  salesOrderNumber: string;
  confirmedAt: Date | string;
}

export interface ICustomerNegotiationMessage {
  id: string;
  quotationId: string;
  lineItemId?: string | null;
  authorRole: 'CUSTOMER' | 'SALES_REP';
  authorName: string;
  message: string;
  proposedDiscount?: number | null;
  proposedQuantity?: number | null;
  createdAt: Date | string;
}
