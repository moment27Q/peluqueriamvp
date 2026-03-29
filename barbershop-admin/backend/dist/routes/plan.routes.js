"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plan_controller_1 = require("../controllers/plan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public endpoint
router.get('/active', plan_controller_1.PlanController.getActivePlans);
// Protected routes (Admin & SuperAdmin for read)
router.use(auth_middleware_1.authenticate);
router.get('/', (0, auth_middleware_1.requireRole)([client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN]), plan_controller_1.PlanController.getAllPlans);
router.get('/:id', (0, auth_middleware_1.requireRole)([client_1.UserRole.SUPERADMIN, client_1.UserRole.ADMIN]), plan_controller_1.PlanController.getPlanById);
// Protected routes (SuperAdmin only for write)
router.use((0, auth_middleware_1.requireRole)([client_1.UserRole.SUPERADMIN]));
router.post('/', plan_controller_1.PlanController.createPlan);
router.put('/:id', plan_controller_1.PlanController.updatePlan);
router.delete('/:id', plan_controller_1.PlanController.deletePlan);
exports.default = router;
//# sourceMappingURL=plan.routes.js.map