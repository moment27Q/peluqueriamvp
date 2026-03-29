import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', WithdrawalController.getAll);
router.put('/:id/status', apiLimiter, WithdrawalController.updateStatus);

export default router;
