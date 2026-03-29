import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]));

router.get('/trial', FeedbackController.getTrialFeedback);
router.post('/trial', FeedbackController.submitTrialFeedback);

export default router;
