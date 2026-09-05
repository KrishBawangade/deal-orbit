import { PriceList, PriceListRule, CustomerTier, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export interface IPriceListFilter {
  currency?: string;
  customerTier?: CustomerTier;
  isActive?: boolean;
}

export interface IPriceListRepository extends IBaseRepository<PriceList, string, Prisma.PriceListCreateInput> {
  findByIdWithRules(id: string): Promise<any | null>;
  findDefault(customerTier?: CustomerTier, currency?: string): Promise<PriceList | null>;
  findRuleById(ruleId: string): Promise<PriceListRule | null>;
  createRule(data: Prisma.PriceListRuleCreateInput): Promise<PriceListRule>;
  updateRule(id: string, data: Prisma.PriceListRuleUpdateInput): Promise<PriceListRule | null>;
  deleteRule(id: string): Promise<boolean>;
  findBestMatchingRule(params: {
    productId: string;
    variantId?: string | null;
    priceListId?: string;
    customerTier?: CustomerTier;
    currency?: string;
    quantity?: number;
  }): Promise<{ rule: any; priceList: PriceList } | null>;
}

export class PriceListRepository implements IPriceListRepository {
  public async findById(id: string): Promise<PriceList | null> {
    return prisma.priceList.findUnique({
      where: { id },
    });
  }

  public async findByIdWithRules(id: string): Promise<any | null> {
    return prisma.priceList.findUnique({
      where: { id },
      include: {
        rules: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                basePrice: true,
                unit: true,
                category: true,
              },
            },
            variant: true,
          },
          orderBy: [{ minQuantity: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
  }

  public async findAll(filter?: IPriceListFilter): Promise<any[]> {
    const where: Prisma.PriceListWhereInput = {};

    if (filter?.currency) {
      where.currency = filter.currency;
    }
    if (filter?.customerTier) {
      where.customerTier = filter.customerTier;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    return prisma.priceList.findMany({
      where,
      include: {
        _count: {
          select: { rules: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  public async findDefault(customerTier?: CustomerTier, currency = 'INR'): Promise<PriceList | null> {
    // 1. Try finding explicit tier + currency match
    if (customerTier) {
      const tierMatch = await prisma.priceList.findFirst({
        where: {
          customerTier,
          currency,
          isActive: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      if (tierMatch) return tierMatch;
    }

    // 2. Try finding currency default
    const currencyDefault = await prisma.priceList.findFirst({
      where: {
        currency,
        isDefault: true,
        isActive: true,
      },
    });
    if (currencyDefault) return currencyDefault;

    // 3. Fallback to any active default
    return prisma.priceList.findFirst({
      where: {
        isDefault: true,
        isActive: true,
      },
    });
  }

  public async create(data: Prisma.PriceListCreateInput): Promise<PriceList> {
    return prisma.priceList.create({
      data,
    });
  }

  public async update(id: string, data: Prisma.PriceListUpdateInput): Promise<PriceList | null> {
    return prisma.priceList.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.priceList.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async findRuleById(ruleId: string): Promise<PriceListRule | null> {
    return prisma.priceListRule.findUnique({
      where: { id: ruleId },
    });
  }

  public async createRule(data: Prisma.PriceListRuleCreateInput): Promise<PriceListRule> {
    return prisma.priceListRule.create({
      data,
      include: {
        product: true,
        variant: true,
      },
    });
  }

  public async updateRule(id: string, data: Prisma.PriceListRuleUpdateInput): Promise<PriceListRule | null> {
    return prisma.priceListRule.update({
      where: { id },
      data,
      include: {
        product: true,
        variant: true,
      },
    });
  }

  public async deleteRule(id: string): Promise<boolean> {
    try {
      await prisma.priceListRule.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async findBestMatchingRule(params: {
    productId: string;
    variantId?: string | null;
    priceListId?: string;
    customerTier?: CustomerTier;
    currency?: string;
    quantity?: number;
  }): Promise<{ rule: any; priceList: PriceList } | null> {
    const qty = params.quantity || 1;
    let targetPriceListId = params.priceListId;

    let priceList: PriceList | null = null;
    if (targetPriceListId) {
      priceList = await this.findById(targetPriceListId);
    } else {
      priceList = await this.findDefault(params.customerTier, params.currency || 'INR');
      targetPriceListId = priceList?.id;
    }

    if (!targetPriceListId || !priceList) {
      return null;
    }

    // Look for variant-specific rule first, then product-wide rule
    const rules = await prisma.priceListRule.findMany({
      where: {
        priceListId: targetPriceListId,
        productId: params.productId,
        minQuantity: { lte: qty },
        OR: [
          ...(params.variantId ? [{ variantId: params.variantId }] : []),
          { variantId: null },
        ],
      },
      orderBy: [
        { variantId: 'desc' }, // specific variant first
        { minQuantity: 'desc' }, // highest matching volume tier
      ],
      take: 1,
    });

    if (rules.length === 0) {
      return { rule: null, priceList };
    }

    return { rule: rules[0], priceList };
  }
}

export const priceListRepository = new PriceListRepository();
