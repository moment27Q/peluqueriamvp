import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { reportLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', ReportController.getDashboardSummary);

// Period reports
router.get('/daily', reportLimiter, ReportController.getDailyReport);
router.get('/weekly', reportLimiter, ReportController.getWeeklyReport);
router.get('/biweekly', reportLimiter, ReportController.getBiweeklyReport);
router.get('/monthly', reportLimiter, ReportController.getMonthlyReport);
router.get('/custom', reportLimiter, ReportController.getCustomReport);

// Employee comparison
router.get('/employees/comparison', reportLimiter, ReportController.getEmployeeComparison);

export default router;
