import { prisma } from '../config/database';

export interface CreatePlanInput {
    name: string;
    price: number;
    features: string[];
    isActive?: boolean;
    displayOrder?: number;
}

export interface UpdatePlanInput {
    name?: string;
    price?: number;
    features?: string[];
    isActive?: boolean;
    displayOrder?: number;
}

export class PlanService {
    /**
     * Check if a displayOrder is already in use by another plan.
     * Pass `excludeId` when updating so the plan being edited is excluded.
     */
    private static async checkDisplayOrderUnique(displayOrder: number, excludeId?: string) {
        const conflict = await prisma.subscriptionPlan.findFirst({
            where: {
                displayOrder,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            } as any,
        });
        if (conflict) {
            throw new Error(`Ya existe otro plan con el orden de aparición ${displayOrder} ("${conflict.name}"). Elige un número diferente.`);
        }
    }

    static async getAllPlans(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        const plans = await prisma.subscriptionPlan.findMany({
            where,
            // NOTE: orderBy will use displayOrder once the Prisma Client is regenerated
            // (run `npx prisma generate` after stopping the server).
            // Using a JS-level sort as fallback until then:
            orderBy: { createdAt: 'asc' },
        });
        // Sort by displayOrder at the JS level so the order is always respected.
        plans.sort((a, b) => {
            const ao = (a as any).displayOrder ?? 0;
            const bo = (b as any).displayOrder ?? 0;
            return ao - bo;
        });
        return plans;
    }

    static async getPlanById(id: string) {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
        });

        if (!plan) {
            throw new Error('Plan no encontrado');
        }

        return plan;
    }

    static async createPlan(input: CreatePlanInput) {
        // Check if name already exists
        const existing = await prisma.subscriptionPlan.findUnique({
            where: { name: input.name },
        });

        if (existing) {
            throw new Error('Ya existe un plan con ese nombre');
        }

        // Validate unique displayOrder
        if (input.displayOrder !== undefined) {
            await this.checkDisplayOrderUnique(input.displayOrder);
        }

        // Assign next available order if not provided
        const orderToUse = input.displayOrder ?? await this.getNextAvailableOrder();

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name: input.name,
                price: input.price,
                features: input.features,
                isActive: input.isActive ?? true,
                displayOrder: orderToUse,
            } as any, // `as any` until Prisma Client is regenerated
        });

        return plan;
    }

    static async updatePlan(id: string, input: UpdatePlanInput) {
        // Ensure plan exists
        await this.getPlanById(id);

        if (input.name) {
            const existing = await prisma.subscriptionPlan.findUnique({
                where: { name: input.name },
            });

            if (existing && existing.id !== id) {
                throw new Error('Ya existe otro plan con ese nombre');
            }
        }

        // Validate unique displayOrder (excluding current plan)
        if (input.displayOrder !== undefined) {
            await this.checkDisplayOrderUnique(input.displayOrder, id);
        }

        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...input,
                features: input.features ? input.features : undefined,
                displayOrder: input.displayOrder !== undefined ? input.displayOrder : undefined,
            } as any, // `as any` until Prisma Client is regenerated
        });

        return plan;
    }

    static async deletePlan(id: string) {
        // Check if any tenants are using it
        const tenantsUsingPlan = await prisma.tenant.count({
            where: { planId: id },
        });

        if (tenantsUsingPlan > 0) {
            throw new Error('No se puede eliminar este plan porque hay peluquerías usándolo');
        }

        await prisma.subscriptionPlan.delete({
            where: { id },
        });

        return true;
    }

    private static async getNextAvailableOrder(): Promise<number> {
        const plans = await prisma.subscriptionPlan.findMany({
            select: { displayOrder: true } as any,
        });
        const usedOrders = new Set(plans.map((p: any) => p.displayOrder ?? 0));
        let next = 1;
        while (usedOrders.has(next)) next++;
        return next;
    }
}
