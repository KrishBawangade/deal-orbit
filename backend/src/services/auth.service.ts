import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { IUserRepository, userRepository } from '../repositories/user.repository';
import {
  IRefreshTokenRepository,
  refreshTokenRepository,
} from '../repositories/refreshToken.repository';
import { RegisterInput, LoginInput } from '../validations/auth.validation';
import { IAuthResponse, IAuthTokens, IUserResponse } from '../types';
import { User } from '@prisma/client';

export class AuthService {
  constructor(
    private readonly users: IUserRepository = userRepository,
    private readonly refreshTokens: IRefreshTokenRepository = refreshTokenRepository
  ) {}

  private sanitizeUser(user: User): IUserResponse {
    const { passwordHash: _, ...sanitized } = user;
    return {
      ...sanitized,
      historicalAvgDiscount: Number(user.historicalAvgDiscount || 0),
    };
  }

  private calculateExpiryDate(expiresInStr: string): Date {
    // Basic parser for duration (e.g. "7d", "15m", "1h")
    const match = expiresInStr.match(/^(\d+)([smhd])$/);
    const now = Date.now();
    if (!match) {
      return new Date(now + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now + value * (multipliers[unit] || 86400000));
  }

  public async generateTokens(user: User): Promise<IAuthTokens> {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // 1. Access Token (15m)
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    // 2. Refresh Token (7d)
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    // 3. Persist refresh token in database for session tracking
    const expiresAt = this.calculateExpiryDate(env.JWT_REFRESH_EXPIRES_IN);
    await this.refreshTokens.create(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  public async register(dto: RegisterInput): Promise<IAuthResponse> {
    const existing = await this.users.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.users.create({
      email: dto.email.toLowerCase(),
      name: dto.name || dto.email.split('@')[0],
      passwordHash,
      role: (dto.role as User['role']) || 'SALES_REP',
      isActive: true,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async login(dto: LoginInput): Promise<IAuthResponse> {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is currently disabled. Please contact support.', 403);
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; expiresIn: string }> {
    try {
      // 1. Verify cryptographic signature
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        id: string;
        email: string;
        role?: string;
        name?: string;
      };

      // 2. Check persistence and expiration in database
      const storedToken = await this.refreshTokens.findByToken(token);
      if (!storedToken) {
        throw new AppError('Refresh token revoked or invalid', 401);
      }

      if (storedToken.expiresAt < new Date()) {
        await this.refreshTokens.deleteByToken(token);
        throw new AppError('Refresh token expired. Please log in again.', 401);
      }

      // 3. Ensure user is still active
      const user = await this.users.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError('User not found or account disabled', 401);
      }

      // 4. Issue new access token with complete payload
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        env.JWT_ACCESS_SECRET,
        {
          expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        }
      );

      return {
        accessToken,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  public async logout(token: string): Promise<void> {
    await this.refreshTokens.deleteByToken(token);
  }

  public async getProfile(userId: string): Promise<IUserResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
