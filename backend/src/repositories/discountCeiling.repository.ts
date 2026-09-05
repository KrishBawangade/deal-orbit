import { DiscountCeiling, CustomerTier, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export type CreateDiscountCeilingInput = Prisma.DiscountCeilingCreateInput;
export type UpdateDiscountCeilingInput = Prisma.DiscountCeilingUpdateInput;

export interface IDiscountCeilingWithCategory extends DiscountCeiling {
  category: {
    id: string;
    name: string;
    defaultCeilingDiscount: Prisma.Decimal;
  };
}

export interface IDiscountCeilingRepository
  extends IBaseRepository<DiscountCeiling, string, CreateDiscountCeilingInput> {
  findByTierAndCategory(
    customerTier: CustomerTier,
    categoryId: string
  ): Promise<DiscountCeiling | null>;
  findByTier(customerTier: CustomerTier): Promise<IDiscountCeilingWithCategory[]>;
  findAllWithCategory(): Promise<IDiscountCeilingWithCategory[]>;
  upsertCeiling(
    customerTier: CustomerTier,
    categoryId: string,
    maxDiscountPercent: number
  ): Promise<DiscountCeiling>;
}

export class DiscountCeilingRepository implements IDiscountCeilingRepository {
  public async findById(id: string): Promise<DiscountCeiling | null> {
    return prisma.discountCeiling.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  public async findByTierAndCategory(
    customerTier: CustomerTier,
    categoryId: string
  ): Promise<DiscountCeiling | null> {
    return prisma.discountCeiling.findUnique({
      where: {
        customerTier_categoryId: {
          customerTier,
          categoryId,
        },
      },
      include: { category: true },
    });
  }

  public async findByTier(customerTier: CustomerTier): Promise<IDiscountCeilingWithCategory[]> {
    return prisma.discountCeiling.findMany({
      where: { customerTier },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            defaultCeilingDiscount: true,
          },
        },
      },
      orderBy: { category: { name: 'asc' } },
    });
  }

  public async findAll(filter?: Partial<DiscountCeiling>): Promise<DiscountCeiling[]> {
    return prisma.discountCeiling.findMany({
      where: filter,
      include: { category: true },
      orderBy: [{ customerTier: 'asc' }],
    });
  }

  public async findAllWithCategory(): Promise<IDiscountCeilingWithCategory[]> {
    return prisma.discountCeiling.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            defaultCeilingDiscount: true,
          },
        },
      },
      orderBy: [{ customerTier: 'asc' }],
    });
  }

  public async create(data: CreateDiscountCeilingInput): Promise<DiscountCeiling> {
    return prisma.discountCeiling.create({
      data,
      include: { category: true },
    });
  }

  public async update(
    id: string,
    data: UpdateDiscountCeilingInput
  ): Promise<DiscountCeiling | null> {
    return prisma.discountCeiling.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.discountCeiling.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async upsertCeiling(
    customerTier: CustomerTier,
    categoryId: string,
    maxDiscountPercent: number
  ): Promise<DiscountCeiling> {
    return prisma.discountCeiling.upsert({
      where: {
        customerTier_categoryId: {
          customerTier,
          categoryId,
        },
      },
      update: {
        maxDiscountPercent,
      },
      create: {
        customerTier,
        categoryId,
        maxDiscountPercent,
      },
      include: { category: true },
    });
  }
}

export const discountCeilingRepository = new DiscountCeilingRepository();
