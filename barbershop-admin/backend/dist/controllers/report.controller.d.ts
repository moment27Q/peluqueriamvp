import { Request, Response } from 'express';
export declare class ReportController {
    static getDailyReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getWeeklyReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getBiweeklyReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getMonthlyReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getCustomReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getDashboardSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getEmployeeComparison: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=report.controller.d.ts.map