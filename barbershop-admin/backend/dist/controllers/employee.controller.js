"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const zod_1 = require("zod");
const employee_service_1 = require("../services/employee.service");
const error_middleware_1 = require("../middleware/error.middleware");
const createEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email inválido'),
        password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
        firstName: zod_1.z.string().min(2, 'El nombre es requerido'),
        lastName: zod_1.z.string().min(2, 'El apellido es requerido'),
        phone: zod_1.z.string().optional(),
        photoUrl: zod_1.z.string().url().optional(),
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
        phone: zod_1.z.string().optional(),
        photoUrl: zod_1.z.string().url().optional(),
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
class EmployeeController {
}
exports.EmployeeController = EmployeeController;
_a = EmployeeController;
EmployeeController.createEmployee = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const data = createEmployeeSchema.parse(req).body;
    const createdBy = req.user.userId;
    const employee = await employee_service_1.EmployeeService.createEmployee(data, createdBy);
    res.status(201).json({
        success: true,
        data: employee,
    });
});
EmployeeController.getAllEmployees = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { isActive, search } = req.query;
    const filters = {
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
//# sourceMappingURL=employee.controller.js.map