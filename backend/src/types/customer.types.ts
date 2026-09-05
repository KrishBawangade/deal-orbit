/**
 * Customer & Negotiation Profile Types
 * Aligned with Database.md §4.1 and API.md
 */

import { CustomerTier, PriceSensitivity, PaymentTermElasticity } from './enums.types';

export interface ICustomer {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone?: string | null;
  tier: CustomerTier;
  paymentTerms: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  negotiationProfile?: ICustomerNegotiationProfile | null;
}

export interface ICustomerSummary {
  id: string;
  name: string;
  code: string;
  tier: CustomerTier;
  paymentTerms: string;
}

export interface ICustomerNegotiationProfile {
  id: string;
  customerId: string;
  priceSensitivity: PriceSensitivity | string;
  historicalMinDiscount: number;
  historicalMaxDiscount: number;
  serviceAffinity: number; // 0.00 to 1.00
  paymentTermElasticity: PaymentTermElasticity | string;
  averageResponseDays: number;
  notes?: string | null;
  updatedAt: Date | string;
}

export interface ICustomerProfileDto {
  customerName: string;
  historicalDiscountRange: [number, number];
  priceSensitivity: PriceSensitivity | string;
  serviceAffinity: number;
  averageResponseDays?: number;
}

export interface ICreateCustomerDto {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone?: string;
  tier?: CustomerTier;
  paymentTerms?: string;
  negotiationProfile?: {
    priceSensitivity?: PriceSensitivity;
    historicalMinDiscount?: number;
    historicalMaxDiscount?: number;
    serviceAffinity?: number;
    paymentTermElasticity?: PaymentTermElasticity;
    averageResponseDays?: number;
    notes?: string;
  };
}

export interface IUpdateCustomerDto {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  tier?: CustomerTier;
  paymentTerms?: string;
  isActive?: boolean;
}
