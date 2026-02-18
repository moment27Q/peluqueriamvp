import { Request, Response } from 'express';
export declare class AuthController {
    static login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static refreshToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=auth.controller.d.ts.map