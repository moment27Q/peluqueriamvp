"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const logger_1 = require("../config/logger");
class CommissionService {
    /**
     * Calcula la comisión de un servicio
     * @param price - Precio del servicio
     * @param commissionRate - Porcentaje de comisión (0-100)
     * @returns Objeto con el monto de comisión y ganancia del salón
     */
    static calculateCommission(price, commissionRate) {
        // Validaciones de seguridad
        if (price < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        if (commissionRate < 0 || commissionRate > 100) {
            throw new Error('La comisión debe estar entre 0 y 100');
        }
        // Cálculo con precisión de 2 decimales
        const commissionAmount = Math.round(price * (commissionRate / 100) * 100) / 100;
        const salonEarnings = Math.round((price - commissionAmount) * 100) / 100;
        logger_1.logger.debug(`Commission calculated: price=${price}, rate=${commissionRate}%, commission=${commissionAmount}, salon=${salonEarnings}`);
        return { commissionAmount, salonEarnings };
    }
    /**
     * Valida que el precio no haya sido manipulado
     * @param submittedPrice - Precio enviado por el cliente
     * @param expectedPrice - Precio esperado del servidor
     * @param tolerance - Tolerancia de diferencia (default: 0.01)
     * @returns boolean indicando si el precio es válido
     */
    static validatePriceIntegrity(submittedPrice, expectedPrice, tolerance = 0.01) {
        const difference = Math.abs(submittedPrice - expectedPrice);
        return difference <= tolerance;
    }
    /**
     * Calcula totales para un conjunto de servicios
     */
    static calculateTotals(services) {
        return services.reduce((acc, service) => ({
            totalRevenue: acc.totalRevenue + Number(service.price),
            totalCommission: acc.totalCommission + Number(service.commissionAmount),
            totalSalonEarnings: acc.totalSalonEarnings + (Number(service.price) - Number(service.commissionAmount)),
        }), { totalRevenue: 0, totalCommission: 0, totalSalonEarnings: 0 });
    }
}
exports.CommissionService = CommissionService;
//# sourceMappingURL=commission.service.js.map