/**
 * Deal Health & Anomaly Radar Types
 * Aligned with Database.md §4.7 and API.md §12
 */

import { AlertType, AlertSeverity } from './enums.types';

export interface IDealHealthAlert {
  id: string;
  quotationId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  metricValue: number;
  benchmarkValue: number;
  description: string;
  isResolved: boolean;
  createdAt: Date | string;
  resolvedAt?: Date | string | null;
}

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
  createdAt: Date | string;
}

export interface IDealHealthRadarResponse {
  alerts: IDealHealthAlertDto[];
}

export interface INudgeResponse {
  quoteId: string;
  repEmail: string;
  action: string;
  dispatchedAt: Date | string;
}

export interface IEscalateResponse {
  quoteId: string;
  escalatedToRole: string;
  action: string;
  escalatedAt: Date | string;
}
