import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require SuperAdmin
router.use(authenticate);
router.use(requireRole([UserRole.SUPERADMIN]));

router.get('/', TenantController.getAll);
router.patch('/:id/toggle', TenantController.toggleActive);
router.patch('/:id/plan', TenantController.updatePlan);
router.post('/:id/admins', TenantController.addAdmin);

export default router;
