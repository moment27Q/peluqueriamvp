import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation error:', { errors, path: req.path });

        res.status(400).json({
          error: 'Error de validación',
          details: errors,
        });
        return;
      }

      next(error);
    }
  };
};

// Sanitize request data
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Remove any fields that start with _ or $ (MongoDB operators)
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!key.startsWith('_') && !key.startsWith('$')) {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};
