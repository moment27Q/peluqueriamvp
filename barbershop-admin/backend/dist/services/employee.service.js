"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const password_utils_1 = require("../utils/password.utils");
const commission_service_1 = require("./commission.service");
class EmployeeService {
    static async createEmployee(input, createdBy) {
        // Check if email exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }
        // Validate password
        const passwordValidation = password_utils_1.PasswordUtils.validatePassword(input.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message);
        }
        // Hash password
        const passwordHash = await password_utils_1.PasswordUtils.hash(input.password);
        // Create user and employee in transaction
        const result = await database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: input.email,
                    passwordHash,
                    role: 'EMPLOYEE',
                },
            });
            const employee = await tx.employee.create({
                data: {
                    userId: user.id,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    phone: input.phone,
                    photoUrl: input.photoUrl,
                    commissionRate: input.commissionRate,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
            return employee;
        });
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: createdBy,
                action: 'CREATE_EMPLOYEE',
                tableName: 'employees',
                recordId: result.id,
                newData: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    commissionRate: input.commissionRate,
                },
            },
        });
        logger_1.logger.info(`Employee created: ${input.firstName} ${input.lastName}`);
        return result;
    }
    static async getAllEmployees(filters = {}) {
        const where = {};
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { user: { email: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }
        const employees = await database_1.prisma.employee.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return employees;
    }
    static async getEmployeeById(id) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                        lastLogin: true,
                    },
                },
                _count: {
                    select: { services: true },
                },
            },
        });
        if (!employee) {
            throw new Error('Empleado no encontrado');
        }
        return employee;
    }
    static async updateEmployee(id, input, updatedBy) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { id },
        });
        if (!employee) {
            throw new Error('Empleado no encontrado');
        }
        const updated = await database_1.prisma.employee.update({
            where: { id },
            data: {
                firstName: input.firstName,
                lastName: input.lastName,
                phone: input.phone,
                photoUrl: input.photoUrl,
                commissionRate: input.commissionRate,
                isActive: input.isActive,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        // If employee is deactivated, also deactivate user
        if (input.isActive === false) {
            await database_1.prisma.user.update({
                where: { id: employee.userId },
                data: { isActive: false },
            });
        }
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: updatedBy,
                action: 'UPDATE_EMPLOYEE',
                tableName: 'employees',
                recordId: id,
                oldData: employee,
                newData: updated,
            },
        });
        logger_1.logger.info(`Employee updated: ${id}`);
        return updated;
    }
    static async deleteEmployee(id, deletedBy) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { services: true },
                },
            },
        });
        if (!employee) {
            throw new Error('Empleado no encontrado');
        }
        if (employee._count.services > 0) {
            // Soft delete - just deactivate
            await database_1.prisma.employee.update({
                where: { id },
                data: { isActive: false },
            });
            await database_1.prisma.user.update({
                where: { id: employee.userId },
                data: { isActive: false },
            });
        }
        else {
            // Hard delete if no services
            await database_1.prisma.$transaction([
                database_1.prisma.employee.delete({ where: { id } }),
                database_1.prisma.user.delete({ where: { id: employee.userId } }),
            ]);
        }
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: deletedBy,
                action: 'DELETE_EMPLOYEE',
                tableName: 'employees',
                recordId: id,
                oldData: employee,
            },
        });
        logger_1.logger.info(`Employee deleted: ${id}`);
    }
    static async getEmployeeEarnings(employeeId, filters) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new Error('Empleado no encontrado');
        }
        let startDate;
        let endDate = new Date();
        if (filters.startDate && filters.endDate) {
            startDate = filters.startDate;
            endDate = filters.endDate;
        }
        else {
            // Calculate based on period
            switch (filters.period) {
                case 'daily':
                    startDate = new Date();
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'weekly':
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'biweekly':
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 14);
                    break;
                case 'monthly':
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                default:
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 30);
            }
        }
        const services = await database_1.prisma.service.findMany({
            where: {
                employeeId,
                serviceDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const totals = commission_service_1.CommissionService.calculateTotals(services);
        return {
            employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            totalServices: services.length,
            totalRevenue: totals.totalRevenue,
            totalCommission: totals.totalCommission,
            salonEarnings: totals.totalSalonEarnings,
            period: { start: startDate, end: endDate },
        };
    }
    static async getAllEmployeesEarnings(filters) {
        const employees = await database_1.prisma.employee.findMany({
            where: { isActive: true },
        });
        const earningsPromises = employees.map((emp) => this.getEmployeeEarnings(emp.id, filters));
        return Promise.all(earningsPromises);
    }
}
exports.EmployeeService = EmployeeService;
//# sourceMappingURL=employee.service.js.map