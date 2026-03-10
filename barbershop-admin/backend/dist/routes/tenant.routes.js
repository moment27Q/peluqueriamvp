"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenant_controller_1 = require("../controllers/tenant.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All routes require SuperAdmin
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)([client_1.UserRole.SUPERADMIN]));
router.get('/', tenant_controller_1.TenantController.getAll);
router.patch('/:id/toggle', tenant_controller_1.TenantController.toggleActive);
router.patch('/:id/plan', tenant_controller_1.TenantController.updatePlan);
router.post('/:id/admins', tenant_controller_1.TenantController.addAdmin);
exports.default = router;
//# sourceMappingURL=tenant.routes.js.map