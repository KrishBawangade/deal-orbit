import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

export interface IRefreshTokenRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByToken(token: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<number>;
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
  public async create(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  public async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  public async deleteByToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.delete({
        where: { token },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async deleteByUserId(userId: string): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
