import { Subscription, Prisma, SubscriptionStatus, BillingFrequency } from '@prisma/client';
import { prisma } from '../config/database';

export interface ISubscriptionFilter {
  customerId?: string;
  status?: SubscriptionStatus;
  billingFrequency?: BillingFrequency;
  salesOrderId?: string;
  search?: string;
}

export class SubscriptionRepository {
  public async findById(id: string): Promise<any | null> {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            tier: true,
          },
        },
        plan: {
          include: {
            prorationRule: true,
            cancellationRule: true,
          },
        },
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            basePrice: true,
            unit: true,
          },
        },
        billingSchedules: {
          orderBy: { scheduledDate: 'asc' },
        },
        prorationAdjustments: {
          orderBy: { createdAt: 'desc' },
        },
        creditNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  public async findByContractNumber(contractNumber: string): Promise<any | null> {
    return prisma.subscription.findUnique({
      where: { contractNumber },
      include: {
        customer: true,
        plan: true,
        billingSchedules: true,
        prorationAdjustments: true,
        creditNotes: true,
      },
    });
  }

  public async findAll(filter?: ISubscriptionFilter): Promise<any[]> {
    const where: Prisma.SubscriptionWhereInput = {};

    if (filter?.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.billingFrequency) {
      where.billingFrequency = filter.billingFrequency;
    }

    if (filter?.salesOrderId) {
      where.salesOrderId = filter.salesOrderId;
    }

    if (filter?.search) {
      where.OR = [
        { contractNumber: { contains: filter.search, mode: 'insensitive' } },
        { customer: { name: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.subscription.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            code: true,
            billingFrequency: true,
          },
        },
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        billingSchedules: {
          where: { isProcessed: false },
          orderBy: { scheduledDate: 'asc' },
          take: 3,
        },
        _count: {
          select: {
            billingSchedules: true,
            prorationAdjustments: true,
            creditNotes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return prisma.subscription.create({
      data,
      include: {
        customer: true,
        plan: true,
        billingSchedules: true,
      },
    });
  }

  public async update(id: string, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
    return prisma.subscription.update({
      where: { id },
      data,
      include: {
        plan: true,
        billingSchedules: true,
        prorationAdjustments: true,
      },
    });
  }

  public async cancel(
    id: string,
    cancelledAt: Date,
    cancellationReason?: string,
    refundAmount?: number
  ): Promise<Subscription> {
    return prisma.$transaction(async (tx) => {
      // 1. Delete or cancel future pending schedules
      await tx.billingSchedule.deleteMany({
        where: {
          subscriptionId: id,
          isProcessed: false,
          scheduledDate: { gte: cancelledAt },
        },
      });

      // 2. Mark subscription as CANCELLED
      return tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt,
          cancellationReason: cancellationReason || 'Customer requested termination',
          refundAmount: refundAmount !== undefined ? refundAmount : undefined,
        },
      });
    });
  }
}

export const subscriptionRepository = new SubscriptionRepository();
