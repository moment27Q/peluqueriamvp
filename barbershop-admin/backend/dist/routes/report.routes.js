"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
// Dashboard
router.get('/dashboard', report_controller_1.ReportController.getDashboardSummary);
// Period reports
router.get('/daily', rate_limit_middleware_1.reportLimiter, report_controller_1.ReportController.getDailyReport);
router.get('/weekly', rate_limit_middleware_1.reportLimiter, report_controller_1.ReportController.getWeeklyReport);
router.get('/biweekly', rate_limit_middleware_1.reportLimiter, report_controller_1.ReportController.getBiweeklyReport);
router.get('/monthly', rate_limit_middleware_1.reportLimiter, report_controller_1.ReportController.getMonthlyReport);
router.get('/custom', rate_limit_middleware_1.reportLimiter, report_controller_1.ReportController.getCustomReport);
// Employee comparison
router.get('/employees/comparison', rate_limit_middleware_1.reportLimiter, report_controller_1.ReportController.getEmployeeComparison);
exports.default = router;
//# sourceMappingURL=report.routes.js.map