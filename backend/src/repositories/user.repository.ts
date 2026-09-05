import { User } from '@prisma/client';
import { prisma } from '../config/database';
import { IBaseRepository } from './base.repository';

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

export interface IUserRepository extends IBaseRepository<User, string> {
  findByEmail(email: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findAll(filter?: Partial<User>): Promise<User[]> {
    return prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  public async update(id: string, data: UpdateUserInput): Promise<User | null> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const userRepository = new UserRepository();
