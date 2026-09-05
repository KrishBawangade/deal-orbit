import { CustomerTier } from '@prisma/client';
import { priceListRepository, IPriceListFilter } from '../repositories/priceList.repository';
import { productRepository } from '../repositories/product.repository';
import { productVariantRepository } from '../repositories/productVariant.repository';
import { AppError } from '../utils/appError';
import { prisma } from '../config/database';

export interface ICreatePriceListInput {
  name: string;
  description?: string | null;
  currency?: string;
  customerTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'ENTERPRISE' | null;
  isDefault?: boolean;
  isActive?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface IUpdatePriceListInput {
  name?: string;
  description?: string | null;
  currency?: string;
  customerTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'ENTERPRISE' | null;
  isDefault?: boolean;
  isActive?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface ICreateRuleInput {
  productId: string;
  variantId?: string | null;
  customPrice?: number | null;
  discountPercent?: number | null;
  minQuantity?: number;
}

export interface IUpdateRuleInput {
  customPrice?: number | null;
  discountPercent?: number | null;
  minQuantity?: number;
}

export interface ICalculatePriceInput {
  productId: string;
  variantId?: string | null;
  customerTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'ENTERPRISE';
  priceListId?: string;
  currency?: string;
  quantity?: number;
}

export class PriceListService {
  /**
   * List all price lists
   */
  public async listPriceLists(filter?: {
    currency?: string;
    customerTier?: string;
    isActive?: boolean;
  }) {
    const repoFilter: IPriceListFilter = {
      currency: filter?.currency,
      customerTier: filter?.customerTier as CustomerTier,
      isActive: filter?.isActive,
    };
    return priceListRepository.findAll(repoFilter);
  }

  /**
   * Get single price list with rules and product details
   */
  public async getPriceListById(id: string) {
    const priceList = await priceListRepository.findByIdWithRules(id);
    if (!priceList) {
      throw new AppError(`Price list with ID ${id} not found`, 404);
    }
    return priceList;
  }

  /**
   * Create a new price list
   */
  public async createPriceList(dto: ICreatePriceListInput) {
    const currency = (dto.currency || 'INR').toUpperCase();
    const isDefault = dto.isDefault ?? false;

    // If marked default, unset any existing default with the same currency
    if (isDefault) {
      await prisma.priceList.updateMany({
        where: {
          currency,
          customerTier: (dto.customerTier as CustomerTier) || null,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return priceListRepository.create({
      name: dto.name,
      description: dto.description || null,
      currency,
      customerTier: (dto.customerTier as CustomerTier) || null,
      isDefault,
      isActive: dto.isActive ?? true,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
      validTo: dto.validTo ? new Date(dto.validTo) : null,
    });
  }

  /**
   * Update an existing price list
   */
  public async updatePriceList(id: string, dto: IUpdatePriceListInput) {
    const existing = await priceListRepository.findById(id);
    if (!existing) {
      throw new AppError(`Price list with ID ${id} not found`, 404);
    }

    const currency = dto.currency ? dto.currency.toUpperCase() : existing.currency;

    if (dto.isDefault) {
      await prisma.priceList.updateMany({
        where: {
          id: { not: id },
          currency,
          customerTier: dto.customerTier !== undefined ? (dto.customerTier as CustomerTier) : existing.customerTier,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return priceListRepository.update(id, {
      name: dto.name,
      description: dto.description,
      currency,
      customerTier: dto.customerTier !== undefined ? (dto.customerTier as CustomerTier) : undefined,
      isDefault: dto.isDefault,
      isActive: dto.isActive,
      validFrom: dto.validFrom !== undefined ? (dto.validFrom ? new Date(dto.validFrom) : null) : undefined,
      validTo: dto.validTo !== undefined ? (dto.validTo ? new Date(dto.validTo) : null) : undefined,
    });
  }

  /**
   * Delete a price list
   */
  public async deletePriceList(id: string) {
    const existing = await priceListRepository.findById(id);
    if (!existing) {
      throw new AppError(`Price list with ID ${id} not found`, 404);
    }
    return priceListRepository.delete(id);
  }

  /**
   * Add a pricing rule to a price list
   */
  public async addRule(priceListId: string, dto: ICreateRuleInput) {
    const priceList = await priceListRepository.findById(priceListId);
    if (!priceList) {
      throw new AppError(`Price list with ID ${priceListId} not found`, 404);
    }

    const product = await productRepository.findById(dto.productId);
    if (!product) {
      throw new AppError(`Product with ID ${dto.productId} not found`, 404);
    }

    if (dto.variantId) {
      const variant = await productVariantRepository.findById(dto.variantId);
      if (!variant || variant.productId !== dto.productId) {
        throw new AppError(`Variant ${dto.variantId} does not belong to product ${dto.productId}`, 400);
      }
    }

    const minQuantity = dto.minQuantity || 1;

    // Check for existing rule collision
    const existingRule = await prisma.priceListRule.findFirst({
      where: {
        priceListId,
        productId: dto.productId,
        variantId: dto.variantId || null,
        minQuantity,
      },
    });

    if (existingRule) {
      // Update existing rule
      return priceListRepository.updateRule(existingRule.id, {
        customPrice: dto.customPrice !== undefined ? dto.customPrice : existingRule.customPrice,
        discountPercent: dto.discountPercent !== undefined ? dto.discountPercent : existingRule.discountPercent,
      });
    }

    return priceListRepository.createRule({
      priceList: { connect: { id: priceListId } },
      product: { connect: { id: dto.productId } },
      variant: dto.variantId ? { connect: { id: dto.variantId } } : undefined,
      customPrice: dto.customPrice ?? null,
      discountPercent: dto.discountPercent ?? null,
      minQuantity,
    });
  }

  /**
   * Update a pricing rule
   */
  public async updateRule(priceListId: string, ruleId: string, dto: IUpdateRuleInput) {
    const rule = await priceListRepository.findRuleById(ruleId);
    if (!rule || rule.priceListId !== priceListId) {
      throw new AppError(`Pricing rule ${ruleId} not found on price list ${priceListId}`, 404);
    }

    return priceListRepository.updateRule(ruleId, {
      customPrice: dto.customPrice !== undefined ? dto.customPrice : undefined,
      discountPercent: dto.discountPercent !== undefined ? dto.discountPercent : undefined,
      minQuantity: dto.minQuantity !== undefined ? dto.minQuantity : undefined,
    });
  }

  /**
   * Delete a pricing rule
   */
  public async deleteRule(priceListId: string, ruleId: string) {
    const rule = await priceListRepository.findRuleById(ruleId);
    if (!rule || rule.priceListId !== priceListId) {
      throw new AppError(`Pricing rule ${ruleId} not found on price list ${priceListId}`, 404);
    }
    return priceListRepository.deleteRule(ruleId);
  }

  /**
   * Dynamic Price Calculation Engine
   * Computes the effective unit price taking into account:
   * 1. Base Product Price
   * 2. Variant Delta (+/- price)
   * 3. Customer Tier or Currency Price List
   * 4. Fixed price override OR Percentage tier discount
   * 5. Quantity volume threshold
   */
  public async calculateEffectivePrice(dto: ICalculatePriceInput) {
    const product = await productRepository.findById(dto.productId);
    if (!product) {
      throw new AppError(`Product with ID ${dto.productId} not found`, 404);
    }

    let variantPriceDelta = 0;
    let variantDesc: string | null = null;
    if (dto.variantId) {
      const variant = await productVariantRepository.findById(dto.variantId);
      if (variant && variant.productId === dto.productId) {
        variantPriceDelta = Number(variant.priceDelta);
        variantDesc = `${variant.attributeName}: ${variant.attributeValue}`;
      }
    }

    const baseUnitPrice = Number(product.basePrice);
    const quantity = Math.max(1, dto.quantity || 1);
    const currency = (dto.currency || 'INR').toUpperCase();
    const customerTier = dto.customerTier as CustomerTier | undefined;

    // Find best matching price rule
    const match = await priceListRepository.findBestMatchingRule({
      productId: dto.productId,
      variantId: dto.variantId,
      priceListId: dto.priceListId,
      customerTier,
      currency,
      quantity,
    });

    let effectiveUnitPrice = baseUnitPrice + variantPriceDelta;
    let appliedRule: any = null;

    if (match && match.rule) {
      const rule = match.rule;
      if (rule.customPrice !== null && rule.customPrice !== undefined) {
        effectiveUnitPrice = Number(rule.customPrice) + variantPriceDelta;
        appliedRule = {
          ruleId: rule.id,
          priceListName: match.priceList.name,
          ruleType: 'CUSTOM_FIXED_PRICE',
          value: Number(rule.customPrice),
        };
      } else if (rule.discountPercent !== null && rule.discountPercent !== undefined) {
        const discountFraction = Number(rule.discountPercent) / 100;
        effectiveUnitPrice = Math.round((baseUnitPrice + variantPriceDelta) * (1 - discountFraction) * 100) / 100;
        appliedRule = {
          ruleId: rule.id,
          priceListName: match.priceList.name,
          ruleType: 'TIER_DISCOUNT_PERCENT',
          value: Number(rule.discountPercent),
        };
      }
    }

    const lineSubtotal = Math.round(effectiveUnitPrice * quantity * 100) / 100;

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      variantId: dto.variantId || null,
      variantDescription: variantDesc,
      baseUnitPrice,
      variantPriceDelta,
      effectiveUnitPrice,
      currency: match?.priceList?.currency || currency,
      quantity,
      lineSubtotal,
      appliedRule,
    };
  }
}

export const priceListService = new PriceListService();
