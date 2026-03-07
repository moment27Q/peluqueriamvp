import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (per-account lockout handled in auth.service.ts)
router.post('/login', AuthController.login);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, AuthController.changePassword);

// Admin only - registration
router.post('/register', authenticate, AuthController.register);

export default router;
