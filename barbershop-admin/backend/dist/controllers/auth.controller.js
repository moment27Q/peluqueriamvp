"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../config/logger");
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email inválido'),
        password: zod_1.z.string().min(1, 'La contraseña es requerida'),
    }),
});
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email inválido'),
        password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
        firstName: zod_1.z.string().min(2, 'El nombre es requerido'),
        lastName: zod_1.z.string().min(2, 'El apellido es requerido'),
        role: zod_1.z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    }),
});
const refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'El token de refresco es requerido'),
    }),
});
const changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'La contraseña actual es requerida'),
        newPassword: zod_1.z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    }),
});
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { email, password } = loginSchema.parse(req).body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const result = await auth_service_1.AuthService.login({ email, password }, ipAddress, userAgent);
    res.json({
        success: true,
        data: result,
    });
});
AuthController.register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const data = registerSchema.parse(req).body;
    const result = await auth_service_1.AuthService.register(data);
    res.status(201).json({
        success: true,
        data: result,
    });
});
AuthController.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    // In a more complex implementation, we would invalidate the token
    // For now, we just log the logout
    logger_1.logger.info(`User logged out: ${req.user?.email}`);
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
    });
});
AuthController.refreshToken = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = refreshTokenSchema.parse(req).body;
    const tokens = await auth_service_1.AuthService.refreshTokens({ refreshToken });
    res.json({
        success: true,
        data: tokens,
    });
});
AuthController.getMe = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autenticado',
        });
    }
    const user = await auth_service_1.AuthService.getCurrentUser(req.user.userId);
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Usuario no encontrado',
        });
    }
    res.json({
        success: true,
        data: user,
    });
});
AuthController.changePassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autenticado',
        });
    }
    const { currentPassword, newPassword } = changePasswordSchema.parse(req).body;
    await auth_service_1.AuthService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
    });
});
//# sourceMappingURL=auth.controller.js.map