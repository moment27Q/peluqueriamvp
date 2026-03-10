"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const password_utils_1 = require("../utils/password.utils");
const commission_service_1 = require("./commission.service");
const notification_service_1 = require("./notification.service");
class EmployeeService {
    static generateWithdrawalOperationNumber(date) {
        const pad = (n) => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const h = pad(date.getHours());
        const min = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        const random = Math.floor(Math.random() * 9000 + 1000);
        return `WD-${y}${m}${d}-${h}${min}${s}-${random}`;
    }
    static getPeriodDates(period) {
        const endDate = new Date();
        const startDate = new Date(endDate);
        switch (period) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'biweekly':
                startDate.setDate(startDate.getDate() - 14);
                break;
            case 'monthly':
            default:
                startDate.setMonth(startDate.getMonth() - 1);
                break;
        }
        return { startDate, endDate };
    }
    static async createEmployee(input, createdBy) {
        const normalizedEmail = input.email.trim().toLowerCase();
        const tenant = await database_1.prisma.tenant.findUnique({
            where: { id: input.tenantId },
            include: {
                subscriptionPlan: true,
            },
        });
        const maxEmployees = tenant?.subscriptionPlan?.maxEmployees;
        if (maxEmployees !== null && maxEmployees !== undefined) {
            const currentCount = await database_1.prisma.employee.count({
                where: {
                    tenantId: input.tenantId,
                    isActive: true,
                    user: {
                        role: 'EMPLOYEE',
                    },
                },
            });
            if (currentCount >= Number(maxEmployees)) {
                throw new Error('Has alcanzado el límite de peluqueros permitido para tu plan. Actualiza tu plan para agregar más.');
            }
        }
        // Check if email exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
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
                    email: normalizedEmail,
                    passwordHash,
                    role: 'EMPLOYEE',
                    tenantId: input.tenantId,
                },
            });
            const employee = await tx.employee.create({
                data: {
                    userId: user.id,
                    tenantId: input.tenantId,
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
                    email: normalizedEmail,
                    commissionRate: input.commissionRate,
                },
            },
        });
        logger_1.logger.info(`Employee created: ${input.firstName} ${input.lastName}`);
        return result;
    }
    static async getAllEmployees(filters = {}) {
        const where = {};
        // IMPORTANT: always scope to tenant if provided
        if (filters.tenantId) {
            where.tenantId = filters.tenantId;
        }
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
        let passwordHash;
        if (input.password) {
            const passwordValidation = password_utils_1.PasswordUtils.validatePassword(input.password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.message);
            }
            passwordHash = await password_utils_1.PasswordUtils.hash(input.password);
        }
        const updated = await database_1.prisma.$transaction(async (tx) => {
            const updatedEmployee = await tx.employee.update({
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
            if (input.isActive !== undefined || passwordHash) {
                await tx.user.update({
                    where: { id: employee.userId },
                    data: {
                        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
                        ...(passwordHash ? { passwordHash } : {}),
                    },
                });
            }
            return updatedEmployee;
        });
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
        const withdrawalsAggregate = await database_1.prisma.withdrawal.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                employeeId,
                status: {
                    in: ['PENDING', 'APPROVED'],
                },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const totalWithdrawn = Number(withdrawalsAggregate._sum.amount || 0);
        const availableBalance = Math.max(0, totals.totalCommission - totalWithdrawn);
        return {
            employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            totalServices: services.length,
            totalRevenue: totals.totalRevenue,
            totalCommission: totals.totalCommission,
            totalWithdrawn,
            availableBalance,
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
    static async getEmployeeByUserId(userId) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { userId },
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
            throw new Error('No existe perfil de peluquero para este usuario');
        }
        return employee;
    }
    static async getEmployeeEarningsByUserId(userId, filters) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!employee) {
            throw new Error('No existe perfil de peluquero para este usuario');
        }
        return this.getEmployeeEarnings(employee.id, filters);
    }
    static async getMyServiceHistory(userId, limit = 50) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!employee) {
            throw new Error('No existe perfil de peluquero para este usuario');
        }
        const services = await database_1.prisma.service.findMany({
            where: { employeeId: employee.id },
            include: {
                serviceType: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                serviceDate: 'desc',
            },
            take: limit,
        });
        return services.map((item) => ({
            id: item.id,
            date: item.serviceDate,
            clientName: item.clientName,
            serviceName: item.serviceType?.name || 'Servicio personalizado',
            price: Number(item.price),
            commissionAmount: Number(item.commissionAmount),
        }));
    }
    static async getMyPeriodReport(userId, period) {
        const employee = await database_1.prisma.employee.findUnique({
            where: { userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });
        if (!employee) {
            throw new Error('No existe perfil de peluquero para este usuario');
        }
        const { startDate, endDate } = this.getPeriodDates(period);
        const services = await database_1.prisma.service.findMany({
            where: {
                employeeId: employee.id,
                serviceDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                serviceType: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                serviceDate: 'desc',
            },
        });
        const totalRevenue = services.reduce((acc, item) => acc + Number(item.price), 0);
        const totalCommission = services.reduce((acc, item) => acc + Number(item.commissionAmount), 0);
        return {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            period,
            range: {
                startDate,
                endDate,
            },
            summary: {
                totalServices: services.length,
                totalRevenue,
                totalCommission,
                totalSalonEarnings: totalRevenue - totalCommission,
            },
            services: services.map((item) => ({
                id: item.id,
                date: item.serviceDate,
                clientName: item.clientName,
                serviceName: item.serviceType?.name || 'Servicio personalizado',
                price: Number(item.price),
                commissionAmount: Number(item.commissionAmount),
            })),
        };
    }
    static async requestWithdrawal(userId, amount, bankAccount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Monto invalido para retiro');
        }
        const earnings = await this.getEmployeeEarningsByUserId(userId, { period: 'monthly' });
        if (amount > earnings.availableBalance) {
            throw new Error('No tienes saldo suficiente para ese retiro');
        }
        const maskedAccountNumber = bankAccount.accountNumber.length > 4
            ? `****${bankAccount.accountNumber.slice(-4)}`
            : bankAccount.accountNumber;
        const requestedAt = new Date();
        const operationNumber = this.generateWithdrawalOperationNumber(requestedAt);
        const employee = await database_1.prisma.employee.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        if (!employee) {
            throw new Error('No existe perfil de peluquero para este usuario');
        }
        const employeeName = `${employee.firstName} ${employee.lastName}`;
        const employeeEmail = employee?.user?.email || '';
        await database_1.prisma.withdrawal.create({
            data: {
                tenantId: employee.tenantId,
                employeeId: employee.id,
                operationNumber,
                amount,
                status: 'PENDING',
                accountHolder: bankAccount.accountHolder.trim(),
                bankName: bankAccount.bankName.trim(),
                accountType: bankAccount.accountType,
                maskedAccountNumber,
                createdAt: requestedAt,
            },
        });
        const recipients = Array.from(new Set([env_1.env.WITHDRAWAL_NOTIFY_EMAIL, employeeEmail]
            .map((value) => value?.trim())
            .filter((value) => Boolean(value))));
        for (const recipient of recipients) {
            try {
                await notification_service_1.NotificationService.sendWithdrawalNotification({
                    toEmail: recipient,
                    operationNumber,
                    amount,
                    requestedAt,
                    employeeName,
                    employeeEmail: employeeEmail || 'sin-email',
                    bankName: bankAccount.bankName.trim(),
                    accountType: bankAccount.accountType,
                    maskedAccountNumber,
                });
            }
            catch (error) {
                const detail = error instanceof Error
                    ? `${error.name}: ${error.message}`
                    : typeof error === 'string'
                        ? error
                        : JSON.stringify(error);
                logger_1.logger.error(`Withdrawal notification email failed (${operationNumber}) user=${userId} to=${recipient} detail=${detail}`);
            }
        }
        return {
            operationNumber,
            requestedAt: requestedAt.toISOString(),
            requestedAmount: amount,
            availableBalance: Math.max(0, earnings.availableBalance - amount),
            status: 'PENDING',
            message: 'Solicitud de retiro registrada para tu cuenta bancaria',
            bankAccount: {
                accountHolder: bankAccount.accountHolder,
                bankName: bankAccount.bankName,
                accountType: bankAccount.accountType,
                accountNumber: maskedAccountNumber,
            },
        };
    }
}
exports.EmployeeService = EmployeeService;
//# sourceMappingURL=employee.service.js.map