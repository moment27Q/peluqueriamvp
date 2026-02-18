import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Authenticated user self-service routes (employee dashboard)
router.get('/me/profile', authenticate, EmployeeController.getMyProfile);
router.get('/me/services', authenticate, EmployeeController.getMyServices);
router.get('/me/earnings', authenticate, EmployeeController.getMyEarnings);
router.get('/me/report', authenticate, EmployeeController.getMyReport);
router.post('/me/withdraw', authenticate, apiLimiter, EmployeeController.requestMyWithdrawal);

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Employee CRUD
router.post('/', apiLimiter, EmployeeController.createEmployee);
router.get('/', EmployeeController.getAllEmployees);
router.get('/earnings', EmployeeController.getAllEmployeesEarnings);
router.get('/:id', EmployeeController.getEmployeeById);
router.put('/:id', apiLimiter, EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);
router.get('/:id/earnings', EmployeeController.getEmployeeEarnings);

export default router;
