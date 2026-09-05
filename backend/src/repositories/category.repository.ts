import { Category, ProductCategory, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export type CreateCategoryInput = Prisma.CategoryCreateInput;
export type UpdateCategoryInput = Prisma.CategoryUpdateInput;

export interface ICategoryRepository extends IBaseRepository<Category, string, CreateCategoryInput> {
  findByName(name: ProductCategory): Promise<Category | null>;
  upsertCategory(
    name: ProductCategory,
    description: string | null,
    defaultCeilingDiscount: number
  ): Promise<Category>;
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

  public async create(data: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  public async update(id: string, data: UpdateCategoryInput): Promise<Category | null> {
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

  public async upsertCategory(
    name: ProductCategory,
    description: string | null,
    defaultCeilingDiscount: number
  ): Promise<Category> {
    return prisma.category.upsert({
      where: { name },
      update: {
        description,
        defaultCeilingDiscount,
      },
      create: {
        name,
        description,
        defaultCeilingDiscount,
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();
