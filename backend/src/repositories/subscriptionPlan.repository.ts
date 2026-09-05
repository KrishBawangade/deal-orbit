import { SubscriptionPlan, Prisma, BillingFrequency } from '@prisma/client';
import { prisma } from '../config/database';

export interface ISubscriptionPlanFilter {
  isActive?: boolean;
  billingFrequency?: BillingFrequency;
  productId?: string;
  search?: string;
}

export class SubscriptionPlanRepository {
  public async findById(id: string): Promise<any | null> {
    return prisma.subscriptionPlan.findUnique({
      where: { id },
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
        prorationRule: true,
        cancellationRule: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<SubscriptionPlan | null> {
    return prisma.subscriptionPlan.findUnique({
      where: { code },
    });
  }

  public async findAll(filter?: ISubscriptionPlanFilter): Promise<any[]> {
    const where: Prisma.SubscriptionPlanWhereInput = {};

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter?.billingFrequency) {
      where.billingFrequency = filter.billingFrequency;
    }

    if (filter?.productId) {
      where.productId = filter.productId;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return prisma.subscriptionPlan.findMany({
      where,
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
        prorationRule: true,
        cancellationRule: true,
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: [{ billingFrequency: 'asc' }, { baseRecurringPrice: 'asc' }],
    });
  }

  public async create(data: Prisma.SubscriptionPlanCreateInput): Promise<SubscriptionPlan> {
    return prisma.subscriptionPlan.create({
      data,
      include: {
        product: true,
        prorationRule: true,
        cancellationRule: true,
      },
    });
  }

  public async update(id: string, data: Prisma.SubscriptionPlanUpdateInput): Promise<SubscriptionPlan> {
    return prisma.subscriptionPlan.update({
      where: { id },
      data,
      include: {
        product: true,
        prorationRule: true,
        cancellationRule: true,
      },
    });
  }

  public async delete(id: string): Promise<{ success: boolean; deactivated?: boolean }> {
    const subCount = await prisma.subscription.count({
      where: { planId: id },
    });

    if (subCount > 0) {
      await prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, deactivated: true };
    }

    await prisma.subscriptionPlan.delete({
      where: { id },
    });
    return { success: true, deactivated: false };
  }
}

export const subscriptionPlanRepository = new SubscriptionPlanRepository();
