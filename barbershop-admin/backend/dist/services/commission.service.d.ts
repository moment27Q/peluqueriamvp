export interface CommissionCalculation {
    commissionAmount: number;
    salonEarnings: number;
}
export declare class CommissionService {
    /**
     * Calcula la comisión de un servicio
     * @param price - Precio del servicio
     * @param commissionRate - Porcentaje de comisión (0-100)
     * @returns Objeto con el monto de comisión y ganancia del salón
     */
    static calculateCommission(price: number, commissionRate: number): CommissionCalculation;
    /**
     * Valida que el precio no haya sido manipulado
     * @param submittedPrice - Precio enviado por el cliente
     * @param expectedPrice - Precio esperado del servidor
     * @param tolerance - Tolerancia de diferencia (default: 0.01)
     * @returns boolean indicando si el precio es válido
     */
    static validatePriceIntegrity(submittedPrice: number, expectedPrice: number, tolerance?: number): boolean;
    /**
     * Calcula totales para un conjunto de servicios
     */
    static calculateTotals(services: Array<{
        price: number;
        commissionAmount: number;
    }>): {
        totalRevenue: number;
        totalCommission: number;
        totalSalonEarnings: number;
    };
}
//# sourceMappingURL=commission.service.d.ts.map