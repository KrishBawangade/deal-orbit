import { ApprovalChainRule, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export type CreateApprovalChainRuleInput = Prisma.ApprovalChainRuleCreateInput;
export type UpdateApprovalChainRuleInput = Prisma.ApprovalChainRuleUpdateInput;

export interface IApprovalChainRepository
  extends IBaseRepository<ApprovalChainRule, string, CreateApprovalChainRuleInput> {
  findRuleByRiskScore(riskScore: number): Promise<ApprovalChainRule | null>;
  upsertRule(data: {
    id?: string;
    minRiskScore: number;
    maxRiskScore: number;
    requiresManager: boolean;
    requiresFinance: boolean;
    description?: string | null;
  }): Promise<ApprovalChainRule>;
}

export class ApprovalChainRepository implements IApprovalChainRepository {
  public async findById(id: string): Promise<ApprovalChainRule | null> {
    return prisma.approvalChainRule.findUnique({
      where: { id },
    });
  }

  public async findAll(): Promise<ApprovalChainRule[]> {
    return prisma.approvalChainRule.findMany({
      orderBy: { minRiskScore: 'asc' },
    });
  }

  public async findRuleByRiskScore(riskScore: number): Promise<ApprovalChainRule | null> {
    return prisma.approvalChainRule.findFirst({
      where: {
        minRiskScore: { lte: riskScore },
        maxRiskScore: { gte: riskScore },
      },
      orderBy: { minRiskScore: 'desc' },
    });
  }

  public async create(data: CreateApprovalChainRuleInput): Promise<ApprovalChainRule> {
    return prisma.approvalChainRule.create({
      data,
    });
  }

  public async update(
    id: string,
    data: UpdateApprovalChainRuleInput
  ): Promise<ApprovalChainRule | null> {
    return prisma.approvalChainRule.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.approvalChainRule.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async upsertRule(data: {
    id?: string;
    minRiskScore: number;
    maxRiskScore: number;
    requiresManager: boolean;
    requiresFinance: boolean;
    description?: string | null;
  }): Promise<ApprovalChainRule> {
    if (data.id) {
      return prisma.approvalChainRule.upsert({
        where: { id: data.id },
        update: {
          minRiskScore: data.minRiskScore,
          maxRiskScore: data.maxRiskScore,
          requiresManager: data.requiresManager,
          requiresFinance: data.requiresFinance,
          description: data.description,
        },
        create: {
          id: data.id,
          minRiskScore: data.minRiskScore,
          maxRiskScore: data.maxRiskScore,
          requiresManager: data.requiresManager,
          requiresFinance: data.requiresFinance,
          description: data.description,
        },
      });
    }

    // Check if a rule exists for this range
    const existing = await prisma.approvalChainRule.findFirst({
      where: {
        minRiskScore: data.minRiskScore,
        maxRiskScore: data.maxRiskScore,
      },
    });

    if (existing) {
      return prisma.approvalChainRule.update({
        where: { id: existing.id },
        data: {
          requiresManager: data.requiresManager,
          requiresFinance: data.requiresFinance,
          description: data.description,
        },
      });
    }

    return prisma.approvalChainRule.create({
      data: {
        minRiskScore: data.minRiskScore,
        maxRiskScore: data.maxRiskScore,
        requiresManager: data.requiresManager,
        requiresFinance: data.requiresFinance,
        description: data.description,
      },
    });
  }
}

export const approvalChainRepository = new ApprovalChainRepository();
