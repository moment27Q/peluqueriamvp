import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

interface WithdrawalNotificationPayload {
  toEmail?: string;
  operationNumber: string;
  amount: number;
  requestedAt: Date;
  employeeName: string;
  employeeEmail: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  maskedAccountNumber: string;
}

export class NotificationService {
  private static transporter: Transporter | null = null;

  private static getTransporter() {
    if (this.transporter) return this.transporter;

    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    return this.transporter;
  }

  static async sendWithdrawalNotification(payload: WithdrawalNotificationPayload) {
    const transporter = this.getTransporter();
    const recipient = payload.toEmail || env.WITHDRAWAL_NOTIFY_EMAIL;

    if (!recipient) {
      logger.warn('Withdrawal notification skipped: no recipient email configured');
      return;
    }

    if (!transporter) {
      logger.warn('Withdrawal notification skipped: SMTP is not configured');
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
      timeZone: env.WITHDRAWAL_TIMEZONE || 'America/Lima',
    });

    const accountTypeLabel = payload.accountType === 'checking' ? 'Corriente' : 'Ahorros';
    const fromAddress = env.SMTP_FROM_EMAIL || env.SMTP_USER;
    const fromName = env.SMTP_FROM_NAME || 'Panel Peluqueria';

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
