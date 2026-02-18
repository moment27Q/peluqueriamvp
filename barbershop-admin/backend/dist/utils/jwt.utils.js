"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
class JwtUtils {
    static generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
        // Parse expiresIn to get actual expiration time in seconds
        const expiresInMatch = env_1.env.JWT_EXPIRES_IN.match(/(\d+)([mhd])/);
        let expiresIn = 900; // Default 15 minutes
        if (expiresInMatch) {
            const value = parseInt(expiresInMatch[1]);
            const unit = expiresInMatch[2];
            switch (unit) {
                case 'm':
                    expiresIn = value * 60;
                    break;
                case 'h':
                    expiresIn = value * 3600;
                    break;
                case 'd':
                    expiresIn = value * 86400;
                    break;
            }
        }
        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    }
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
}
exports.JwtUtils = JwtUtils;
//# sourceMappingURL=jwt.utils.js.map