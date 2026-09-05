/**
 * Deal Strategy Simulator Types
 * Aligned with Database.md §4.4 and API.md §6
 */

import { ScenarioId, Role } from './enums.types';
import { ICustomerProfileDto } from './customer.types';

export interface ISimulationWhatIfOverrides {
  hardwareDiscount?: number;
  serviceDiscount?: number;
  includeBundleSku?: string;
  bundleDiscount?: number;
  paymentTerms?: string;
}

export interface IPredictedCustomerResponse {
  acceptanceProbability: number; // 0 - 100%
  negotiationProbability: number; // 0 - 100%
  rejectionProbability: number; // 0 - 100%
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
