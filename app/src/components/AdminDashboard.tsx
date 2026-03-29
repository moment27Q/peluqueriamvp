import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTeam } from './AdminTeam';
import { AdminServices } from './AdminServices';
import { AdminSales } from './AdminSales';
import { AdminReports } from './AdminReports';
import { AdminWithdrawals } from './AdminWithdrawals';
import { AdminHelpCenter } from './AdminHelpCenter';
import { AdminPlansOnboarding } from './AdminPlansOnboarding';
import { api } from '../services/api';

interface AdminDashboardProps {
    onNavigate: (page: string) => void;
    initialView?: AdminView;
}

type AdminView = 'dashboard' | 'team' | 'services' | 'sales' | 'reports' | 'withdrawals' | 'help' | 'plans';

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
    count: number;
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
    const INITIAL_RECENT_SALES_LIMIT = 5;
    const [activeView, setActiveView] = useState<AdminView>(initialView);
    const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
    const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
    const [todayServicesCount, setTodayServicesCount] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [weeklyRevenueTotal, setWeeklyRevenueTotal] = useState(0);
    const [weeklyChart, setWeeklyChart] = useState<WeeklyChartItem[]>([]);
    const [recentSales, setRecentSales] = useState<DashboardSummary['recentServices']>([]);
    const [showAllRecentSales, setShowAllRecentSales] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tenantName, setTenantName] = useState('');
    const [tenantPlan, setTenantPlan] = useState('');
    const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
    const [trialUsed, setTrialUsed] = useState(false);
    const [planActionError, setPlanActionError] = useState('');
    const [planActionLoading, setPlanActionLoading] = useState(false);
    const [showTrialFeedback, setShowTrialFeedback] = useState(false);
    const [feedbackChecked, setFeedbackChecked] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackSurveyAnswer, setFeedbackSurveyAnswer] = useState('');
    const [feedbackImprovements, setFeedbackImprovements] = useState('');

    useEffect(() => {
        const loadTenantInfo = async () => {
            try {
                const res: any = await api.get('/auth/me');
                const tenant = res?.data?.tenant;
                setTenantName(tenant?.name || '');
                setTenantPlan(tenant?.subscriptionPlan?.name || '');
                setTrialEndsAt(tenant?.trialEndsAt || null);
                setTrialUsed(!!tenant?.trialUsed);
            } catch {
                setTenantName('');
                setTenantPlan('');
                setTrialEndsAt(null);
                setTrialUsed(false);
            }
        };
        loadTenantInfo();
    }, []);

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
                        count,
                        val: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
                    }))
                    .sort((a, b) => b.count - a.count || b.val - a.val)
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
        const intervalId = window.setInterval(() => {
            fetchDashboardData(false);
        }, 15000);

        const handleFocus = () => fetchDashboardData(false);
        window.addEventListener('visibilitychange', handleFocus);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('visibilitychange', handleFocus);
            window.removeEventListener('focus', handleFocus);
        };
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
    const visibleRecentSales = useMemo(
        () => (showAllRecentSales ? recentSales : recentSales.slice(0, INITIAL_RECENT_SALES_LIMIT)),
        [INITIAL_RECENT_SALES_LIMIT, recentSales, showAllRecentSales]
    );

    const renderDashboardOverview = () => {
        if (loading) return <div className="p-8 text-gray-500">Cargando dashboard...</div>;

        return (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h2>
                        <p className="text-gray-500 mt-1">Resumen operativo de mi pagina.com.</p>
                        {tenantName && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                    {tenantName}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700">
                                    Plan: {planDisplay}
                                </span>
                                {trialActive && trialEndsAtMs && (
                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                                        Prueba activa hasta {new Date(trialEndsAtMs).toLocaleDateString('es-ES')}
                                    </span>
                                )}
                            </div>
                        )}
                        {planActionError && (
                            <p className="mt-3 text-xs font-bold text-red-600">{planActionError}</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveView('plans')}
                            className="bg-white border border-green-200 text-green-700 hover:bg-green-50 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-green-600">sell</span>
                            {tenantPlan ? 'Cambiar Plan' : 'Ver Planes'}
                        </button>
                        {tenantPlan && (
                            <button
                                onClick={async () => {
                                    if (!confirm('¿Seguro que deseas eliminar tu plan actual?')) return;
                                    try {
                                        setPlanActionError('');
                                        setPlanActionLoading(true);
                                        const res: any = await api.patch('/auth/plan', { planId: null });
                                        const nextPlan = res?.data?.subscriptionPlan?.name || '';
                                        setTenantPlan(nextPlan);
                                    } catch (err: any) {
                                        setPlanActionError(err.message || 'No se pudo eliminar el plan.');
                                    } finally {
                                        setPlanActionLoading(false);
                                    }
                                }}
                                disabled={planActionLoading}
                                className={`bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm ${planActionLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <span className="material-symbols-outlined text-red-500">cancel</span>
                                Eliminar Plan
                            </button>
                        )}
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
                        <h3 className="text-3xl font-black text-gray-900">S/ {todayRevenue.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[280px]">
                        <h3 className="text-lg font-bold text-gray-900">Ingresos Semanales</h3>
                        <p className="text-gray-500 text-xs mt-1">Total semanal: S/ {weeklyRevenueTotal.toFixed(2)}</p>
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
                                                    S/ {item.earnings.toFixed(2)}
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
                                        <span className="text-gray-400">{cat.val.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${Math.min(cat.val, 100)}%`, opacity: Math.max(0.35, 0.85 - i * 0.12) }}
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
                        {visibleRecentSales.map((sale) => (
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
                                    <p className="text-sm font-black text-gray-900">S/ {Number(sale.price || 0).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(sale.date).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {recentSales.length === 0 && (
                            <p className="text-sm text-gray-500">Aun no hay ventas recientes para mostrar.</p>
                        )}

                        {recentSales.length > INITIAL_RECENT_SALES_LIMIT && (
                            <button
                                type="button"
                                onClick={() => setShowAllRecentSales((prev) => !prev)}
                                className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                {showAllRecentSales ? 'Ver menos' : 'Ver mas'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const hasPlan = !!tenantPlan?.trim();
    const trialEndsAtMs = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
    const trialActive = trialEndsAtMs ? trialEndsAtMs > Date.now() : false;
    const hasAccess = hasPlan || trialActive;
    const planDisplay = tenantPlan || (trialActive ? 'GRATUITO' : 'SIN PLAN');
    const trialExpired = !!trialEndsAtMs && trialEndsAtMs <= Date.now() && !hasPlan;
    const showPlanGate =
        !hasAccess &&
        activeView !== 'dashboard' &&
        activeView !== 'plans';

    useEffect(() => {
        const loadFeedbackStatus = async () => {
            if (!trialExpired || feedbackChecked) return;
            setFeedbackLoading(true);
            setFeedbackError('');
            try {
                const res: any = await api.get('/feedback/trial');
                const submitted = !!(res?.submitted ?? res?.data?.submitted);
                setFeedbackSubmitted(submitted);
                setShowTrialFeedback(!submitted);
            } catch (err: any) {
                setFeedbackError(err.message || 'No se pudo cargar la encuesta.');
            } finally {
                setFeedbackLoading(false);
                setFeedbackChecked(true);
            }
        };
        loadFeedbackStatus();
    }, [feedbackChecked, trialExpired]);

    const handleSubmitTrialFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackError('');
        setFeedbackLoading(true);
        try {
            await api.post('/feedback/trial', {
                rating: feedbackRating,
                surveyAnswer: feedbackSurveyAnswer.trim(),
                improvements: feedbackImprovements.trim(),
            });
            setFeedbackSubmitted(true);
            setShowTrialFeedback(false);
        } catch (err: any) {
            setFeedbackError(err.message || 'No se pudo enviar la encuesta.');
        } finally {
            setFeedbackLoading(false);
        }
    };

    const renderContent = () => {
        if (showPlanGate) {
            return (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-2xl">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                            <h3 className="text-lg font-black text-amber-800">Contrata un plan para usar este módulo</h3>
                            <p className="text-sm text-amber-700 mt-2">
                                Elige un plan y activa tu cuenta para desbloquear todas las funciones del dashboard.
                            </p>
                            <button
                                onClick={() => setActiveView('plans')}
                                className="mt-4 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-all"
                            >
                                Ver planes
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        if (activeView === 'team') return <AdminTeam />;
        if (activeView === 'services') return <AdminServices />;
        if (activeView === 'sales') return <AdminSales />;
        if (activeView === 'reports') return <AdminReports />;
        if (activeView === 'withdrawals') return <AdminWithdrawals />;
        if (activeView === 'help') return <AdminHelpCenter />;
        if (activeView === 'plans') return (
            <AdminPlansOnboarding
                tenantName={tenantName}
                tenantPlan={planDisplay}
                trialEndsAt={trialEndsAt}
                trialUsed={trialUsed}
                onTrialActivated={({ trialEndsAt: nextEndsAt, trialUsed: nextUsed }) => {
                    if (nextEndsAt !== undefined) setTrialEndsAt(nextEndsAt || null);
                    if (nextUsed !== undefined) setTrialUsed(!!nextUsed);
                }}
            />
        );
        return renderDashboardOverview();
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light text-gray-800 font-display">
            <aside className="w-64 flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-300 shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <img
                        src="/images/logo-izichamba.png"
                        alt="Izichamba"
                        className="h-10 w-auto"
                    />
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">admin</p>
                        {tenantName && (
                            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                                Plan: {planDisplay}
                            </p>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'dashboard' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">dashboard</span><span className="text-sm">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveView('plans')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'plans' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">sell</span><span className="text-sm font-medium">Planes</span>
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
                    <button onClick={() => setActiveView('withdrawals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'withdrawals' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">paid</span><span className="text-sm font-medium">Retiros</span>
                    </button>
                    <button onClick={() => setActiveView('help')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'help' ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        <span className="material-symbols-outlined">help</span><span className="text-sm font-medium">Centro de Ayuda</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm font-bold transition-all hover:bg-gray-200"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Cerrar Sesion
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-background-light overflow-y-auto">
                {renderContent()}
            </main>

            {showTrialFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Tu prueba gratuita terminó</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Ayúdanos con una breve encuesta para mejorar la plataforma.
                        </p>

                        {feedbackError && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-600">
                                {feedbackError}
                            </div>
                        )}

                        <form onSubmit={handleSubmitTrialFeedback} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué tan satisfecho estás? (1-5)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFeedbackRating(value)}
                                            className={`size-10 rounded-full text-sm font-bold border transition-all ${feedbackRating === value
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué fue lo que más te gustó?</label>
                                <textarea
                                    value={feedbackSurveyAnswer}
                                    onChange={(e) => setFeedbackSurveyAnswer(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    placeholder="Cuéntanos lo mejor de tu experiencia"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué mejorarías?</label>
                                <textarea
                                    value={feedbackImprovements}
                                    onChange={(e) => setFeedbackImprovements(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    placeholder="Sugerencias o comentarios para mejorar"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <button
                                    type="submit"
                                    disabled={feedbackLoading}
                                    className="px-6 py-2.5 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-60"
                                >
                                    {feedbackLoading ? 'Enviando...' : 'Enviar encuesta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
