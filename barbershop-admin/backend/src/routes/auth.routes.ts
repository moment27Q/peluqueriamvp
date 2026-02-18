import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Public routes with rate limiting
router.post('/login', authLimiter, AuthController.login);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, AuthController.changePassword);

// Admin only - registration
router.post('/register', authenticate, AuthController.register);

export default router;
