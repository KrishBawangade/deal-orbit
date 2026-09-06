/**
 * Deal Strategy Simulator Types
 * Aligned with Database.md §4.4, API.md §6, and Cold-Start Chat Intelligence
 */

import { ScenarioId, Role } from './enums.types';
import { ICustomerProfileDto } from './customer.types';

export interface ISimulationWhatIfOverrides {
  hardwareDiscount?: number;
  serviceDiscount?: number;
  includeBundleSku?: string;
  bundleDiscount?: number;
  paymentTerms?: string;
  expeditedDelivery?: boolean;
}

export interface IPredictedCustomerResponse {
  acceptanceProbability: number; // 0 - 100%
  negotiationProbability: number; // 0 - 100%
  rejectionProbability: number; // 0 - 100%
  walkAwayRisk: number; // 0 - 100% (Deal cancellation / churn risk)
  dealRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedCounter?: string;
  behavioralReasoning?: string;
}

export interface ISimulationScenario {
  id: ScenarioId | string;
  name: string;
  scenarioType: 'AGGRESSIVE' | 'RECOMMENDED_BUNDLE' | 'MARGIN_DEFENSE' | 'WHAT_IF';
  hardwareDiscount: number;
  serviceDiscount: number;
  addedBundleSku?: string;
  bundleDiscount?: number;
  paymentTerms?: string;
  expeditedDelivery?: boolean;
  projectedMargin: number;
  projectedRiskScore: number;
  requiredApprovals: Array<Role | string>;
  estimatedShipments: number;
  predictedCustomerResponse: IPredictedCustomerResponse;
  strategicRationale?: string;
  draftReplyMessage?: string;
}

export interface InferredCustomerChatProfile {
  isNewCustomer: boolean;
  priceSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  urgencyLevel: 'NORMAL' | 'HIGH' | 'CRITICAL';
  competitorMentioned?: string;
  cashFlowSensitive: boolean;
  demandedDiscountPercent?: number;
  demandedPaymentTerms?: string;
  keyDemands: string[];
  confidenceScore: number;
  suggestedCounterStrategy: string;
}

export interface ISimulationRunRequest {
  quotationId: string;
  whatIfOverrides?: ISimulationWhatIfOverrides;
  chatMessage?: string;
  isNewCustomer?: boolean;
}

export interface ISimulationRunResponse {
  quotationId: string;
  customerProfile: ICustomerProfileDto;
  inferredChatProfile?: InferredCustomerChatProfile;
  scenarios: ISimulationScenario[];
  activeQuotationSnapshot: {
    quoteNumber: string;
    customerName: string;
    tier: string;
    subtotalAmount: number;
    currentMargin: number;
    currentRiskScore: number;
  };
}

export interface IApplySimulationRequest {
  quotationId: string;
  scenarioId: ScenarioId | string;
  customOverrides?: ISimulationWhatIfOverrides;
  syncNegotiationThread?: boolean;
  replyMessage?: string;
}

export interface IApplySimulationResponse {
  quoteId: string;
  version: number;
  appliedScenario: ScenarioId | string;
  newGrandTotal: number;
  newMarginPercent: number;
  newRiskScore: number;
  threadMessageId?: string;
}

export interface IGeminiReplyRequest {
  quotationId: string;
  customerName: string;
  isNewCustomer?: boolean;
  incomingCustomerMessage?: string;
  inferredProfile?: InferredCustomerChatProfile;
  selectedScenario: ISimulationScenario;
  replyTone: 'COLLABORATIVE_VALUE' | 'EXECUTIVE_PARTNERSHIP' | 'PRINCIPLED_BOUNDARY';
}

export interface IGeminiReplyResponse {
  success: boolean;
  replyMessage: string;
  tone: string;
  strategicBulletPoints: string[];
  suggestedSubject: string;
}
