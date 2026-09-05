/**
 * Authentication & Session Types
 * Aligned with Database.md §4.1 and API.md §3
 */

import { Role } from './enums.types';

export interface IAuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  role: Role;
  isActive: boolean;
  historicalAvgDiscount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IUserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive?: boolean;
  historicalAvgDiscount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | string;
}

export interface IAuthResponse {
  user: IUserResponse;
  tokens: IAuthTokens;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface IRefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date | string;
  createdAt: Date | string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
      portalToken?: string;
    }
  }
}
