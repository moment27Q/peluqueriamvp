"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
// Employee CRUD
router.post('/', rate_limit_middleware_1.apiLimiter, employee_controller_1.EmployeeController.createEmployee);
router.get('/', employee_controller_1.EmployeeController.getAllEmployees);
router.get('/earnings', employee_controller_1.EmployeeController.getAllEmployeesEarnings);
router.get('/:id', employee_controller_1.EmployeeController.getEmployeeById);
router.put('/:id', rate_limit_middleware_1.apiLimiter, employee_controller_1.EmployeeController.updateEmployee);
router.delete('/:id', employee_controller_1.EmployeeController.deleteEmployee);
router.get('/:id/earnings', employee_controller_1.EmployeeController.getEmployeeEarnings);
exports.default = router;
//# sourceMappingURL=employee.routes.js.map