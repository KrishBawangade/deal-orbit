import { Category, ProductCategory, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export interface ICategoryRepository extends IBaseRepository<Category, string, Prisma.CategoryCreateInput> {
  findByName(name: ProductCategory): Promise<Category | null>;
}

export class CategoryRepository implements ICategoryRepository {
  public async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  public async findByName(name: ProductCategory): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  public async findAll(filter?: Partial<Category>): Promise<Category[]> {
    return prisma.category.findMany({
      where: filter,
      orderBy: { name: 'asc' },
    });
  }

  public async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  public async update(id: string, data: Partial<Category>): Promise<Category | null> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.category.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const categoryRepository = new CategoryRepository();
