/**
 * DealOrbit Frontend Type Definitions & API Contracts
 * Single source of truth for all frontend views, hooks, components, and API clients.
 * Directly aligned with backend/src/types/ and API.md
 */

// ==========================================
// 1. SYSTEM ENUMS & LITERAL CONSTANTS
// ==========================================

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

// ==========================================
// 2. COMMON API ENVELOPES & PAGINATION
// ==========================================

export interface IApiResponseMeta {
  timestamp: string;
  version?: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: IApiResponseMeta;
  error?: IApiErrorDetail | string;
}

export interface IApiErrorDetail {
  code: string;
  message: string;
  details?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface IApiErrorResponse {
  success: false;
  error: IApiErrorDetail;
  meta: IApiResponseMeta;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasMore?: boolean;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pagination: IPaginationMeta;
}

export interface IHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  database: {
    connected: boolean;
    type: string;
    latencyMs?: number;
    error?: string;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
}

// ==========================================
// 3. IDENTITY, USERS & AUTH
// ==========================================

export interface IAuthUser {
  id: string;
  email: string;
  role?: Role;
  name?: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive?: boolean;
  historicalAvgDiscount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | string;
}

export interface IAuthResponse {
  user: IUserResponse;
  tokens: IAuthTokens;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

// ==========================================
// 4. CUSTOMER & NEGOTIATION PROFILES
// ==========================================

export interface ICustomerSummary {
  id: string;
  name: string;
  code: string;
  tier: CustomerTier;
  paymentTerms: string;
}

export interface ICustomer {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone?: string | null;
  tier: CustomerTier;
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  negotiationProfile?: ICustomerNegotiationProfile | null;
}

export interface ICustomerNegotiationProfile {
  id: string;
  customerId: string;
  priceSensitivity: PriceSensitivity | string;
  historicalMinDiscount: number;
  historicalMaxDiscount: number;
  serviceAffinity: number;
  paymentTermElasticity: PaymentTermElasticity | string;
  averageResponseDays: number;
  notes?: string | null;
  updatedAt: string;
}

export interface ICustomerProfileDto {
  customerName: string;
  historicalDiscountRange: [number, number];
  priceSensitivity: PriceSensitivity | string;
  serviceAffinity: number;
  averageResponseDays?: number;
}

// ==========================================
// 5. PRODUCTS, CATALOG & UPSELL
// ==========================================

export interface ICategory {
  id: string;
  name: ProductCategory;
  description?: string | null;
  defaultCeilingDiscount: number;
}

export interface IProductVariant {
  id: string;
  productId: string;
  attributeName: string;
  attributeValue: string;
  priceDelta: number;
  costDelta: number;
  skuModifier?: string | null;
}

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  basePrice: number;
  unit: string;
  taxRate: number;
  description?: string | null;
  isPromoted: boolean;
  minMarginThreshold: number;
  isRecurringDefault: boolean;
  defaultBillingCycle: BillingFrequency;
  isActive: boolean;
  category?: ICategory;
  variants?: IProductVariant[];
}

export interface IProductSummary {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  unit: string;
  isRecurringDefault: boolean;
  defaultBillingCycle: BillingFrequency;
}

export interface IUpsellRecommendationProduct {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory | string;
  unitPrice: number;
}

export interface IUpsellRecommendation {
  ruleId: string;
  product: IUpsellRecommendationProduct;
  marginDeltaPercent: number;
  affinityScore: number;
  promotionalTag?: string | null;
  isMarginSafe: boolean;
}

// ==========================================
// 6. LIVING QUOTATIONS & PRICING
// ==========================================

export interface IQuotationLineInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  discountPercent: number;
  isRecurring?: boolean;
  billingFrequency?: BillingFrequency;
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
  lineMarginPercent: number;
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
  createdAt: string;
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
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateQuotationDto {
  customerId: string;
  paymentTerms?: string;
  lines?: IQuotationLineInput[];
}

export interface IUpdateQuotationDto {
  version: number;
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

// ==========================================
// 7. DEAL STRATEGY SIMULATION
// ==========================================

export interface ISimulationWhatIfOverrides {
  hardwareDiscount?: number;
  serviceDiscount?: number;
  includeBundleSku?: string;
  bundleDiscount?: number;
  paymentTerms?: string;
}

export interface IPredictedCustomerResponse {
  acceptanceProbability: number;
  negotiationProbability: number;
  rejectionProbability: number;
  expectedCounter?: string;
}

export interface ISimulationScenario {
  id: ScenarioId | string;
  name: string;
  hardwareDiscount: number;
  serviceDiscount: number;
  addedBundleSku?: string;
  bundleDiscount?: number;
  projectedMargin: number;
  projectedRiskScore: number;
  requiredApprovals: Array<Role | string>;
  estimatedShipments: number;
  predictedCustomerResponse: IPredictedCustomerResponse;
  strategicRationale?: string;
}

export interface ISimulationRunRequest {
  quotationId: string;
  whatIfOverrides?: ISimulationWhatIfOverrides;
}

export interface ISimulationRunResponse {
  quotationId: string;
  customerProfile: ICustomerProfileDto;
  scenarios: ISimulationScenario[];
}

export interface IApplySimulationRequest {
  quotationId: string;
  scenarioId: ScenarioId | string;
}

export interface IApplySimulationResponse {
  quoteId: string;
  version: number;
  appliedScenario: ScenarioId | string;
  newGrandTotal: number;
  newMarginPercent: number;
  newRiskScore: number;
}

// ==========================================
// 8. GOVERNANCE, CEILINGS & APPROVALS
// ==========================================

export interface ITierCeilingSummary {
  tier: CustomerTier;
  defaultCeiling: number;
}

export interface ICategoryCeilingOverride {
  category: ProductCategory;
  maxDiscount: number;
}

export interface IDiscountCeilingsResponse {
  customerTiers: ITierCeilingSummary[];
  categoryOverrides: ICategoryCeilingOverride[];
}

export interface IApprovalChainRule {
  id: string;
  minRiskScore: number;
  maxRiskScore: number;
  requiresManager: boolean;
  requiresFinance: boolean;
  description?: string | null;
}

export interface IViolatingLine {
  productName: string;
  category: ProductCategory | string;
  ceiling: number;
  proposed: number;
  overagePoints: number;
}

export interface IPendingApprovalItem {
  requestId: string;
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  customerTier: CustomerTier;
  salesRep: {
    name: string;
    historicalAvgDiscount: number;
  };
  blendedRiskScore: number;
  tierLevel: number;
  proposedDiscount: number;
  violatingLines: IViolatingLine[];
  requestedAt: string;
}

export interface IApprovalDecisionDto {
  decision: ApprovalStatus;
  reason: string;
}

export interface IApprovalDecisionResponse {
  requestId: string;
  quotationId: string;
  status: ApprovalStatus;
  nextStep: 'READY_TO_PUBLISH' | 'RETURNED_TO_DRAFT' | 'REQUIRES_HIGHER_TIER';
  auditLogId: string;
}

export interface IAuditLog {
  id: string;
  quotationId?: string | null;
  salesOrderId?: string | null;
  actorId?: string | null;
  action: string;
  previousState?: string | null;
  newState?: string | null;
  reason?: string | null;
  metadataJson?: Record<string, unknown> | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

// ==========================================
// 9. RESTRICTED CUSTOMER PORTAL (MASKED)
// ==========================================

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
  expiresAt: string;
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
  confirmedAt: string;
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
  createdAt: string;
}

// ==========================================
// 10. MULTI-WAREHOUSE FULFILLMENT
// ==========================================

export interface IWarehouse {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  priorityOrder: number;
  shippingCostWeight: number;
  isActive: boolean;
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
  createdAt: string;
}

export interface IFulfillmentSplit {
  id: string;
  salesOrderId: string;
  warehouseId: string;
  shipmentNumber: string;
  status: FulfillmentStatus;
  trackingNumber?: string | null;
  shippingCostWeight: number;
  dispatchedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
  restockedAt?: string | null;
  consolidatedAt?: string | null;
  createdAt: string;
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

// ==========================================
// 11. HYBRID BILLING & SUBSCRIPTIONS
// ==========================================

export interface IInvoiceDto {
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  paidAt?: string | null;
}

export interface IBillingScheduleItem {
  id?: string;
  date: string;
  amount: number;
  status: 'SCHEDULED' | 'PROCESSED' | 'FAILED';
  invoiceId?: string | null;
}

export interface ISubscriptionDto {
  contractNumber: string;
  status: SubscriptionStatus;
  billingFrequency: BillingFrequency;
  recurringAmount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
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
  effectiveDate: string;
}

export interface IModifySubscriptionResponse {
  contractNumber: string;
  previousRate: number;
  newRate: number;
  proration: IProrationBreakdown;
}

// ==========================================
// 12. DEAL HEALTH & ANOMALY RADAR
// ==========================================

export interface IDealHealthAlertDto {
  id: string;
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  metricValue: number;
  benchmarkValue: number;
  description: string;
  createdAt: string;
}

export interface IDealHealthRadarResponse {
  alerts: IDealHealthAlertDto[];
}

export interface INudgeResponse {
  quoteId: string;
  repEmail: string;
  action: string;
  dispatchedAt: string;
}

export interface IEscalateResponse {
  quoteId: string;
  escalatedToRole: string;
  action: string;
  escalatedAt: string;
}

// ==========================================
// 13. ADMIN SETTINGS & SALES REPORTS
// ==========================================

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
