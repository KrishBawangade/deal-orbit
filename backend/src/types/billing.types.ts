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

export interface ISubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  billingFrequency: BillingFrequency;
  billingCycleDays: number;
  planType: string;
  baseRecurringPrice: number;
  setupFee: number;
  minCommitmentMonths: number;
  trialDays: number;
  isActive: boolean;
  productId?: string | null;
  product?: {
    id: string;
    sku: string;
    name: string;
    basePrice: number;
    unit: string;
  } | null;
  prorationRuleId?: string | null;
  prorationRule?: IProrationRule | null;
  cancellationRuleId?: string | null;
  cancellationRule?: ICancellationRule | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IProrationRule {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  prorationMethod: 'EXACT_DAY_COUNT' | 'CALENDAR_30_DAYS' | 'NONE';
  allowMidCyclePlanChange: boolean;
  allowMidCycleQtyChange: boolean;
  creditOnDowngrade: boolean;
  chargeImmediately: boolean;
  minimumRemainingDays: number;
  isDefault: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICancellationRule {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  cancellationPolicy: 'IMMEDIATE_WITH_PRORATED_REFUND' | 'END_OF_BILLING_PERIOD' | 'NO_REFUND';
  cancellationNoticeDays: number;
  cancellationFeePercent: number;
  refundMethod: 'CREDIT_NOTE' | 'DIRECT_REFUND' | 'WALLET_BALANCE';
  coolingOffPeriodDays: number;
  minimumRemainingDays: number;
  isDefault: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ISubscriptionSetupDto {
  plans: ISubscriptionPlan[];
  prorationRules: IProrationRule[];
  cancellationRules: ICancellationRule[];
  eligibleProducts: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    basePrice: number;
    unit: string;
  }>;
}

export interface ISubscription {
  id: string;
  contractNumber: string;
  salesOrderId?: string | null;
  customerId: string;
  planId?: string | null;
  productId?: string | null;
  status: SubscriptionStatus;
  billingFrequency: BillingFrequency;
  recurringAmount: number;
  quantity: number;
  unitPrice: number;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  nextBillingDate: Date | string;
  cancelledAt?: Date | string | null;
  cancellationReason?: string | null;
  refundAmount?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  plan?: ISubscriptionPlan | null;
  billingSchedules?: IBillingScheduleItem[];
  creditNotes?: ICreditNote[];
}

export interface ISubscriptionDto {
  id?: string;
  contractNumber: string;
  customerId?: string;
  customerName?: string;
  planName?: string;
  status: SubscriptionStatus;
  billingFrequency: BillingFrequency;
  recurringAmount: number;
  quantity: number;
  unitPrice: number;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  nextBillingDate: Date | string;
  cancelledAt?: Date | string | null;
  cancellationReason?: string | null;
  refundAmount?: number | null;
  schedule?: IBillingScheduleItem[];
  creditNotes?: ICreditNote[];
}

export interface IProrationBreakdown {
  daysRemaining: number;
  daysInPeriod: number;
  prorationFraction: number;
  previousRate: number;
  newRate: number;
  rateDelta: number;
  proratedChargeAmount: number;
  isCredit: boolean;
  adjustmentInvoiceNumber?: string;
  creditNoteNumber?: string;
}

export interface IModifySubscriptionRequest {
  newPlanId?: string;
  newPlanRate?: number;
  newQuantity?: number;
  effectiveDate?: Date | string;
  notes?: string;
}

export interface IModifySubscriptionResponse {
  contractNumber: string;
  previousRate: number;
  newRate: number;
  proration: IProrationBreakdown;
  subscription: ISubscriptionDto;
}

export interface ICancelSubscriptionRequest {
  effectiveDate?: Date | string;
  reason?: string;
}

export interface ICancelSubscriptionResponse {
  contractNumber: string;
  status: SubscriptionStatus;
  cancelledAt: Date | string;
  unconsumedBalance: number;
  cancellationFeeDeducted: number;
  refundAmount: number;
  creditNoteNumber?: string;
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
