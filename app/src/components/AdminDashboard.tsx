import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTeam } from './AdminTeam';
import { AdminServices } from './AdminServices';
import { AdminSales } from './AdminSales';
import { AdminReports } from './AdminReports';
import { AdminHelpCenter } from './AdminHelpCenter';
import { api } from '../services/api';

interface AdminDashboardProps {
    onNavigate: (page: string) => void;
    initialView?: AdminView;
}

type AdminView = 'dashboard' | 'team' | 'services' | 'sales' | 'reports' | 'help';

interface EmployeeSummary {
    id: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
}

interface ServiceRecordSummary {
    id: string;
    serviceType?: {
        name: string;
    } | null;
}

interface CategorySummary {
    name: string;
    val: number;
}

interface DashboardSummary {
    today: {
        services: number;
        revenue: number;
        commission: number;
    };
    thisWeek: {
        services: number;
        revenue: number;
        commission: number;
    };
    thisMonth: {
        services: number;
        revenue: number;
        commission: number;
    };
    recentServices: Array<{
        id: string;
        clientName: string;
        employeeName: string;
        serviceType: string;
        price: number;
        date: string;
    }>;
}

interface WeeklyReport {
    dailyBreakdown: Array<{
        date: string;
        services: number;
        revenue: number;
        commission: number;
    }>;
}

