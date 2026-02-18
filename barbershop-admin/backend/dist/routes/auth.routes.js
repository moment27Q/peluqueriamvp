"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Public routes with rate limiting
router.post('/login', rate_limit_middleware_1.authLimiter, auth_controller_1.AuthController.login);
// Protected routes
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.AuthController.logout);
router.post('/refresh', auth_controller_1.AuthController.refreshToken);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.getMe);
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.AuthController.changePassword);
// Admin only - registration
router.post('/register', auth_middleware_1.authenticate, auth_controller_1.AuthController.register);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map