"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtils = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
class PasswordUtils {
    static async hash(password) {
        return bcrypt_1.default.hash(password, SALT_ROUNDS);
    }
    static async compare(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    static validatePassword(password) {
        if (password.length < 8) {
            return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos una minúscula' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos un número' };
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos un carácter especial' };
        }
        return { valid: true };
    }
}
exports.PasswordUtils = PasswordUtils;
//# sourceMappingURL=password.utils.js.map