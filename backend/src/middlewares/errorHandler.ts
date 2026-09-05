import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal server error';
  const details = 'details' in err ? err.details : undefined;

  // Log unexpected internal errors in production or non-operational errors
  if (statusCode >= 500) {
    console.error('Unhandled Internal Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.isDevelopment ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString(),
  });
};
