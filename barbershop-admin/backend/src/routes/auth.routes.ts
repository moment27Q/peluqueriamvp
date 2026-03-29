import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (per-account lockout handled in auth.service.ts)
router.post('/login', AuthController.login);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, AuthController.changePassword);
router.patch('/trial', authenticate, requireAdmin, AuthController.activateTrial);
router.patch('/plan', authenticate, requireAdmin, AuthController.updateMyPlan);

// Public registration
router.post('/register', AuthController.register);

export default router;
