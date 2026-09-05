import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { IAuthUser, Role } from '../types';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('Authentication required. Please provide a Bearer token.', 401, {
        code: 'UNAUTHENTICATED',
      })
    );
  }

  const token = authHeader.split(' ')[1];

  // Support demo persona tokens from frontend
  if (token.startsWith('demo_token_') || token.startsWith('demo-token-') || token === 'demo-token') {
    const rawRole = token.replace(/^(demo_token_|demo-token-)/, '').toUpperCase().replace('-', '_');
    const roleMap: Record<string, Role> = {
      SALES_REP: Role.SALES_REP,
      REP: Role.SALES_REP,
      SALES_MANAGER: Role.SALES_MANAGER,
      MANAGER: Role.SALES_MANAGER,
      FINANCE_OPS: Role.FINANCE_OPS,
      FINANCE: Role.FINANCE_OPS,
      ADMIN: Role.ADMIN,
      CUSTOMER: Role.CUSTOMER,
    };
    const role = roleMap[rawRole] || Role.SALES_REP;
    req.user = {
      id: `demo-${rawRole.toLowerCase()}`,
      email: `${rawRole.toLowerCase()}@dealorbit.io`,
      role,
      name: `Demo ${role}`,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IAuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError('Access token expired. Please refresh your session.', 401, {
          code: 'TOKEN_EXPIRED',
        })
      );
    }
    return next(new AppError('Invalid authentication token.', 401, { code: 'INVALID_TOKEN' }));
  }
};

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  if (token.startsWith('demo_token_') || token.startsWith('demo-token-') || token === 'demo-token') {
    const rawRole = token.replace(/^(demo_token_|demo-token-)/, '').toUpperCase().replace('-', '_');
    const roleMap: Record<string, Role> = {
      SALES_REP: Role.SALES_REP,
      REP: Role.SALES_REP,
      SALES_MANAGER: Role.SALES_MANAGER,
      MANAGER: Role.SALES_MANAGER,
      FINANCE_OPS: Role.FINANCE_OPS,
      FINANCE: Role.FINANCE_OPS,
      ADMIN: Role.ADMIN,
      CUSTOMER: Role.CUSTOMER,
    };
    const role = roleMap[rawRole] || Role.SALES_REP;
    req.user = {
      id: `demo-${rawRole.toLowerCase()}`,
      email: `${rawRole.toLowerCase()}@dealorbit.io`,
      role,
      name: `Demo ${role}`,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IAuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch {
    // Ignore invalid token in optional mode
  }
  next();
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError('Authentication required. Please log in first.', 401, {
          code: 'UNAUTHENTICATED',
        })
      );
    }

    if (allowedRoles.length > 0 && (!req.user.role || !allowedRoles.includes(req.user.role))) {
      return next(
        new AppError(
          `Forbidden: You do not have permission to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
          403,
          {
            code: 'FORBIDDEN',
            requiredRoles: allowedRoles,
            currentRole: req.user.role,
          }
        )
      );
    }

    next();
  };
};
