"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
class NotificationService {
    static getTransporter() {
        if (this.transporter)
            return this.transporter;
        if (!env_1.env.SMTP_HOST || !env_1.env.SMTP_PORT || !env_1.env.SMTP_USER || !env_1.env.SMTP_PASS) {
            return null;
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST,
            port: Number(env_1.env.SMTP_PORT),
            secure: env_1.env.SMTP_SECURE === 'true',
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASS,
            },
        });
        return this.transporter;
    }
    static async sendWithdrawalNotification(payload) {
        const transporter = this.getTransporter();
        const recipient = payload.toEmail || env_1.env.WITHDRAWAL_NOTIFY_EMAIL;
        if (!recipient) {
            logger_1.logger.warn('Withdrawal notification skipped: no recipient email configured');
            return;
        }
        if (!transporter) {
            logger_1.logger.warn('Withdrawal notification skipped: SMTP is not configured');
            return;
        }
        const requestedAtLocal = payload.requestedAt.toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: env_1.env.WITHDRAWAL_TIMEZONE || 'America/Lima',
        });
        const accountTypeLabel = payload.accountType === 'checking' ? 'Corriente' : 'Ahorros';
        const fromAddress = env_1.env.SMTP_FROM_EMAIL || env_1.env.SMTP_USER;
        const fromName = env_1.env.SMTP_FROM_NAME || 'Panel Peluqueria';
        await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to: recipient,
            subject: `Nuevo retiro solicitado - ${payload.operationNumber}`,
            text: [
                'Se registro una nueva solicitud de retiro.',
                `Operacion: ${payload.operationNumber}`,
                `Monto: S/ ${payload.amount.toFixed(2)}`,
                `Fecha y hora: ${requestedAtLocal}`,
                `Peluquero: ${payload.employeeName} (${payload.employeeEmail})`,
                `Banco: ${payload.bankName}`,
                `Tipo de cuenta: ${accountTypeLabel}`,
                `Cuenta: ${payload.maskedAccountNumber}`,
            ].join('\n'),
            html: `
        <h2>Nueva solicitud de retiro</h2>
        <p><strong>Operacion:</strong> ${payload.operationNumber}</p>
        <p><strong>Monto:</strong> S/ ${payload.amount.toFixed(2)}</p>
        <p><strong>Fecha y hora:</strong> ${requestedAtLocal}</p>
        <p><strong>Peluquero:</strong> ${payload.employeeName} (${payload.employeeEmail})</p>
        <p><strong>Banco:</strong> ${payload.bankName}</p>
        <p><strong>Tipo de cuenta:</strong> ${accountTypeLabel}</p>
        <p><strong>Cuenta:</strong> ${payload.maskedAccountNumber}</p>
      `,
        });
    }
}
exports.NotificationService = NotificationService;
NotificationService.transporter = null;
//# sourceMappingURL=notification.service.js.map