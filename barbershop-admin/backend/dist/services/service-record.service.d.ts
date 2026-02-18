import { CreateServiceInput, UpdateServiceInput, ServiceFilters, ServiceWithDetails, CreateServiceTypeInput, UpdateServiceTypeInput } from '../types/service.types';
export declare class ServiceRecordService {
    static createService(input: CreateServiceInput, createdBy: string): Promise<ServiceWithDetails>;
    static getAllServices(filters?: ServiceFilters): Promise<ServiceWithDetails[]>;
    static getServiceById(id: string): Promise<ServiceWithDetails>;
    static updateService(id: string, input: UpdateServiceInput, updatedBy: string): Promise<ServiceWithDetails>;
    static deleteService(id: string, deletedBy: string): Promise<void>;
    static createServiceType(input: CreateServiceTypeInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        description: string | null;
        defaultPrice: import("@prisma/client/runtime/library").Decimal;
        durationMinutes: number | null;
    }>;
    static getAllServiceTypes(includeInactive?: boolean): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        description: string | null;
        defaultPrice: import("@prisma/client/runtime/library").Decimal;
        durationMinutes: number | null;
    }[]>;
    static updateServiceType(id: string, input: UpdateServiceTypeInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        description: string | null;
        defaultPrice: import("@prisma/client/runtime/library").Decimal;
        durationMinutes: number | null;
    }>;
    static deleteServiceType(id: string): Promise<void>;
}
//# sourceMappingURL=service-record.service.d.ts.map