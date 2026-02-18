import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isDevelopment = env.NODE_ENV === 'development';

// Login attempts limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    error: 'Demasiados intentos de inicio de sesión. Por favor, intente más tarde.',
    retryAfter: '15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de inicio de sesión',
      message: 'Por favor, espere 15 minutos antes de intentar nuevamente',
      retryAfter: 900, // seconds
    });
  },
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS) || 100,
  skip: () => isDevelopment,
  message: {
    error: 'Límite de peticiones excedido',
    message: 'Ha realizado demasiadas peticiones. Por favor, espere un momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Operación limitada',
    message: 'Demasiadas operaciones sensibles. Por favor, espere un momento.',
  },
});

// Report generation limiter (can be resource intensive)
export const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 report requests per minute
  skip: () => isDevelopment,
  message: {
    error: 'Generación de reportes limitada',
    message: 'Por favor, espere antes de generar más reportes.',
  },
});
