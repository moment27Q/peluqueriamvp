import { Request, Response } from 'express';
import { z } from 'zod';
import { ReportService } from '../services/report.service';
import { asyncHandler } from '../middleware/error.middleware';

const dateRangeSchema = z.object({
  query: z.object({
    date: z.string().datetime().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export class ReportController {
  static getDailyReport = asyncHandler(async (req: Request, res: Response) => {
    const { date } = dateRangeSchema.parse(req).query;

    const report = await ReportService.getDailyReport(
      date ? new Date(date) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  });

  static getWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
    const { date } = dateRangeSchema.parse(req).query;

    const report = await ReportService.getWeeklyReport(
      date ? new Date(date) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  });

  static getBiweeklyReport = asyncHandler(async (req: Request, res: Response) => {
    const { date } = dateRangeSchema.parse(req).query;

    const report = await ReportService.getBiweeklyReport(
      date ? new Date(date) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  });

  static getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
    const { date } = dateRangeSchema.parse(req).query;

    const report = await ReportService.getMonthlyReport(
      date ? new Date(date) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  });

  static getCustomReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = dateRangeSchema.parse(req).query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren las fechas de inicio y fin',
      });
    }

    const report = await ReportService.getCustomReport(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: report,
    });
  });

  static getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await ReportService.getDashboardSummary();

    res.json({
      success: true,
      data: summary,
    });
  });

  static getEmployeeComparison = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = dateRangeSchema.parse(req).query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren las fechas de inicio y fin',
      });
    }

    const comparison = await ReportService.getEmployeeComparison(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: comparison,
    });
  });
}
