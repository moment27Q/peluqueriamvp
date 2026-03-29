"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalController = void 0;
const zod_1 = require("zod");
const error_middleware_1 = require("../middleware/error.middleware");
const withdrawal_service_1 = require("../services/withdrawal.service");
const listQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
        employeeId: zod_1.z.string().uuid().optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
});
const updateStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID invalido'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
    }),
});
class WithdrawalController {
}
exports.WithdrawalController = WithdrawalController;
_a = WithdrawalController;
WithdrawalController.getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { status, employeeId, startDate, endDate } = listQuerySchema.parse(req).query;
    const tenantId = req.user.tenantId;
    if (!tenantId)
        throw new Error('Usuario sin empresa');
    const withdrawals = await withdrawal_service_1.WithdrawalService.getWithdrawals({
        tenantId,
        status: status,
        employeeId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
    });
    res.json({
        success: true,
        data: withdrawals,
    });
});
WithdrawalController.updateStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = updateStatusSchema.parse(req).params;
    const { status } = updateStatusSchema.parse(req).body;
    const tenantId = req.user.tenantId;
    const updatedBy = req.user.userId;
    if (!tenantId)
        throw new Error('Usuario sin empresa');
    const updated = await withdrawal_service_1.WithdrawalService.updateStatus(id, tenantId, status, updatedBy);
    res.json({
        success: true,
        data: updated,
    });
});
//# sourceMappingURL=withdrawal.controller.js.map