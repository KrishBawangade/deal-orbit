import { ProrationRule, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class ProrationRuleRepository {
  public async findById(id: string): Promise<ProrationRule | null> {
    return prisma.prorationRule.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptionPlans: true },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<ProrationRule | null> {
    return prisma.prorationRule.findUnique({
      where: { code },
    });
  }

  public async findDefault(): Promise<ProrationRule | null> {
    return prisma.prorationRule.findFirst({
      where: { isDefault: true },
    });
  }

  public async findAll(): Promise<ProrationRule[]> {
    return prisma.prorationRule.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  public async create(data: Prisma.ProrationRuleCreateInput): Promise<ProrationRule> {
    if (data.isDefault) {
      await prisma.prorationRule.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.prorationRule.create({
      data,
    });
  }

  public async update(id: string, data: Prisma.ProrationRuleUpdateInput): Promise<ProrationRule> {
    if (data.isDefault) {
      await prisma.prorationRule.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.prorationRule.update({
      where: { id },
      data,
    });
  }
}

export const prorationRuleRepository = new ProrationRuleRepository();
