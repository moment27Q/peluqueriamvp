import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'El registro ya existe';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Registro no encontrado';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Referencia inválida';
        break;
      default:
        statusCode = 400;
        message = 'Error en la base de datos';
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Datos inválidos proporcionados';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn('Client error:', {
      error: err.message,
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  // Handle tenant inactive error (special banner on frontend)
  const errAny = err as any;
  if (errAny.code === 'TENANT_INACTIVE') {
    res.status(403).json({
      error: 'TENANT_INACTIVE',
      code: 'TENANT_INACTIVE',
      phone: errAny.phone || '',
    });
    return;
  }

  // Handle account locked error (too many failed attempts)
  if (errAny.code === 'ACCOUNT_LOCKED') {
    res.status(429).json({
      error: 'ACCOUNT_LOCKED',
      code: 'ACCOUNT_LOCKED',
      minutesLeft: errAny.minutesLeft || 15,
    });
    return;
  }

  // Handle invalid credentials with attempt warning
  if (errAny.code === 'INVALID_CREDENTIALS') {
    res.status(401).json({
      error: errAny.message,
      code: 'INVALID_CREDENTIALS',
      attemptsLeft: errAny.attemptsLeft,
    });
    return;
  }
  // Send response
  const responsePayload: any = {
    error: message,
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.message,
    }),
  };

  // Explicitly forward custom properties for frontend parsing
  if (errAny.code) responsePayload.code = errAny.code;
  if (errAny.minutesLeft !== undefined) responsePayload.minutesLeft = errAny.minutesLeft;
  if (errAny.attemptsLeft !== undefined) responsePayload.attemptsLeft = errAny.attemptsLeft;
  if (errAny.phone !== undefined) responsePayload.phone = errAny.phone;

  res.status(statusCode).json(responsePayload);
};

// Handle unhandled routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.originalUrl}`,
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
