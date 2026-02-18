"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.createError = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    // Handle Prisma errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Datos inválidos proporcionados';
    }
    // Log error
    if (statusCode >= 500) {
        logger_1.logger.error('Server error:', {
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }
    else {
        logger_1.logger.warn('Client error:', {
            error: err.message,
            path: req.path,
            method: req.method,
            statusCode,
        });
    }
    // Send response
    res.status(statusCode).json({
        error: message,
        ...(env_1.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err.message,
        }),
    });
};
exports.errorHandler = errorHandler;
// Handle unhandled routes
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: `Ruta no encontrada: ${req.originalUrl}`,
    });
};
exports.notFoundHandler = notFoundHandler;
// Async handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map