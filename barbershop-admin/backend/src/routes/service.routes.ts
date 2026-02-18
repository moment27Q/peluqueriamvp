import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { apiLimiter, strictLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Public service types (for landing/services pages)
router.get('/types/public', ServiceController.getPublicServiceTypes);

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Service Records
router.post('/', strictLimiter, ServiceController.createService);
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);
router.put('/:id', strictLimiter, ServiceController.updateService);
router.delete('/:id', ServiceController.deleteService);

// Service Types
router.post('/types', apiLimiter, ServiceController.createServiceType);
router.get('/types/all', ServiceController.getAllServiceTypes);
router.put('/types/:id', apiLimiter, ServiceController.updateServiceType);
router.delete('/types/:id', ServiceController.deleteServiceType);

export default router;
