"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRecordService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const commission_service_1 = require("./commission.service");
class ServiceRecordService {
    static async createService(input, createdBy) {
        // Get employee
        const employee = await database_1.prisma.employee.findUnique({
            where: { id: input.employeeId },
        });
        if (!employee) {
            throw new Error('Empleado no encontrado');
        }
        if (!employee.isActive) {
            throw new Error('El empleado no está activo');
        }
        // Determine price:
        // - If service type exists, allow discount by accepting a lower client price.
        // - Never allow charging above the configured default service price.
        let finalPrice = input.price;
        if (input.serviceTypeId) {
            const serviceType = await database_1.prisma.serviceType.findUnique({
                where: { id: input.serviceTypeId },
            });
            if (serviceType) {
                const basePrice = Number(serviceType.defaultPrice);
                finalPrice = Math.min(Number(input.price), basePrice);
            }
        }
        // Validate price
        if (finalPrice <= 0) {
            throw new Error('El precio debe ser mayor a 0');
        }
        // Calculate commission
        const { commissionAmount } = commission_service_1.CommissionService.calculateCommission(finalPrice, Number(employee.commissionRate));
        // Create service record
        const service = await database_1.prisma.service.create({
            data: {
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
        await database_1.prisma.auditLog.create({
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
        logger_1.logger.info(`Service created: ${service.id} for employee ${input.employeeId}`);
        return service;
    }
    static async getAllServices(filters = {}) {
        const where = {};
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
        const services = await database_1.prisma.service.findMany({
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
        return services;
    }
    static async getServiceById(id) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
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
        return service;
    }
    static async updateService(id, input, updatedBy) {
        const existingService = await database_1.prisma.service.findUnique({
            where: { id },
        });
        if (!existingService) {
            throw new Error('Servicio no encontrado');
        }
        // If employee changed, recalculate commission
        let commissionAmount = existingService.commissionAmount;
        let commissionRate = existingService.commissionRate;
        let price = existingService.price;
        if (input.employeeId && input.employeeId !== existingService.employeeId) {
            const newEmployee = await database_1.prisma.employee.findUnique({
                where: { id: input.employeeId },
            });
            if (!newEmployee) {
                throw new Error('Empleado no encontrado');
            }
            commissionRate = newEmployee.commissionRate;
            const calculation = commission_service_1.CommissionService.calculateCommission(Number(price), Number(commissionRate));
            commissionAmount = calculation.commissionAmount;
        }
        // If price changed, recalculate commission
        if (input.price && input.price !== Number(price)) {
            price = input.price;
            const calculation = commission_service_1.CommissionService.calculateCommission(price, Number(commissionRate));
            commissionAmount = calculation.commissionAmount;
        }
        const updated = await database_1.prisma.service.update({
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
        await database_1.prisma.auditLog.create({
            data: {
                userId: updatedBy,
                action: 'UPDATE_SERVICE',
                tableName: 'services',
                recordId: id,
                oldData: existingService,
                newData: updated,
            },
        });
        logger_1.logger.info(`Service updated: ${id}`);
        return updated;
    }
    static async deleteService(id, deletedBy) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            throw new Error('Servicio no encontrado');
        }
        await database_1.prisma.service.delete({
            where: { id },
        });
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: deletedBy,
                action: 'DELETE_SERVICE',
                tableName: 'services',
                recordId: id,
                oldData: service,
            },
        });
        logger_1.logger.info(`Service deleted: ${id}`);
    }
    // Service Types
    static async createServiceType(input) {
        const serviceType = await database_1.prisma.serviceType.create({
            data: {
                name: input.name,
                description: input.description,
                defaultPrice: input.defaultPrice,
                durationMinutes: input.durationMinutes,
            },
        });
        logger_1.logger.info(`Service type created: ${input.name}`);
        return serviceType;
    }
    static async getAllServiceTypes(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return database_1.prisma.serviceType.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    static async updateServiceType(id, input) {
        const serviceType = await database_1.prisma.serviceType.findUnique({
            where: { id },
        });
        if (!serviceType) {
            throw new Error('Tipo de servicio no encontrado');
        }
        const updated = await database_1.prisma.serviceType.update({
            where: { id },
            data: {
                name: input.name,
                description: input.description,
                defaultPrice: input.defaultPrice,
                durationMinutes: input.durationMinutes,
                isActive: input.isActive,
            },
        });
        logger_1.logger.info(`Service type updated: ${id}`);
        return updated;
    }
    static async deleteServiceType(id) {
        const serviceType = await database_1.prisma.serviceType.findUnique({
            where: { id },
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
            await database_1.prisma.serviceType.update({
                where: { id },
                data: { isActive: false },
            });
        }
        else {
            await database_1.prisma.serviceType.delete({
                where: { id },
            });
        }
        logger_1.logger.info(`Service type deleted: ${id}`);
    }
}
exports.ServiceRecordService = ServiceRecordService;
//# sourceMappingURL=service-record.service.js.map