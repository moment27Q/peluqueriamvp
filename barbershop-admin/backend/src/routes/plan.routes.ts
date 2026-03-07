import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public endpoint
router.get('/active', PlanController.getActivePlans);

// Protected routes (SuperAdmin only)
router.use(authenticate);
router.use(requireRole([UserRole.SUPERADMIN]));

router.get('/', PlanController.getAllPlans);
router.get('/:id', PlanController.getPlanById);
router.post('/', PlanController.createPlan);
router.put('/:id', PlanController.updatePlan);
router.delete('/:id', PlanController.deletePlan);

export default router;
