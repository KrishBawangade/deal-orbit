/**
 * System-wide Enumerations and Type Literals for DealOrbit
 * Aligned with Database.md §3 and API.md
 */

export type Role = 'ADMIN' | 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE_OPS' | 'CUSTOMER';

export const Role = {
  ADMIN: 'ADMIN' as Role,
  SALES_REP: 'SALES_REP' as Role,
  SALES_MANAGER: 'SALES_MANAGER' as Role,
  FINANCE_OPS: 'FINANCE_OPS' as Role,
  CUSTOMER: 'CUSTOMER' as Role,
};

export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'ENTERPRISE';

export const CustomerTier = {
  BRONZE: 'BRONZE' as CustomerTier,
  SILVER: 'SILVER' as CustomerTier,
  GOLD: 'GOLD' as CustomerTier,
  ENTERPRISE: 'ENTERPRISE' as CustomerTier,
};

export type ProductCategory = 'HARDWARE' | 'SOFTWARE' | 'SERVICES';

export const ProductCategory = {
  HARDWARE: 'HARDWARE' as ProductCategory,
  SOFTWARE: 'SOFTWARE' as ProductCategory,
  SERVICES: 'SERVICES' as ProductCategory,
};

export type QuoteStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'CUSTOMER_REVIEW'
  | 'NEGOTIATING'
  | 'ACCEPTED'
  | 'CONVERTED_TO_ORDER'
  | 'REJECTED'
  | 'EXPIRED';

export const QuoteStatus = {
  DRAFT: 'DRAFT' as QuoteStatus,
  IN_REVIEW: 'IN_REVIEW' as QuoteStatus,
  APPROVED: 'APPROVED' as QuoteStatus,
  CUSTOMER_REVIEW: 'CUSTOMER_REVIEW' as QuoteStatus,
  NEGOTIATING: 'NEGOTIATING' as QuoteStatus,
  ACCEPTED: 'ACCEPTED' as QuoteStatus,
  CONVERTED_TO_ORDER: 'CONVERTED_TO_ORDER' as QuoteStatus,
  REJECTED: 'REJECTED' as QuoteStatus,
  EXPIRED: 'EXPIRED' as QuoteStatus,
};

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'REVOKED_BY_MUTATION';

export const ApprovalStatus = {
  PENDING: 'PENDING' as ApprovalStatus,
  APPROVED: 'APPROVED' as ApprovalStatus,
  REJECTED: 'REJECTED' as ApprovalStatus,
  CHANGES_REQUESTED: 'CHANGES_REQUESTED' as ApprovalStatus,
  REVOKED_BY_MUTATION: 'REVOKED_BY_MUTATION' as ApprovalStatus,
};

export type ApprovalRequirement =
  | 'NONE'
  | 'MANAGER_REQUIRED'
  | 'FINANCE_REQUIRED'
  | 'DUAL_REQUIRED';

export const ApprovalRequirement = {
  NONE: 'NONE' as ApprovalRequirement,
  MANAGER_REQUIRED: 'MANAGER_REQUIRED' as ApprovalRequirement,
  FINANCE_REQUIRED: 'FINANCE_REQUIRED' as ApprovalRequirement,
  DUAL_REQUIRED: 'DUAL_REQUIRED' as ApprovalRequirement,
};

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED';

export const OrderStatus = {
  PENDING: 'PENDING' as OrderStatus,
  PROCESSING: 'PROCESSING' as OrderStatus,
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED' as OrderStatus,
  FULFILLED: 'FULFILLED' as OrderStatus,
  CANCELLED: 'CANCELLED' as OrderStatus,
};

export type FulfillmentStatus =
  | 'PENDING'
  | 'READY_FOR_PICKING'
  | 'SHIPPED'
  | 'DELIVERED';

export const FulfillmentStatus = {
  PENDING: 'PENDING' as FulfillmentStatus,
  READY_FOR_PICKING: 'READY_FOR_PICKING' as FulfillmentStatus,
  SHIPPED: 'SHIPPED' as FulfillmentStatus,
  DELIVERED: 'DELIVERED' as FulfillmentStatus,
};

export type BackorderStatus = 'PENDING' | 'REPLENISHED' | 'CONSOLIDATED';

export const BackorderStatus = {
  PENDING: 'PENDING' as BackorderStatus,
  REPLENISHED: 'REPLENISHED' as BackorderStatus,
  CONSOLIDATED: 'CONSOLIDATED' as BackorderStatus,
};

export type BillingFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export const BillingFrequency = {
  ONE_TIME: 'ONE_TIME' as BillingFrequency,
  MONTHLY: 'MONTHLY' as BillingFrequency,
  QUARTERLY: 'QUARTERLY' as BillingFrequency,
  YEARLY: 'YEARLY' as BillingFrequency,
};

export type InvoiceType = 'COMMERCIAL_INVOICE' | 'PRORATION_ADJUSTMENT';

export const InvoiceType = {
  COMMERCIAL_INVOICE: 'COMMERCIAL_INVOICE' as InvoiceType,
  PRORATION_ADJUSTMENT: 'PRORATION_ADJUSTMENT' as InvoiceType,
};

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export const InvoiceStatus = {
  DRAFT: 'DRAFT' as InvoiceStatus,
  SENT: 'SENT' as InvoiceStatus,
  PAID: 'PAID' as InvoiceStatus,
  OVERDUE: 'OVERDUE' as InvoiceStatus,
  CANCELLED: 'CANCELLED' as InvoiceStatus,
};

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'MODIFIED'
  | 'CANCELLED'
  | 'EXPIRED';

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE' as SubscriptionStatus,
  PAUSED: 'PAUSED' as SubscriptionStatus,
  MODIFIED: 'MODIFIED' as SubscriptionStatus,
  CANCELLED: 'CANCELLED' as SubscriptionStatus,
  EXPIRED: 'EXPIRED' as SubscriptionStatus,
};

export type AlertType =
  | 'STALLED_DEAL'
  | 'DISCOUNT_ANOMALY'
  | 'DELIVERY_SLIPPAGE';

export const AlertType = {
  STALLED_DEAL: 'STALLED_DEAL' as AlertType,
  DISCOUNT_ANOMALY: 'DISCOUNT_ANOMALY' as AlertType,
  DELIVERY_SLIPPAGE: 'DELIVERY_SLIPPAGE' as AlertType,
};

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export const AlertSeverity = {
  LOW: 'LOW' as AlertSeverity,
  MEDIUM: 'MEDIUM' as AlertSeverity,
  HIGH: 'HIGH' as AlertSeverity,
};

export type PriceSensitivity = 'LOW' | 'MEDIUM' | 'HIGH';

export const PriceSensitivity = {
  LOW: 'LOW' as PriceSensitivity,
  MEDIUM: 'MEDIUM' as PriceSensitivity,
  HIGH: 'HIGH' as PriceSensitivity,
};

export type PaymentTermElasticity = 'LOW' | 'MEDIUM' | 'HIGH';

export const PaymentTermElasticity = {
  LOW: 'LOW' as PaymentTermElasticity,
  MEDIUM: 'MEDIUM' as PaymentTermElasticity,
  HIGH: 'HIGH' as PaymentTermElasticity,
};

export type ScenarioId = 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C';

export const ScenarioId = {
  SCENARIO_A: 'SCENARIO_A' as ScenarioId,
  SCENARIO_B: 'SCENARIO_B' as ScenarioId,
  SCENARIO_C: 'SCENARIO_C' as ScenarioId,
};
