import { prisma } from '../config/database';
import { logger } from '../config/logger';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface WithdrawalFilters {
  tenantId: string;
  status?: WithdrawalStatus;
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class WithdrawalService {
  static async getWithdrawals(filters: WithdrawalFilters) {
    const where: any = {
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
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return prisma.withdrawal.findMany({
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

  static async updateStatus(
    id: string,
    tenantId: string,
    status: WithdrawalStatus,
    updatedBy: string
  ) {
    const existing = await prisma.withdrawal.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error('Solicitud de retiro no encontrada');
    }

    const updated = await prisma.withdrawal.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
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

    logger.info(`Withdrawal status updated: ${id} -> ${status}`);

    return updated;
  }
}
