"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
const validate = (schema) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                logger_1.logger.warn('Validation error:', { errors, path: req.path });
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
exports.validate = validate;
// Sanitize request data
const sanitizeInput = (req, res, next) => {
    // Remove any fields that start with _ or $ (MongoDB operators)
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        const sanitized = {};
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
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=validation.middleware.js.map