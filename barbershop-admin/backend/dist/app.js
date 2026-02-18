"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const validation_middleware_1 = require("./middleware/validation.middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
app.use(rate_limit_middleware_1.apiLimiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Sanitize input
app.use(validation_middleware_1.sanitizeInput);
// Request logging
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/reports', report_routes_1.default);
// API version endpoint
app.get('/api/version', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'BarberAdmin Pro API',
        description: 'Hair Salon Management System API',
    });
});
// Handle 404
app.use(error_middleware_1.notFoundHandler);
// Error handling
app.use(error_middleware_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start listening
        const PORT = parseInt(env_1.env.PORT);
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT}`);
            logger_1.logger.info(`📊 Environment: ${env_1.env.NODE_ENV}`);
            logger_1.logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map