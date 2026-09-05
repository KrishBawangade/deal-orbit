/**
 * Governance, Approvals & Audit Log Types
 * Aligned with Database.md §4.3 and API.md §4 & §8
 */

import {
  ApprovalStatus,
  CustomerTier,
  ProductCategory,
  Role,
} from './enums.types';

export interface IDiscountCeiling {
  id: string;
  customerTier: CustomerTier;
  categoryId: string;
  maxDiscountPercent: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

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
  requestedAt: Date | string;
}

export interface IApprovalRequest {
  id: string;
  quotationId: string;
  approverId?: string | null;
  tierLevel: number;
  status: ApprovalStatus;
  decisionReason?: string | null;
  requestedAt: Date | string;
  decidedAt?: Date | string | null;
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
  createdAt: Date | string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}
