"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Public service types (for landing/services pages)
router.get('/types/public', service_controller_1.ServiceController.getPublicServiceTypes);
// All routes require authentication and admin role
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
// Service Records
router.post('/', rate_limit_middleware_1.strictLimiter, service_controller_1.ServiceController.createService);
router.get('/', service_controller_1.ServiceController.getAllServices);
router.get('/:id', service_controller_1.ServiceController.getServiceById);
router.put('/:id', rate_limit_middleware_1.strictLimiter, service_controller_1.ServiceController.updateService);
router.delete('/:id', service_controller_1.ServiceController.deleteService);
// Service Types
router.post('/types', rate_limit_middleware_1.apiLimiter, service_controller_1.ServiceController.createServiceType);
router.get('/types/all', service_controller_1.ServiceController.getAllServiceTypes);
router.put('/types/:id', rate_limit_middleware_1.apiLimiter, service_controller_1.ServiceController.updateServiceType);
router.delete('/types/:id', service_controller_1.ServiceController.deleteServiceType);
exports.default = router;
//# sourceMappingURL=service.routes.js.map