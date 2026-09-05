/**
 * Hybrid Billing, Subscriptions & Proration Types
 * Aligned with Database.md §4.6 and API.md §11
 */

import {
  InvoiceType,
  InvoiceStatus,
  SubscriptionStatus,
  BillingFrequency,
} from './enums.types';

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId: string;
  customerId: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: Date | string;
  paidAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IInvoiceDto {
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: Date | string;
  paidAt?: Date | string | null;
}

export interface IBillingScheduleItem {
  id?: string;
  date: string;
  amount: number;
  status: 'SCHEDULED' | 'PROCESSED' | 'FAILED';
  invoiceId?: string | null;
}

export interface ISubscription {
  id: string;
  contractNumber: string;
  salesOrderId: string;
  customerId: string;
  status: SubscriptionStatus;
  billingFrequency: BillingFrequency;
  recurringAmount: number;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  nextBillingDate: Date | string;
  cancelledAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISubscriptionDto {
  contractNumber: string;
  status: SubscriptionStatus;
  billingFrequency: BillingFrequency;
  recurringAmount: number;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  nextBillingDate: Date | string;
  schedule?: IBillingScheduleItem[];
}

export interface IProrationBreakdown {
  daysRemaining: number;
  daysInPeriod: number;
  prorationFraction: number;
  proratedChargeAmount: number;
  adjustmentInvoiceNumber?: string;
}

export interface IModifySubscriptionRequest {
  newPlanRate: number;
  effectiveDate: Date | string;
}

export interface IModifySubscriptionResponse {
  contractNumber: string;
  previousRate: number;
  newRate: number;
  proration: IProrationBreakdown;
}

export interface IRecordPaymentRequest {
  paidAmount: number;
  paymentMethod?: string;
  referenceNote?: string;
}

export interface ICreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  invoiceId?: string | null;
  subscriptionId?: string | null;
  amount: number;
  reason: string;
  createdAt: Date | string;
}
