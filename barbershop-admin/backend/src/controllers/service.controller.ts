import { Request, Response } from 'express';
import { z } from 'zod';
import { ServiceRecordService } from '../services/service-record.service';
import { asyncHandler } from '../middleware/error.middleware';

const createServiceSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('ID de empleado inválido'),
    serviceTypeId: z.string().uuid('ID de tipo de servicio inválido').optional(),
    clientName: z.string().min(2, 'El nombre del cliente es requerido'),
    clientPhone: z.string().optional(),
    price: z.number().positive('El precio debe ser mayor a 0'),
    notes: z.string().optional(),
  }),
});

const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    employeeId: z.string().uuid().optional(),
    serviceTypeId: z.string().uuid().optional().nullable(),
    clientName: z.string().min(2).optional(),
    clientPhone: z.string().optional(),
    price: z.number().positive().optional(),
    notes: z.string().optional(),
  }),
});

const serviceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

const serviceFiltersSchema = z.object({
  query: z.object({
    employeeId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    clientName: z.string().optional(),
  }),
});

const createServiceTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre es requerido'),
    description: z.string().optional(),
    defaultPrice: z.number().positive('El precio debe ser mayor a 0'),
    durationMinutes: z.number().int().positive().optional(),
  }),
});

const updateServiceTypeSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    defaultPrice: z.number().positive().optional(),
    durationMinutes: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export class ServiceController {
  static getPublicServiceTypes = asyncHandler(async (_req: Request, res: Response) => {
    const serviceTypes = await ServiceRecordService.getAllServiceTypes(false);

    res.json({
      success: true,
      data: serviceTypes,
    });
  });

  // Service Records
  static createService = asyncHandler(async (req: Request, res: Response) => {
    const data = createServiceSchema.parse(req).body;
    const createdBy = req.user!.userId;

    const service = await ServiceRecordService.createService(data, createdBy);

    res.status(201).json({
      success: true,
      data: service,
    });
  });

  static getAllServices = asyncHandler(async (req: Request, res: Response) => {
    const { query } = serviceFiltersSchema.parse(req);

    const filters = {
      employeeId: query.employeeId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      clientName: query.clientName,
    };

    const services = await ServiceRecordService.getAllServices(filters);

    res.json({
      success: true,
      data: services,
    });
  });

  static getServiceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = serviceIdSchema.parse(req).params;

    const service = await ServiceRecordService.getServiceById(id);

    res.json({
      success: true,
      data: service,
    });
  });

  static updateService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = updateServiceSchema.parse(req).params;
    const data = updateServiceSchema.parse(req).body;
    const updatedBy = req.user!.userId;

    const service = await ServiceRecordService.updateService(id, data, updatedBy);

    res.json({
      success: true,
      data: service,
    });
  });

  static deleteService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = serviceIdSchema.parse(req).params;
    const deletedBy = req.user!.userId;

    await ServiceRecordService.deleteService(id, deletedBy);

    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente',
    });
  });

  // Service Types
  static createServiceType = asyncHandler(async (req: Request, res: Response) => {
    const data = createServiceTypeSchema.parse(req).body;

    const serviceType = await ServiceRecordService.createServiceType(data);

    res.status(201).json({
      success: true,
      data: serviceType,
    });
  });

  static getAllServiceTypes = asyncHandler(async (req: Request, res: Response) => {
    const { includeInactive } = req.query;

    const serviceTypes = await ServiceRecordService.getAllServiceTypes(
      includeInactive === 'true'
    );

    res.json({
      success: true,
      data: serviceTypes,
    });
  });

  static updateServiceType = asyncHandler(async (req: Request, res: Response) => {
    const { id } = updateServiceTypeSchema.parse(req).params;
    const data = updateServiceTypeSchema.parse(req).body;

    const serviceType = await ServiceRecordService.updateServiceType(id, data);

    res.json({
      success: true,
      data: serviceType,
    });
  });

  static deleteServiceType = asyncHandler(async (req: Request, res: Response) => {
    const { id } = serviceIdSchema.parse(req).params;

    await ServiceRecordService.deleteServiceType(id);

    res.json({
      success: true,
      message: 'Tipo de servicio eliminado exitosamente',
    });
  });
}
