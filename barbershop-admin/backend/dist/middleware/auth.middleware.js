"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnerOrAdmin = exports.requireAdmin = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const logger_1 = require("../config/logger");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token no proporcionado' });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jwt_utils_1.JwtUtils.verifyAccessToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            logger_1.logger.warn('Invalid or expired token attempt');
            res.status(401).json({ error: 'Token inválido o expirado' });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        res.status(500).json({ error: 'Error de autenticación' });
        return;
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        logger_1.logger.warn(`Admin access denied for user: ${req.user.email}`);
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireOwnerOrAdmin = (req, res, next) => {
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
    logger_1.logger.warn(`Access denied for user: ${req.user.email}`);
    res.status(403).json({ error: 'Acceso denegado' });
    return;
};
exports.requireOwnerOrAdmin = requireOwnerOrAdmin;
//# sourceMappingURL=auth.middleware.js.map