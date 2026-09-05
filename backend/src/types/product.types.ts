/**
 * Product, Category, Variant & Upsell Types
 * Aligned with Database.md §4.2 and API.md §7
 */

import { ProductCategory, BillingFrequency } from './enums.types';

export interface ICategory {
  id: string;
  name: ProductCategory;
  description?: string | null;
  defaultCeilingDiscount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IProductVariant {
  id: string;
  productId: string;
  attributeName: string;
  attributeValue: string;
  priceDelta: number;
  costDelta: number;
  skuModifier?: string | null;
  createdAt: Date | string;
}

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  basePrice: number;
  costPrice: number; // Confidential internal COGS
  unit: string;
  taxRate: number;
  description?: string | null;
  isPromoted: boolean;
  minMarginThreshold: number;
  isRecurringDefault: boolean;
  defaultBillingCycle: BillingFrequency;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
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

export interface IUpsellRule {
  id: string;
  sourceProductId: string;
  recommendedProductId: string;
  affinityScore: number;
  marginDeltaPercent: number;
  promotionalTag?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  sourceProduct?: IProduct;
  recommendedProduct?: IProduct;
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

export interface IUpsellRecommendationsRequest {
  quotationId?: string;
  cartProductIds: string[];
}

export interface IUpsellRecommendationsResponse {
  recommendations: IUpsellRecommendation[];
}
