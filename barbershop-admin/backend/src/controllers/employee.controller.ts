import { Request, Response } from 'express';
import { z } from 'zod';
import { EmployeeService } from '../services/employee.service';
import { asyncHandler } from '../middleware/error.middleware';

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const optionalPhotoUrl = z.preprocess((value) => {
  if (value === null) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().url('La foto debe ser una URL valida').optional());

const createEmployeeSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    firstName: z.string().min(2, 'El nombre es requerido'),
    lastName: z.string().min(2, 'El apellido es requerido'),
    phone: optionalTrimmedString,
    photoUrl: optionalPhotoUrl,
    commissionRate: z.number().min(0).max(100).default(50),
  }),
});

const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: optionalTrimmedString,
    photoUrl: optionalPhotoUrl,
    commissionRate: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

const employeeIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

const earningsFilterSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    period: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  }),
});

const myEarningsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  }),
});

const withdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive('El monto debe ser mayor a 0'),
    bankAccount: z.object({
      accountHolder: z.string().min(3, 'El titular es obligatorio'),
      bankName: z.string().min(2, 'El banco es obligatorio'),
      accountType: z.enum(['checking', 'savings']),
      accountNumber: z.string().min(6, 'Numero de cuenta invalido'),
    }),
  }),
});

export class EmployeeController {
  static createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const data = createEmployeeSchema.parse(req).body;
    const createdBy = req.user!.userId;

    const employee = await EmployeeService.createEmployee(data, createdBy);

    res.status(201).json({
      success: true,
      data: employee,
    });
  });

  static getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
    const { isActive, search } = req.query;

    const filters = {
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search: search as string | undefined,
    };

    const employees = await EmployeeService.getAllEmployees(filters);

    res.json({
      success: true,
      data: employees,
    });
  });

  static getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req).params;

    const employee = await EmployeeService.getEmployeeById(id);

    res.json({
      success: true,
      data: employee,
    });
  });

  static updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = updateEmployeeSchema.parse(req).params;
    const data = updateEmployeeSchema.parse(req).body;
    const updatedBy = req.user!.userId;

    const employee = await EmployeeService.updateEmployee(id, data, updatedBy);

    res.json({
      success: true,
      data: employee,
    });
  });

  static deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req).params;
    const deletedBy = req.user!.userId;

    await EmployeeService.deleteEmployee(id, deletedBy);

    res.json({
      success: true,
      message: 'Empleado eliminado exitosamente',
    });
  });

  static getEmployeeEarnings = asyncHandler(async (req: Request, res: Response) => {
    const { id } = earningsFilterSchema.parse(req).params;
    const { startDate, endDate, period } = earningsFilterSchema.parse(req).query;

    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      period: period || 'monthly',
    };

    const earnings = await EmployeeService.getEmployeeEarnings(id, filters);

    res.json({
      success: true,
      data: earnings,
    });
  });

  static getAllEmployeesEarnings = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, period } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      period: (period as 'daily' | 'weekly' | 'biweekly' | 'monthly') || 'monthly',
    };

    const earnings = await EmployeeService.getAllEmployeesEarnings(filters);

    res.json({
      success: true,
      data: earnings,
    });
  });

  static getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const profile = await EmployeeService.getEmployeeByUserId(userId);

    res.json({
      success: true,
      data: profile,
    });
  });

  static getMyServices = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const services = await EmployeeService.getMyServiceHistory(userId);

    res.json({
      success: true,
      data: services,
    });
  });

  static getMyEarnings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { period } = myEarningsQuerySchema.parse(req).query;
    const earnings = await EmployeeService.getEmployeeEarningsByUserId(userId, {
      period: period || 'monthly',
    });

    res.json({
      success: true,
      data: earnings,
    });
  });

  static getMyReport = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { period } = myEarningsQuerySchema.parse(req).query;
    const report = await EmployeeService.getMyPeriodReport(userId, period || 'weekly');

    res.json({
      success: true,
      data: report,
    });
  });

  static requestMyWithdrawal = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { amount, bankAccount } = withdrawalSchema.parse(req).body;
    const result = await EmployeeService.requestWithdrawal(userId, amount, bankAccount);

    res.status(201).json({
      success: true,
      data: result,
    });
  });
}
