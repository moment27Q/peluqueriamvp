"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const zod_1 = require("zod");
const plan_service_1 = require("../services/plan.service");
const error_middleware_1 = require("../middleware/error.middleware");
const createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        price: zod_1.z.number().min(0, 'Price must be positive'),
        features: zod_1.z.array(zod_1.z.string()).min(1, 'At least one feature is required'),
        isActive: zod_1.z.boolean().optional(),
        displayOrder: zod_1.z.number().int().min(0).optional(),
    }),
});
const updatePlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        price: zod_1.z.number().min(0).optional(),
        features: zod_1.z.array(zod_1.z.string()).min(1).optional(),
        isActive: zod_1.z.boolean().optional(),
        displayOrder: zod_1.z.number().int().min(0).optional(),
    }),
});
class PlanController {
}
exports.PlanController = PlanController;
_a = PlanController;
// Public endpoint for landing page
PlanController.getActivePlans = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const plans = await plan_service_1.PlanService.getAllPlans(false);
    res.json({
        success: true,
        data: plans,
    });
});
// Admin endpoint
PlanController.getAllPlans = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const plans = await plan_service_1.PlanService.getAllPlans(true);
    res.json({
        success: true,
        data: plans,
    });
});
PlanController.getPlanById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const plan = await plan_service_1.PlanService.getPlanById(id);
    res.json({
        success: true,
        data: plan,
    });
});
PlanController.createPlan = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const data = createPlanSchema.parse(req).body;
    const plan = await plan_service_1.PlanService.createPlan(data);
    res.status(201).json({
        success: true,
        data: plan,
    });
});
PlanController.updatePlan = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const data = updatePlanSchema.parse(req).body;
    const plan = await plan_service_1.PlanService.updatePlan(id, data);
    res.json({
        success: true,
        data: plan,
    });
});
PlanController.deletePlan = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await plan_service_1.PlanService.deletePlan(id);
    res.json({
        success: true,
        message: 'Plan eliminado exitosamente',
    });
});
//# sourceMappingURL=plan.controller.js.map