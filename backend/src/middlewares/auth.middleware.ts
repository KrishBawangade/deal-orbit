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
