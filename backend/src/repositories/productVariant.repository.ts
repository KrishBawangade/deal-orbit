import { ProductVariant, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export interface IProductVariantRepository
  extends IBaseRepository<ProductVariant, string, Prisma.ProductVariantCreateInput> {
  findByProductId(productId: string): Promise<ProductVariant[]>;
}

export class ProductVariantRepository implements IProductVariantRepository {
  public async findById(id: string): Promise<ProductVariant | null> {
    return prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  public async findByProductId(productId: string): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findAll(filter?: Partial<ProductVariant>): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      where: filter,
      orderBy: { createdAt: 'asc' },
    });
  }

  public async create(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
    return prisma.productVariant.create({
      data,
    });
  }

  public async update(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant | null> {
    return prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.productVariant.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const productVariantRepository = new ProductVariantRepository();
