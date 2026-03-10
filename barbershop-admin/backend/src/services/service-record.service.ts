import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CommissionService } from './commission.service';
import {
  CreateServiceInput,
  UpdateServiceInput,
  ServiceFilters,
  ServiceWithDetails,
  CreateServiceTypeInput,
  UpdateServiceTypeInput,
} from '../types/service.types';

export class ServiceRecordService {
  static async createService(input: CreateServiceInput, createdBy: string): Promise<ServiceWithDetails> {
    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: input.employeeId },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    if (employee.tenantId !== input.tenantId) {
      throw new Error('Empleado fuera de tu empresa');
    }

    if (!employee.isActive) {
      throw new Error('El empleado no está activo');
    }

    // Determine price:
    // - If service type exists, allow discount by accepting a lower client price.
    // - Never allow charging above the configured default service price.
    let finalPrice = input.price;

    if (input.serviceTypeId) {
      const serviceType = await prisma.serviceType.findUnique({
        where: { id: input.serviceTypeId },
      });

      if (serviceType) {
        if (serviceType.tenantId !== input.tenantId) {
          throw new Error('Tipo de servicio fuera de tu empresa');
        }
        const basePrice = Number(serviceType.defaultPrice);
        finalPrice = Math.min(Number(input.price), basePrice);
      }
    }

    // Validate price
    if (finalPrice <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    // Calculate commission
    const { commissionAmount } = CommissionService.calculateCommission(
      finalPrice,
      Number(employee.commissionRate)
    );

    // Create service record
    const service = await prisma.service.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        serviceTypeId: input.serviceTypeId || null,
        clientName: input.clientName,
        clientPhone: input.clientPhone || null,
        price: finalPrice,
        commissionRate: employee.commissionRate,
        commissionAmount,
        serviceDate: new Date(),
        notes: input.notes || null,
        createdBy,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: createdBy,
        action: 'CREATE_SERVICE',
        tableName: 'services',
        recordId: service.id,
        newData: {
          employeeId: input.employeeId,
          clientName: input.clientName,
          price: finalPrice,
          commissionAmount,
        },
      },
    });

    logger.info(`Service created: ${service.id} for employee ${input.employeeId}`);

    return service as unknown as ServiceWithDetails;
  }

  static async getAllServices(filters: ServiceFilters = {}): Promise<ServiceWithDetails[]> {
    const where: any = {};

    // Scope to tenant — Service has its own tenantId column
    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.clientName) {
      where.clientName = {
        contains: filters.clientName,
        mode: 'insensitive',
      };
    }

    if (filters.startDate || filters.endDate) {
      where.serviceDate = {};
      if (filters.startDate) {
        where.serviceDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.serviceDate.lte = filters.endDate;
      }
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    return services as unknown as ServiceWithDetails[];
  }

  static async getServiceById(id: string, tenantId?: string): Promise<ServiceWithDetails> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;

    const service = await prisma.service.findFirst({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    return service as unknown as ServiceWithDetails;
  }

  static async updateService(
    id: string,
    input: UpdateServiceInput,
    updatedBy: string,
    tenantId?: string
  ): Promise<ServiceWithDetails> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;

    const existingService = await prisma.service.findFirst({
      where,
    });

    if (!existingService) {
      throw new Error('Servicio no encontrado');
    }

    // If employee changed, recalculate commission
    let commissionAmount: any = existingService.commissionAmount;
    let commissionRate: any = existingService.commissionRate;
    let price: any = existingService.price;

    if (input.employeeId && input.employeeId !== existingService.employeeId) {
      const newEmployee = await prisma.employee.findUnique({
        where: { id: input.employeeId },
      });

      if (!newEmployee) {
        throw new Error('Empleado no encontrado');
      }

      commissionRate = newEmployee.commissionRate;
      const calculation = CommissionService.calculateCommission(
        Number(price),
        Number(commissionRate)
      );
      commissionAmount = calculation.commissionAmount;
    }

    // If price changed, recalculate commission
    if (input.price && input.price !== Number(price)) {
      price = input.price;
      const calculation = CommissionService.calculateCommission(
        price,
        Number(commissionRate)
      );
      commissionAmount = calculation.commissionAmount;
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        employeeId: input.employeeId || existingService.employeeId,
        serviceTypeId: input.serviceTypeId !== undefined ? input.serviceTypeId : existingService.serviceTypeId,
        clientName: input.clientName || existingService.clientName,
        clientPhone: input.clientPhone !== undefined ? input.clientPhone : existingService.clientPhone,
        price,
        commissionRate,
        commissionAmount,
        notes: input.notes !== undefined ? input.notes : existingService.notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'UPDATE_SERVICE',
        tableName: 'services',
        recordId: id,
        oldData: existingService,
        newData: updated,
      },
    });

    logger.info(`Service updated: ${id}`);

    return updated as unknown as ServiceWithDetails;
  }

  static async deleteService(id: string, deletedBy: string, tenantId?: string): Promise<void> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;

    const service = await prisma.service.findFirst({
      where,
    });

    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    await prisma.service.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: deletedBy,
        action: 'DELETE_SERVICE',
        tableName: 'services',
        recordId: id,
        oldData: service,
      },
    });

    logger.info(`Service deleted: ${id}`);
  }

  // Service Types
  static async createServiceType(input: CreateServiceTypeInput) {
    const serviceType = await prisma.serviceType.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        defaultPrice: input.defaultPrice,
        durationMinutes: input.durationMinutes,
      },
    });

    logger.info(`Service type created: ${input.name}`);

    return serviceType;
  }

  static async getAllServiceTypes(includeInactive: boolean = false, tenantId?: string) {
    const where: any = includeInactive ? {} : { isActive: true };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    return prisma.serviceType.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  static async updateServiceType(id: string, input: UpdateServiceTypeInput, tenantId?: string) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;

    const serviceType = await prisma.serviceType.findFirst({
      where,
    });

    if (!serviceType) {
      throw new Error('Tipo de servicio no encontrado');
    }

    const updated = await prisma.serviceType.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        defaultPrice: input.defaultPrice,
        durationMinutes: input.durationMinutes,
        isActive: input.isActive,
      },
    });

    logger.info(`Service type updated: ${id}`);

    return updated;
  }

  static async deleteServiceType(id: string, tenantId?: string): Promise<void> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;

    const serviceType = await prisma.serviceType.findFirst({
      where,
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!serviceType) {
      throw new Error('Tipo de servicio no encontrado');
    }

    if (serviceType._count.services > 0) {
      // Soft delete
      await prisma.serviceType.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      await prisma.serviceType.delete({
        where: { id },
      });
    }

    logger.info(`Service type deleted: ${id}`);
  }
}
