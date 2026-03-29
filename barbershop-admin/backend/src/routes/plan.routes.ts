import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public endpoint
router.get('/active', PlanController.getActivePlans);

// Protected routes (Admin & SuperAdmin for read)
router.use(authenticate);
router.get('/', requireRole([UserRole.SUPERADMIN, UserRole.ADMIN]), PlanController.getAllPlans);
router.get('/:id', requireRole([UserRole.SUPERADMIN, UserRole.ADMIN]), PlanController.getPlanById);

// Protected routes (SuperAdmin only for write)
router.use(requireRole([UserRole.SUPERADMIN]));
router.post('/', PlanController.createPlan);
router.put('/:id', PlanController.updatePlan);
router.delete('/:id', PlanController.deletePlan);

export default router;
