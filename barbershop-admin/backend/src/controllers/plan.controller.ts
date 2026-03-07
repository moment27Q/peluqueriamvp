import { Request, Response } from 'express';
import { z } from 'zod';
import { PlanService } from '../services/plan.service';
import { asyncHandler } from '../middleware/error.middleware';

const createPlanSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        price: z.number().min(0, 'Price must be positive'),
        features: z.array(z.string()).min(1, 'At least one feature is required'),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().min(0).optional(),
    }),
});

const updatePlanSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
        features: z.array(z.string()).min(1).optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().min(0).optional(),
    }),
});

export class PlanController {
    // Public endpoint for landing page
    static getActivePlans = asyncHandler(async (req: Request, res: Response) => {
        const plans = await PlanService.getAllPlans(false);
        res.json({
            success: true,
            data: plans,
        });
    });

    // Admin endpoint
    static getAllPlans = asyncHandler(async (req: Request, res: Response) => {
        const plans = await PlanService.getAllPlans(true);
        res.json({
            success: true,
            data: plans,
        });
    });

    static getPlanById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const plan = await PlanService.getPlanById(id);
        res.json({
            success: true,
            data: plan,
        });
    });

    static createPlan = asyncHandler(async (req: Request, res: Response) => {
        const data = createPlanSchema.parse(req).body;
        const plan = await PlanService.createPlan(data);
        res.status(201).json({
            success: true,
            data: plan,
        });
    });

    static updatePlan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = updatePlanSchema.parse(req).body;
        const plan = await PlanService.updatePlan(id, data);
        res.json({
            success: true,
            data: plan,
        });
    });

    static deletePlan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await PlanService.deletePlan(id);
        res.json({
            success: true,
            message: 'Plan eliminado exitosamente',
        });
    });
}
