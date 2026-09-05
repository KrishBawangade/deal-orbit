import { Product, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export interface IProductFilter {
  search?: string;
  categoryId?: string;
  categoryName?: string;
  isPromoted?: boolean;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export interface IProductRepository extends IBaseRepository<Product, string, Prisma.ProductCreateInput> {
  findBySku(sku: string): Promise<Product | null>;
  findWithDetails(id: string): Promise<any | null>;
  findAllWithFilters(filter: IProductFilter): Promise<{ products: any[]; total: number }>;
}

export class ProductRepository implements IProductRepository {
  public async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  public async findWithDetails(id: string): Promise<any | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        priceListRules: {
          include: {
            priceList: true,
          },
        },
      },
    });
  }

  public async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  public async findAll(filter?: Partial<Product>): Promise<Product[]> {
    return prisma.product.findMany({
      where: filter,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  public async findAllWithFilters(filter: IProductFilter): Promise<{ products: any[]; total: number }> {
    const where: Prisma.ProductWhereInput = {};

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    } else if (filter.categoryName) {
      where.category = {
        name: filter.categoryName as any,
      };
    }

    if (filter.isPromoted !== undefined) {
      where.isPromoted = filter.isPromoted;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [{ isPromoted: 'desc' }, { name: 'asc' }],
        skip: filter.skip,
        take: filter.take,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  public async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: {
        category: true,
        variants: true,
      },
    });
  }

  public async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product | null> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        variants: true,
      },
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const productRepository = new ProductRepository();
