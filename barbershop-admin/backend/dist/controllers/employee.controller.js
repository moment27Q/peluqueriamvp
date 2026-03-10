"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const zod_1 = require("zod");
const employee_service_1 = require("../services/employee.service");
const error_middleware_1 = require("../middleware/error.middleware");
const optionalTrimmedString = zod_1.z.preprocess((value) => {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
}, zod_1.z.string().optional());
const optionalPhotoUrl = zod_1.z.preprocess((value) => {
    if (value === null)
        return undefined;
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
}, zod_1.z.string().url('La foto debe ser una URL valida').optional());
const optionalPassword = zod_1.z.preprocess((value) => {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
}, zod_1.z.string().min(8, 'La contrasena debe tener al menos 8 caracteres').optional());
const createEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email inválido'),
        password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
        firstName: zod_1.z.string().min(2, 'El nombre es requerido'),
        lastName: zod_1.z.string().min(2, 'El apellido es requerido'),
        phone: optionalTrimmedString,
        photoUrl: optionalPhotoUrl,
        commissionRate: zod_1.z.number().min(0).max(100).default(50),
    }),
});
const updateEmployeeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2).optional(),
        lastName: zod_1.z.string().min(2).optional(),
        phone: optionalTrimmedString,
        photoUrl: optionalPhotoUrl,
        password: optionalPassword,
        commissionRate: zod_1.z.number().min(0).max(100).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
const employeeIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
});
const earningsFilterSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
    query: zod_1.z.object({
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        period: zod_1.z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
    }),
});
const myEarningsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        period: zod_1.z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
    }),
});
const withdrawalSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive('El monto debe ser mayor a 0'),
        bankAccount: zod_1.z.object({
            accountHolder: zod_1.z.string().min(3, 'El titular es obligatorio'),
            bankName: zod_1.z.string().min(2, 'El banco es obligatorio'),
            accountType: zod_1.z.enum(['checking', 'savings']),
            accountNumber: zod_1.z.string().min(6, 'Numero de cuenta invalido'),
        }),
    }),
});
class EmployeeController {
}
exports.EmployeeController = EmployeeController;
_a = EmployeeController;
EmployeeController.createEmployee = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const data = createEmployeeSchema.parse(req).body;
    const createdBy = req.user.userId;
    const tenantId = req.user.tenantId;
    if (!tenantId)
        throw new Error('Usuario sin empresa');
    const employee = await employee_service_1.EmployeeService.createEmployee({ ...data, tenantId }, createdBy);
    res.status(201).json({
        success: true,
        data: employee,
    });
});
EmployeeController.getAllEmployees = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { isActive, search } = req.query;
    const tenantId = req.user.tenantId;
    const filters = {
        tenantId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search: search,
    };
    const employees = await employee_service_1.EmployeeService.getAllEmployees(filters);
    res.json({
        success: true,
        data: employees,
    });
});
EmployeeController.getEmployeeById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = employeeIdSchema.parse(req).params;
    const employee = await employee_service_1.EmployeeService.getEmployeeById(id);
    res.json({
        success: true,
        data: employee,
    });
});
EmployeeController.updateEmployee = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = updateEmployeeSchema.parse(req).params;
    const data = updateEmployeeSchema.parse(req).body;
    const updatedBy = req.user.userId;
    const employee = await employee_service_1.EmployeeService.updateEmployee(id, data, updatedBy);
    res.json({
        success: true,
        data: employee,
    });
});
EmployeeController.deleteEmployee = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = employeeIdSchema.parse(req).params;
    const deletedBy = req.user.userId;
    await employee_service_1.EmployeeService.deleteEmployee(id, deletedBy);
    res.json({
        success: true,
        message: 'Empleado eliminado exitosamente',
    });
});
EmployeeController.getEmployeeEarnings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = earningsFilterSchema.parse(req).params;
    const { startDate, endDate, period } = earningsFilterSchema.parse(req).query;
    const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        period: period || 'monthly',
    };
    const earnings = await employee_service_1.EmployeeService.getEmployeeEarnings(id, filters);
    res.json({
        success: true,
        data: earnings,
    });
});
EmployeeController.getAllEmployeesEarnings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, period } = req.query;
    const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        period: period || 'monthly',
    };
    const earnings = await employee_service_1.EmployeeService.getAllEmployeesEarnings(filters);
    res.json({
        success: true,
        data: earnings,
    });
});
EmployeeController.getMyProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const profile = await employee_service_1.EmployeeService.getEmployeeByUserId(userId);
    res.json({
        success: true,
        data: profile,
    });
});
EmployeeController.getMyServices = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const services = await employee_service_1.EmployeeService.getMyServiceHistory(userId);
    res.json({
        success: true,
        data: services,
    });
});
EmployeeController.getMyEarnings = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { period } = myEarningsQuerySchema.parse(req).query;
    const earnings = await employee_service_1.EmployeeService.getEmployeeEarningsByUserId(userId, {
        period: period || 'monthly',
    });
    res.json({
        success: true,
        data: earnings,
    });
});
EmployeeController.getMyReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { period } = myEarningsQuerySchema.parse(req).query;
    const report = await employee_service_1.EmployeeService.getMyPeriodReport(userId, period || 'weekly');
    res.json({
        success: true,
        data: report,
    });
});
EmployeeController.requestMyWithdrawal = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const { amount, bankAccount } = withdrawalSchema.parse(req).body;
    const result = await employee_service_1.EmployeeService.requestWithdrawal(userId, amount, bankAccount);
    res.status(201).json({
        success: true,
        data: result,
    });
});
//# sourceMappingURL=employee.controller.js.map