interface WeeklyChartItem {
    label: string;
    earnings: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, initialView = 'dashboard' }) => {
    const [activeView, setActiveView] = useState<AdminView>(initialView);
    const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
    const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
    const [todayServicesCount, setTodayServicesCount] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [weeklyRevenueTotal, setWeeklyRevenueTotal] = useState(0);
    const [weeklyChart, setWeeklyChart] = useState<WeeklyChartItem[]>([]);
    const [recentSales, setRecentSales] = useState<DashboardSummary['recentServices']>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const [employeesRes, servicesRes, dashboardRes, weeklyRes] = await Promise.all([
                api.get<{ data: EmployeeSummary[] }>('/employees'),
                api.get<{ data: ServiceRecordSummary[] }>('/services'),
                api.get<{ data: DashboardSummary }>('/reports/dashboard'),
                api.get<{ data: WeeklyReport }>('/reports/weekly'),
            ]);

            const loadedEmployees = Array.isArray(employeesRes.data) ? employeesRes.data : [];
            setEmployees(loadedEmployees);

            const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];
            if (services.length > 0) {
                const grouped = new Map<string, number>();
                for (const service of services) {
                    const name = service.serviceType?.name || 'Servicio personalizado';
                    grouped.set(name, (grouped.get(name) || 0) + 1);
                }

                const total = services.length;
                const categories = Array.from(grouped.entries())
                    .map(([name, count]) => ({
                        name,
                        val: Math.max(1, Math.round((count / total) * 100)),
                    }))
                    .sort((a, b) => b.val - a.val)
                    .slice(0, 4);
                setCategoryData(categories);
            } else {
                setCategoryData([]);
            }

            const summary = dashboardRes.data;
            setTodayServicesCount(summary?.today?.services || 0);
            setTodayRevenue(summary?.today?.revenue || 0);
            const weeklyNet = (summary?.thisWeek?.revenue || 0) - (summary?.thisWeek?.commission || 0);
            setWeeklyRevenueTotal(weeklyNet);
            setRecentSales(Array.isArray(summary?.recentServices) ? summary.recentServices : []);

            const breakdown = weeklyRes.data?.dailyBreakdown || [];
            const revenueByDate = new Map<string, number>();
            for (const row of breakdown) {
                const dailyNet = (Number(row.revenue) || 0) - (Number(row.commission) || 0);
                revenueByDate.set(row.date, dailyNet);
            }

            const nextWeeklyChart: WeeklyChartItem[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
                    .format(d)
                    .replace('.', '')
                    .toUpperCase();
                nextWeeklyChart.push({
                    label,
                    earnings: revenueByDate.get(key) || 0,
                });
            }
            setWeeklyChart(nextWeeklyChart);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    useEffect(() => {
        const handleSalesUpdated = () => {
            fetchDashboardData(false);
        };

        window.addEventListener('sales:updated', handleSalesUpdated);
        return () => window.removeEventListener('sales:updated', handleSalesUpdated);
    }, [fetchDashboardData]);

    useEffect(() => {
        if (activeView === 'dashboard') {
            fetchDashboardData(false);
        }
    }, [activeView, fetchDashboardData]);

    useEffect(() => {
        setActiveView(initialView);
    }, [initialView]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        onNavigate('landing');
    };

    const activeEmployees = employees.filter((e) => e.isActive).length;
    const maxWeeklyRevenue = useMemo(
        () => Math.max(...weeklyChart.map((x) => x.earnings), 1),
        [weeklyChart]
    );

    const renderDashboardOverview = () => {
        if (loading) return <div className="p-8 text-gray-500">Cargando dashboard...</div>;

        return (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h2>
                        <p className="text-gray-500 mt-1">Resumen operativo de mi pagina.com.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveView('team')}
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-green-600">person_add</span>
                            Anadir Trabajador
                        </button>
                        <button
                            onClick={() => setActiveView('sales')}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-500/30"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Registrar Venta
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Staff Activo</p>
                        <h3 className="text-3xl font-black text-gray-900">{activeEmployees}/{employees.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Categorias DB</p>
                        <h3 className="text-3xl font-black text-gray-900">{categoryData.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Servicios Hoy</p>
                        <h3 className="text-3xl font-black text-gray-900">{todayServicesCount}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Ventas Hoy</p>
                        <h3 className="text-3xl font-black text-gray-900">${todayRevenue.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[280px]">
                        <h3 className="text-lg font-bold text-gray-900">Ingresos Semanales</h3>
                        <p className="text-gray-500 text-xs mt-1">Total semanal: ${weeklyRevenueTotal.toFixed(2)}</p>
                        <div className="h-48 mt-6 flex items-end justify-between gap-3">
                            {weeklyChart.map((item, i) => {
                                const height = Math.max(6, Math.round((item.earnings / maxWeeklyRevenue) * 100));
                                return (
                                    <div key={i} className="w-full h-full flex flex-col justify-end items-center gap-2">
                                        <div className="w-full h-full flex items-end group">
                                            <div
                                                className="w-full bg-green-500/30 hover:bg-green-500 rounded-t-xl transition-all relative"
                                                style={{ height: `${height}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    ${item.earnings.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Reportes Simples</h3>
                        <p className="text-gray-500 text-xs mb-6">Categorias mas vendidas</p>

                        <div className="space-y-6">
                            {categoryData.map((cat, i) => (
                                <div key={`${cat.name}-${i}`}>
                                    <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                        <span>{cat.name}</span>
                                        <span className="text-gray-400">{cat.val}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${cat.val}%`, opacity: Math.max(0.35, 0.85 - i * 0.12) }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {categoryData.length === 0 && (
                                <p className="text-sm text-gray-500">Sin datos de servicios en la base.</p>
                            )}
                        </div>

                        <button
                            onClick={() => setActiveView('reports')}
                            className="w-full mt-8 flex items-center justify-center gap-2 text-green-600 font-bold text-sm hover:underline"
                        >
                            Ver reporte detallado
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Ultimas Ventas</h3>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Cliente, servicio y quien atendio
                        </span>
                    </div>

                    <div className="space-y-4">
                        {recentSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50/60"
                            >
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{sale.clientName}</p>
                                    <p className="text-xs text-gray-600">
                                        {sale.serviceType} • Atendio: {sale.employeeName}
                                    </p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-sm font-black text-gray-900">${Number(sale.price || 0).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(sale.date).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {recentSales.length === 0 && (
                            <p className="text-sm text-gray-500">Aun no hay ventas recientes para mostrar.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (activeView === 'team') return <AdminTeam />;
        if (activeView === 'services') return <AdminServices />;
        if (activeView === 'sales') return <AdminSales />;
        if (activeView === 'reports') return <AdminReports />;
        if (activeView === 'help') return <AdminHelpCenter />;
        return renderDashboardOverview();
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light text-gray-800 font-display">
            <aside className="w-64 flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-300 shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-white font-bold text-2xl">content_cut</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">mi pagina.com</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">admin</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'dashboard' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">dashboard</span><span className="text-sm">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveView('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'team' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">badge</span><span className="text-sm font-medium">Equipo</span>
                    </button>
                    <button onClick={() => setActiveView('services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'services' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">spa</span><span className="text-sm font-medium">Servicios</span>
                    </button>
                    <button onClick={() => setActiveView('sales')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'sales' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">shopping_cart</span><span className="text-sm font-medium">Ventas</span>
                    </button>
                    <button onClick={() => setActiveView('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'reports' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">bar_chart</span><span className="text-sm font-medium">Reportes</span>
                    </button>
                    <button onClick={() => setActiveView('help')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'help' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">help</span><span className="text-sm font-medium">Centro de Ayuda</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-2 bg-gray-50 rounded-lg text-gray-900 text-sm font-bold transition-all hover:bg-gray-200"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Cerrar Sesion
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-background-light">
                {renderContent()}
            </main>
        </div>
    );
};
