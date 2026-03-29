"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
class WithdrawalService {
    static async getWithdrawals(filters) {
        const where = {
            tenantId: filters.tenantId,
        };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.employeeId) {
            where.employeeId = filters.employeeId;
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
        }
        return database_1.prisma.withdrawal.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: { select: { email: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async updateStatus(id, tenantId, status, updatedBy) {
        const existing = await database_1.prisma.withdrawal.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new Error('Solicitud de retiro no encontrada');
        }
        const updated = await database_1.prisma.withdrawal.update({
            where: { id },
            data: { status },
        });
        await database_1.prisma.auditLog.create({
            data: {
                tenantId,
                userId: updatedBy,
                action: 'UPDATE_WITHDRAWAL_STATUS',
                tableName: 'withdrawals',
                recordId: id,
                oldData: existing,
                newData: updated,
            },
        });
        logger_1.logger.info(`Withdrawal status updated: ${id} -> ${status}`);
        return updated;
    }
}
exports.WithdrawalService = WithdrawalService;
//# sourceMappingURL=withdrawal.service.js.map