import React, { useCallback, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../services/api';

type DateRange = 'Hoy' | 'Esta Semana' | 'Este Mes' | 'Este Año';

interface ServiceRecord {
    id: string;
    price: number | string;
    commissionAmount?: number | string;
    serviceDate?: string;
    employee?: {
        firstName: string;
        lastName: string;
    } | null;
    serviceType?: {
        name: string;
    } | null;
}

interface TopService {
    name: string;
    count: number;
    revenueValue: number;
    revenueLabel: string;
}

interface TopEmployee {
    name: string;
    services: number;
    revenueValue: number;
    revenueLabel: string;
    rating: number;
}

interface PeriodReportResponse {
    summary: {
        totalServices: number;
        totalRevenue: number;
    };
    byEmployee: Array<{
        employeeName: string;
        servicesCount: number;
        revenue: number;
        commission?: number;
    }>;
}

interface EmployeeIncomeHistory {
    totalEarnings: number;
    totalServices: number;
    lastIncomeLabel: string;
    recentIncomeLabel: string;
}

export const AdminReports: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange>('Esta Semana');
    const [loading, setLoading] = useState(true);
    const [topServices, setTopServices] = useState<TopService[]>([]);
    const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
    const [salesValue, setSalesValue] = useState(0);
    const [servicesCount, setServicesCount] = useState(0);
    const [employeeHistory, setEmployeeHistory] = useState<Record<string, EmployeeIncomeHistory>>({});

    const getRangeDates = (range: DateRange) => {
        const end = new Date();
        const start = new Date(end);

        if (range === 'Hoy') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (range === 'Esta Semana') {
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (range === 'Este Mes') {
            start.setMonth(start.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else {
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }

        return { start, end };
    };

    const getPeriodEndpoint = (range: DateRange) => {
        if (range === 'Hoy') return '/reports/daily';
        if (range === 'Esta Semana') return '/reports/weekly';
        if (range === 'Este Mes') return '/reports/monthly';
        return '/reports/custom';
    };

    const loadReportData = useCallback(async () => {
        try {
            setLoading(true);
            const { start, end } = getRangeDates(dateRange);

            const periodEndpoint = getPeriodEndpoint(dateRange);
            const periodQuery =
                periodEndpoint === '/reports/custom'
                    ? `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
                    : `?date=${end.toISOString()}`;

            const [periodRes, servicesRes, allServicesRes] = await Promise.all([
                api.get<{ data: PeriodReportResponse }>(`${periodEndpoint}${periodQuery}`),
                api.get<{ data: ServiceRecord[] }>(
                    `/services?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
                ),
                api.get<{ data: ServiceRecord[] }>('/services'),
            ]);

            const period = periodRes.data;
            const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];
            const allServices = Array.isArray(allServicesRes.data) ? allServicesRes.data : [];

            setSalesValue(period?.summary?.totalRevenue || 0);
            setServicesCount(period?.summary?.totalServices || 0);

            const groupedServices = new Map<string, { count: number; revenue: number }>();
            for (const service of services) {
                const name = service.serviceType?.name || 'Servicio personalizado';
                const revenue = Number(service.price) || 0;
                const current = groupedServices.get(name) || { count: 0, revenue: 0 };
                current.count += 1;
                current.revenue += revenue;
                groupedServices.set(name, current);
            }

            const mappedTopServices = Array.from(groupedServices.entries())
                .map(([name, info]) => ({
                    name,
                    count: info.count,
                    revenueValue: info.revenue,
                    revenueLabel: `$${info.revenue.toLocaleString('en-US')}`,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);
            setTopServices(mappedTopServices);

            const mappedTopEmployees = (period?.byEmployee || [])
                .map((emp, idx) => ({
                    name: emp.employeeName,
                    services: emp.servicesCount,
                    revenueValue: Number(emp.commission ?? emp.revenue ?? 0),
                    revenueLabel: `$${Number(emp.commission ?? emp.revenue ?? 0).toLocaleString('en-US')}`,
                    rating: Number((4.9 - idx * 0.1).toFixed(1)),
                }))
                .sort((a, b) => b.revenueValue - a.revenueValue)
                .slice(0, 6);
            setTopEmployees(mappedTopEmployees);

            const historyMap = new Map<
                string,
                {
                    totalEarnings: number;
                    totalServices: number;
                    entries: Array<{ date: string; amount: number }>;
                }
            >();
            for (const service of allServices) {
                const employeeName = service.employee
                    ? `${service.employee.firstName} ${service.employee.lastName}`
                    : 'Sin asignar';
                const serviceDate = service.serviceDate || '';
                if (!serviceDate) continue;
                const gain = Number(service.commissionAmount ?? 0);

                if (!historyMap.has(employeeName)) {
                    historyMap.set(employeeName, {
                        totalEarnings: 0,
                        totalServices: 0,
                        entries: [],
                    });
                }
                const history = historyMap.get(employeeName)!;
                history.totalEarnings += gain;
                history.totalServices += 1;
                history.entries.push({
                    date: serviceDate,
                    amount: gain,
                });
            }

            const historyLabels: Record<string, EmployeeIncomeHistory> = {};
            for (const [employeeName, history] of historyMap.entries()) {
                const sortedEntries = history.entries
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date));

                const lastIncome = sortedEntries[0];
                const lastIncomeLabel = lastIncome
                    ? `${new Date(lastIncome.date).toLocaleString('es-ES')} · $${lastIncome.amount.toFixed(2)}`
                    : 'Sin ingresos';

                const recentIncomeLabel = sortedEntries
                    .slice(0, 5)
                    .map((entry) => {
                        const d = new Date(entry.date);
                        return `${d.getDate()}/${d.getMonth() + 1}: $${entry.amount.toFixed(2)}`;
                    });
                historyLabels[employeeName] = {
                    totalEarnings: history.totalEarnings,
                    totalServices: history.totalServices,
                    lastIncomeLabel,
                    recentIncomeLabel: recentIncomeLabel.join(' · '),
                };
            }
            setEmployeeHistory(historyLabels);
        } catch (error) {
            console.error('Error loading reports data:', error);
            setTopServices([]);
            setTopEmployees([]);
            setSalesValue(0);
            setServicesCount(0);
            setEmployeeHistory({});
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    useEffect(() => {
        const onSalesUpdated = () => loadReportData();
        window.addEventListener('sales:updated', onSalesUpdated);
        return () => window.removeEventListener('sales:updated', onSalesUpdated);
    }, [loadReportData]);

    const exportPdf = (period: string) => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(`Reporte de Negocio - ${period}`, 14, 20);
        doc.setFontSize(11);
        doc.setTextColor(90);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

        doc.setTextColor(0);
        doc.setFontSize(13);
        doc.text('Resumen General', 14, 40);

        autoTable(doc, {
            startY: 44,
            head: [['Metrica', 'Valor']],
            body: [
                ['Ventas Totales', `$${salesValue.toLocaleString('en-US')}`],
                ['Servicios Realizados', String(servicesCount)],
            ],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [30, 30, 30] },
        });

        let nextY = 44;
        const afterSummary = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable;
        if (afterSummary?.finalY) nextY = afterSummary.finalY + 12;

        doc.setFontSize(13);
        doc.text('Servicios Mas Vendidos', 14, nextY);
        autoTable(doc, {
            startY: nextY + 4,
            head: [['Servicio', 'Ventas', 'Ingresos']],
            body: topServices.length
                ? topServices.map((s) => [s.name, String(s.count), s.revenueLabel])
                : [['Sin datos', '0', '$0']],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [30, 30, 30] },
        });

        const afterServices = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable;
        const employeesY = (afterServices?.finalY || nextY + 40) + 12;

        doc.setFontSize(13);
        doc.text('Rendimiento del Personal', 14, employeesY);
        autoTable(doc, {
            startY: employeesY + 4,
            head: [['Empleado', 'Servicios', 'Ingresos', 'Calificacion']],
            body: topEmployees.length
                ? topEmployees.map((e) => [e.name, String(e.services), e.revenueLabel, String(e.rating)])
                : [['Sin datos', '0', '$0', '-']],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [30, 30, 30] },
        });

        doc.save(`reporte_mi_pagina_${period.toLowerCase().replaceAll(' ', '_')}.pdf`);
    };

    const escapeXml = (value: string) =>
        value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&apos;');

    const rowXml = (cells: Array<string | number>) =>
        `<Row>${cells
            .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`)
            .join('')}</Row>`;

    const exportExcel = (period: string) => {
        const summaryRows = [
            rowXml(['Metrica', 'Valor']),
            rowXml(['Ventas Totales', `$${salesValue.toLocaleString('en-US')}`]),
            rowXml(['Servicios Realizados', String(servicesCount)]),
        ].join('');

        const servicesRows = [
            rowXml(['Servicio', 'Ventas', 'Ingresos']),
            ...(topServices.length
                ? topServices.map((s) => rowXml([s.name, s.count, s.revenueLabel]))
                : [rowXml(['Sin datos', 0, '$0'])]),
        ].join('');

        const employeesRows = [
            rowXml(['Empleado', 'Servicios', 'Ingresos', 'Calificacion']),
            ...(topEmployees.length
                ? topEmployees.map((e) => rowXml([e.name, e.services, e.revenueLabel, e.rating]))
                : [rowXml(['Sin datos', 0, '$0', '-'])]),
        ].join('');

        const workbookXml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Resumen"><Table>${summaryRows}</Table></Worksheet>
 <Worksheet ss:Name="Servicios"><Table>${servicesRows}</Table></Worksheet>
 <Worksheet ss:Name="Personal"><Table>${employeesRows}</Table></Worksheet>
</Workbook>`;

        const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_mi_pagina_${period.toLowerCase().replaceAll(' ', '_')}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex h-full bg-gray-50 overflow-hidden font-display">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reportes</h2>
                        <p className="text-gray-500 mt-1">Analisis detallado del rendimiento de tu negocio.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm order-2 sm:order-1">
                            <span className="text-[10px] font-bold text-gray-400 pl-3 uppercase tracking-wider">Exportar:</span>
                            <div className="flex">
                                <button onClick={() => exportPdf('Semanal')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">Semanal</button>
                                <div className="w-px bg-gray-200 my-1"></div>
                                <button onClick={() => exportPdf('Quincenal')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">Quincenal</button>
                                <div className="w-px bg-gray-200 my-1"></div>
                                <button onClick={() => exportPdf('Mensual')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">Mensual</button>
                                <div className="w-px bg-gray-200 my-1"></div>
                                <button onClick={() => exportExcel(dateRange)} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Excel</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm order-1 sm:order-2">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value as DateRange)}
                                className="bg-transparent text-sm font-bold text-gray-700 outline-none px-3 py-2 cursor-pointer"
                            >
                                <option>Hoy</option>
                                <option>Esta Semana</option>
                                <option>Este Mes</option>
                                <option>Este Año</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Ventas Totales</p>
                        <h3 className="text-3xl font-black text-gray-900">${salesValue.toLocaleString('en-US')}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Servicios Realizados</p>
                        <h3 className="text-3xl font-black text-gray-900">{servicesCount}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Estado</p>
                        <h3 className="text-3xl font-black text-gray-900">{loading ? 'Cargando...' : 'Actualizado'}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Servicios Mas Vendidos</h3>
                        </div>
                        <div className="p-6 flex-1">
                            <div className="space-y-4">
                                {topServices.map((service, index) => (
                                    <div key={`${service.name}-${index}`} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center size-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">{index + 1}</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{service.name}</h4>
                                                <p className="text-xs text-gray-500">{service.count} ventas</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">{service.revenueLabel}</span>
                                    </div>
                                ))}
                                {topServices.length === 0 && (
                                    <p className="text-sm text-gray-500">Sin datos de servicios en la base.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Rendimiento del Personal</h3>
                        </div>
                        <div className="p-6 flex-1">
                            <div className="space-y-4">
                                {topEmployees.map((emp, index) => (
                                    <div key={`${emp.name}-${index}`} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{emp.name}</h4>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px] text-yellow-400">star</span>
                                                    <span className="text-xs text-gray-500 font-bold">{emp.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">{emp.revenueLabel}</p>
                                            <p className="text-xs text-gray-500">{emp.services} servicios</p>
                                            {employeeHistory[emp.name] && (
                                                <>
                                                    <p className="text-[11px] text-gray-500 mt-1">
                                                        Total histórico: ${employeeHistory[emp.name].totalEarnings.toFixed(2)} ({employeeHistory[emp.name].totalServices} servicios)
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">
                                                        Último ingreso: {employeeHistory[emp.name].lastIncomeLabel}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">
                                                        Historial reciente: {employeeHistory[emp.name].recentIncomeLabel || 'Sin movimientos'}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {topEmployees.length === 0 && (
                                    <p className="text-sm text-gray-500">Sin datos de rendimiento en la base.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
