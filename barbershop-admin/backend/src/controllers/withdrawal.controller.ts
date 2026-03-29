import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import { WithdrawalService, WithdrawalStatus } from '../services/withdrawal.service';

const listQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    employeeId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID invalido'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  }),
});

export class WithdrawalController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { status, employeeId, startDate, endDate } = listQuerySchema.parse(req).query;
    const tenantId = req.user!.tenantId;

    if (!tenantId) throw new Error('Usuario sin empresa');

    const withdrawals = await WithdrawalService.getWithdrawals({
      tenantId,
      status: status as WithdrawalStatus | undefined,
      employeeId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.json({
      success: true,
      data: withdrawals,
    });
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = updateStatusSchema.parse(req).params;
    const { status } = updateStatusSchema.parse(req).body;
    const tenantId = req.user!.tenantId;
    const updatedBy = req.user!.userId;

    if (!tenantId) throw new Error('Usuario sin empresa');

    const updated = await WithdrawalService.updateStatus(id, tenantId, status as WithdrawalStatus, updatedBy);

    res.json({
      success: true,
      data: updated,
    });
  });
}
