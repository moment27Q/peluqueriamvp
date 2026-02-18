"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const zod_1 = require("zod");
const report_service_1 = require("../services/report.service");
const error_middleware_1 = require("../middleware/error.middleware");
const dateRangeSchema = zod_1.z.object({
    query: zod_1.z.object({
        date: zod_1.z.string().datetime().optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
});
class ReportController {
}
exports.ReportController = ReportController;
_a = ReportController;
ReportController.getDailyReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { date } = dateRangeSchema.parse(req).query;
    const report = await report_service_1.ReportService.getDailyReport(date ? new Date(date) : undefined);
    res.json({
        success: true,
        data: report,
    });
});
ReportController.getWeeklyReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { date } = dateRangeSchema.parse(req).query;
    const report = await report_service_1.ReportService.getWeeklyReport(date ? new Date(date) : undefined);
    res.json({
        success: true,
        data: report,
    });
});
ReportController.getBiweeklyReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { date } = dateRangeSchema.parse(req).query;
    const report = await report_service_1.ReportService.getBiweeklyReport(date ? new Date(date) : undefined);
    res.json({
        success: true,
        data: report,
    });
});
ReportController.getMonthlyReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { date } = dateRangeSchema.parse(req).query;
    const report = await report_service_1.ReportService.getMonthlyReport(date ? new Date(date) : undefined);
    res.json({
        success: true,
        data: report,
    });
});
ReportController.getCustomReport = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = dateRangeSchema.parse(req).query;
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: 'Se requieren las fechas de inicio y fin',
        });
    }
    const report = await report_service_1.ReportService.getCustomReport(new Date(startDate), new Date(endDate));
    res.json({
        success: true,
        data: report,
    });
});
ReportController.getDashboardSummary = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const summary = await report_service_1.ReportService.getDashboardSummary();
    res.json({
        success: true,
        data: summary,
    });
});
ReportController.getEmployeeComparison = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = dateRangeSchema.parse(req).query;
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: 'Se requieren las fechas de inicio y fin',
        });
    }
    const comparison = await report_service_1.ReportService.getEmployeeComparison(new Date(startDate), new Date(endDate));
    res.json({
        success: true,
        data: comparison,
    });
});
//# sourceMappingURL=report.controller.js.map