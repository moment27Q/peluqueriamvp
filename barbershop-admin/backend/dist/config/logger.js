"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
exports.logger = winston_1.default.createLogger({
    level: env_1.env.LOG_LEVEL,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), customFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log'
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/exceptions.log' }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/rejections.log' }),
    ],
});
//# sourceMappingURL=logger.js.map