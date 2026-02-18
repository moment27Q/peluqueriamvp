"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
    ],
});
exports.prisma.$on('query', (e) => {
    logger_1.logger.debug(`Query: ${e.query}`);
    logger_1.logger.debug(`Duration: ${e.duration}ms`);
});
exports.prisma.$on('error', (e) => {
    logger_1.logger.error(`Prisma Error: ${e.message}`);
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
async function connectDatabase() {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('✅ Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
    logger_1.logger.info('Database disconnected');
}
//# sourceMappingURL=database.js.map