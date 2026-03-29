"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (per-account lockout handled in auth.service.ts)
router.post('/login', auth_controller_1.AuthController.login);
// Protected routes
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.AuthController.logout);
router.post('/refresh', auth_controller_1.AuthController.refreshToken);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.getMe);
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.AuthController.changePassword);
router.patch('/trial', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.activateTrial);
router.patch('/plan', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.updateMyPlan);
// Public registration
router.post('/register', auth_controller_1.AuthController.register);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map