/**
 * Price List & Currency/Tier Pricing Types
 * Aligned with PRD §4.1 A2 and Architecture §4
 */

import { CustomerTier } from './enums.types';
import { IProductSummary, IProductVariant } from './product.types';

export interface IPriceListRule {
  id: string;
  priceListId: string;
  productId: string;
  variantId?: string | null;
  customPrice?: number | null;
  discountPercent?: number | null;
  minQuantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  product?: IProductSummary;
  variant?: IProductVariant | null;
}

export interface IPriceList {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  customerTier?: CustomerTier | null;
  isDefault: boolean;
  isActive: boolean;
  validFrom?: Date | string | null;
  validTo?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  rules?: IPriceListRule[];
  _count?: {
    rules: number;
  };
}

export interface ICreatePriceListDto {
  name: string;
  description?: string;
  currency: string;
  customerTier?: CustomerTier;
  isDefault?: boolean;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
}

export interface IUpdatePriceListDto {
  name?: string;
  description?: string;
  currency?: string;
  customerTier?: CustomerTier | null;
  isDefault?: boolean;
  isActive?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface ICreatePriceListRuleDto {
  productId: string;
  variantId?: string | null;
  customPrice?: number | null;
  discountPercent?: number | null;
  minQuantity?: number;
}

export interface IUpdatePriceListRuleDto {
  customPrice?: number | null;
  discountPercent?: number | null;
  minQuantity?: number;
}

export interface ICalculatePriceRequest {
  productId: string;
  variantId?: string;
  customerTier?: CustomerTier;
  priceListId?: string;
  currency?: string;
  quantity?: number;
}

export interface ICalculatePriceResponse {
  productId: string;
  productName: string;
  sku: string;
  variantId?: string | null;
  variantDescription?: string | null;
  baseUnitPrice: number;
  variantPriceDelta: number;
  effectiveUnitPrice: number;
  currency: string;
  quantity: number;
  lineSubtotal: number;
  appliedRule?: {
    ruleId: string;
    priceListName: string;
    ruleType: 'CUSTOM_FIXED_PRICE' | 'TIER_DISCOUNT_PERCENT';
    value: number;
  } | null;
}
