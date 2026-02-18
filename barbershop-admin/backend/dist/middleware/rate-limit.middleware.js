"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportLimiter = exports.strictLimiter = exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const isDevelopment = env_1.env.NODE_ENV === 'development';
// Login attempts limiter
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
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
            retryAfter: 900,
        });
    },
});
// General API limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(env_1.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(env_1.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    skip: () => isDevelopment,
    message: {
        error: 'Límite de peticiones excedido',
        message: 'Ha realizado demasiadas peticiones. Por favor, espere un momento.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict limiter for sensitive operations
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        error: 'Operación limitada',
        message: 'Demasiadas operaciones sensibles. Por favor, espere un momento.',
    },
});
// Report generation limiter (can be resource intensive)
exports.reportLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    skip: () => isDevelopment,
    message: {
        error: 'Generación de reportes limitada',
        message: 'Por favor, espere antes de generar más reportes.',
    },
});
//# sourceMappingURL=rate-limit.middleware.js.map
