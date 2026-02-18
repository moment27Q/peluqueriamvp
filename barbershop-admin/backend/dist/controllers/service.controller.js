"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const zod_1 = require("zod");
const service_record_service_1 = require("../services/service-record.service");
const error_middleware_1 = require("../middleware/error.middleware");
const createServiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid('ID de empleado inválido'),
        serviceTypeId: zod_1.z.string().uuid('ID de tipo de servicio inválido').optional(),
        clientName: zod_1.z.string().min(2, 'El nombre del cliente es requerido'),
        clientPhone: zod_1.z.string().optional(),
        price: zod_1.z.number().positive('El precio debe ser mayor a 0'),
        notes: zod_1.z.string().optional(),
    }),
});
const updateServiceSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid().optional(),
        serviceTypeId: zod_1.z.string().uuid().optional().nullable(),
        clientName: zod_1.z.string().min(2).optional(),
        clientPhone: zod_1.z.string().optional(),
        price: zod_1.z.number().positive().optional(),
        notes: zod_1.z.string().optional(),
    }),
});
const serviceIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
});
const serviceFiltersSchema = zod_1.z.object({
    query: zod_1.z.object({
        employeeId: zod_1.z.string().uuid().optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        clientName: zod_1.z.string().optional(),
    }),
});
const createServiceTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'El nombre es requerido'),
        description: zod_1.z.string().optional(),
        defaultPrice: zod_1.z.number().positive('El precio debe ser mayor a 0'),
        durationMinutes: zod_1.z.number().int().positive().optional(),
    }),
});
const updateServiceTypeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID inválido'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        defaultPrice: zod_1.z.number().positive().optional(),
        durationMinutes: zod_1.z.number().int().positive().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
class ServiceController {
}
exports.ServiceController = ServiceController;
_a = ServiceController;
ServiceController.getPublicServiceTypes = (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const serviceTypes = await service_record_service_1.ServiceRecordService.getAllServiceTypes(false);
    res.json({
        success: true,
        data: serviceTypes,
    });
});
// Service Records
ServiceController.createService = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const data = createServiceSchema.parse(req).body;
    const createdBy = req.user.userId;
    const service = await service_record_service_1.ServiceRecordService.createService(data, createdBy);
    res.status(201).json({
        success: true,
        data: service,
    });
});
ServiceController.getAllServices = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { query } = serviceFiltersSchema.parse(req);
    const filters = {
        employeeId: query.employeeId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        clientName: query.clientName,
    };
    const services = await service_record_service_1.ServiceRecordService.getAllServices(filters);
    res.json({
        success: true,
        data: services,
    });
});
ServiceController.getServiceById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = serviceIdSchema.parse(req).params;
    const service = await service_record_service_1.ServiceRecordService.getServiceById(id);
    res.json({
        success: true,
        data: service,
    });
});
ServiceController.updateService = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = updateServiceSchema.parse(req).params;
    const data = updateServiceSchema.parse(req).body;
    const updatedBy = req.user.userId;
    const service = await service_record_service_1.ServiceRecordService.updateService(id, data, updatedBy);
    res.json({
        success: true,
        data: service,
    });
});
ServiceController.deleteService = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = serviceIdSchema.parse(req).params;
    const deletedBy = req.user.userId;
    await service_record_service_1.ServiceRecordService.deleteService(id, deletedBy);
    res.json({
        success: true,
        message: 'Servicio eliminado exitosamente',
    });
});
// Service Types
ServiceController.createServiceType = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const data = createServiceTypeSchema.parse(req).body;
    const serviceType = await service_record_service_1.ServiceRecordService.createServiceType(data);
    res.status(201).json({
        success: true,
        data: serviceType,
    });
});
ServiceController.getAllServiceTypes = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { includeInactive } = req.query;
    const serviceTypes = await service_record_service_1.ServiceRecordService.getAllServiceTypes(includeInactive === 'true');
    res.json({
        success: true,
        data: serviceTypes,
    });
});
ServiceController.updateServiceType = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = updateServiceTypeSchema.parse(req).params;
    const data = updateServiceTypeSchema.parse(req).body;
    const serviceType = await service_record_service_1.ServiceRecordService.updateServiceType(id, data);
    res.json({
        success: true,
        data: serviceType,
    });
});
ServiceController.deleteServiceType = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = serviceIdSchema.parse(req).params;
    await service_record_service_1.ServiceRecordService.deleteServiceType(id);
    res.json({
        success: true,
        message: 'Tipo de servicio eliminado exitosamente',
    });
});
//# sourceMappingURL=service.controller.js.map