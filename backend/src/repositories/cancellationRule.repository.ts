import { CancellationRule, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class CancellationRuleRepository {
  public async findById(id: string): Promise<CancellationRule | null> {
    return prisma.cancellationRule.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptionPlans: true },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<CancellationRule | null> {
    return prisma.cancellationRule.findUnique({
      where: { code },
    });
  }

  public async findDefault(): Promise<CancellationRule | null> {
    return prisma.cancellationRule.findFirst({
      where: { isDefault: true },
    });
  }

  public async findAll(): Promise<CancellationRule[]> {
    return prisma.cancellationRule.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  public async create(data: Prisma.CancellationRuleCreateInput): Promise<CancellationRule> {
    if (data.isDefault) {
      await prisma.cancellationRule.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.cancellationRule.create({
      data,
    });
  }

  public async update(id: string, data: Prisma.CancellationRuleUpdateInput): Promise<CancellationRule> {
    if (data.isDefault) {
      await prisma.cancellationRule.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.cancellationRule.update({
      where: { id },
      data,
    });
  }
}

export const cancellationRuleRepository = new CancellationRuleRepository();
