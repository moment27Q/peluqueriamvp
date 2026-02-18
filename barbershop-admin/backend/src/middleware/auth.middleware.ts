import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt.utils';
import { UserPayload } from '../types/auth.types';
import { logger } from '../config/logger';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = JwtUtils.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Invalid or expired token attempt');
      res.status(401).json({ error: 'Token inválido o expirado' });
      return;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Error de autenticación' });
    return;
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    logger.warn(`Admin access denied for user: ${req.user.email}`);
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    return;
  }

  next();
};

export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  // Admin can access everything
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  // Employee can only access their own data
  const requestedEmployeeId = req.params.id;
  
  // TODO: Add logic to check if the employee is accessing their own data
  // This requires looking up the employee record by userId
  
  logger.warn(`Access denied for user: ${req.user.email}`);
  res.status(403).json({ error: 'Acceso denegado' });
  return;
};
