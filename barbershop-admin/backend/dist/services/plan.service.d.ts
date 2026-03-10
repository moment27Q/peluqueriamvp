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
export declare class PlanService {
    /**
     * Check if a displayOrder is already in use by another plan.
     * Pass `excludeId` when updating so the plan being edited is excluded.
     */
    private static checkDisplayOrderUnique;
    static getAllPlans(includeInactive?: boolean): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
        displayOrder: number;
    }[]>;
    static getPlanById(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
        displayOrder: number;
    }>;
    static createPlan(input: CreatePlanInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
        displayOrder: number;
    }>;
    static updatePlan(id: string, input: UpdatePlanInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
        displayOrder: number;
    }>;
    static deletePlan(id: string): Promise<boolean>;
    private static getNextAvailableOrder;
}
//# sourceMappingURL=plan.service.d.ts.map