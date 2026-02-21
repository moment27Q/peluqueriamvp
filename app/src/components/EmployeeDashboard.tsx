import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface EmployeeDashboardProps {
    onNavigate: (page: string) => void;
}

type EmployeeSection = 'dashboard' | 'withdraw' | 'history' | 'reports';
type ReportPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface EmployeeProfile {
    id: string;
    firstName: string;
    lastName: string;
    user: {
        email: string;
    };
}

interface MyServiceItem {
    id: string;
    date: string;
    clientName: string;
    serviceName: string;
    price: number;
    commissionAmount: number;
}

interface MyReport {
    summary: {
        totalServices: number;
        totalRevenue: number;
        totalCommission: number;
        totalSalonEarnings: number;
    };
    services: MyServiceItem[];
}

interface MyEarnings {
    totalCommission: number;
    totalWithdrawn?: number;
    availableBalance?: number;
}

interface DailyIncomePoint {
    key: string;
    day: string;
    fullDate: string;
    income: number;
}

interface WithdrawalBankAccount {
    accountHolder: string;
    bankName: string;
    accountType: 'checking' | 'savings';
    accountNumber: string;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
    const [activeSection, setActiveSection] = useState<EmployeeSection>('dashboard');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [serviceHistory, setServiceHistory] = useState<MyServiceItem[]>([]);
    const [dailyReport, setDailyReport] = useState<MyReport | null>(null);
    const [weeklyReport, setWeeklyReport] = useState<MyReport | null>(null);
    const [monthlyEarnings, setMonthlyEarnings] = useState<MyEarnings | null>(null);

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMessage, setWithdrawMessage] = useState('');
    const [withdrawBankAccount, setWithdrawBankAccount] = useState<WithdrawalBankAccount>({
        accountHolder: '',
        bankName: '',
        accountType: 'checking',
        accountNumber: '',
    });
    const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('weekly');
    const [reportMessage, setReportMessage] = useState('');
    const [generatedReport, setGeneratedReport] = useState<MyReport | null>(null);

    const email = profile?.user?.email || 'peluquero@mi-pagina.com';

    const totalHistoryAmount = useMemo(
        () => serviceHistory.reduce((acc, item) => acc + Number(item.price || 0), 0),
        [serviceHistory]
    );

    const dailyIncomeData = useMemo<DailyIncomePoint[]>(() => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);

        const base: DailyIncomePoint[] = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);
            const key = date.toISOString().split('T')[0];

            return {
                key,
                day: date.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', ''),
                fullDate: date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
                income: 0,
            };
        });

        const dataByKey = base.reduce<Record<string, DailyIncomePoint>>((acc, item) => {
            acc[item.key] = { ...item };
            return acc;
        }, {});

        const services = weeklyReport?.services || [];
        for (const service of services) {
            const serviceDate = new Date(service.date);
            const key = serviceDate.toISOString().split('T')[0];

            if (dataByKey[key]) {
                dataByKey[key].income += Number(service.price || 0);
            }
        }

        return base.map((item) => dataByKey[item.key]);
    }, [weeklyReport]);

    const totalWeekIncome = useMemo(
        () => dailyIncomeData.reduce((acc, item) => acc + item.income, 0),
        [dailyIncomeData]
    );

    const fetchEmployeeData = async () => {
        try {
            setLoading(true);
            setLoadError('');

            const [profileRes, historyRes, dailyRes, weeklyRes, earningsRes] = await Promise.all([
                api.get<{ data: EmployeeProfile }>('/employees/me/profile'),
                api.get<{ data: MyServiceItem[] }>('/employees/me/services'),
                api.get<{ data: MyReport }>('/employees/me/report?period=daily'),
                api.get<{ data: MyReport }>('/employees/me/report?period=weekly'),
                api.get<{ data: MyEarnings }>('/employees/me/earnings?period=monthly'),
            ]);

            setProfile(profileRes.data || null);
            setServiceHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
            setDailyReport(dailyRes.data || null);
            setWeeklyReport(weeklyRes.data || null);
            setMonthlyEarnings(earningsRes.data || null);
        } catch (err: any) {
            setLoadError(err.message || 'No se pudo cargar el panel de peluquero');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    useEffect(() => {
        const key = `employee-bank-account:${email}`;
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as Partial<WithdrawalBankAccount>;
            if (!parsed) return;
            setWithdrawBankAccount({
                accountHolder: parsed.accountHolder || '',
                bankName: parsed.bankName || '',
                accountType: parsed.accountType === 'savings' ? 'savings' : 'checking',
                accountNumber: parsed.accountNumber || '',
            });
        } catch {
            // Ignore invalid local storage payloads.
        }
    }, [email]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        onNavigate('landing');
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setWithdrawMessage('');

        const amount = Number(withdrawAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            setWithdrawMessage('Ingresa un monto valido para retirar.');
            return;
        }

        if (!withdrawBankAccount.accountHolder.trim() || !withdrawBankAccount.bankName.trim() || !withdrawBankAccount.accountNumber.trim()) {
            setWithdrawMessage('Completa los datos de tu cuenta bancaria para retirar.');
            return;
        }

        try {
            const response = await api.post<{ data: { message: string; status: string; operationNumber?: string; availableBalance?: number } }>('/employees/me/withdraw', {
                amount,
                bankAccount: {
                    accountHolder: withdrawBankAccount.accountHolder.trim(),
                    bankName: withdrawBankAccount.bankName.trim(),
                    accountType: withdrawBankAccount.accountType,
                    accountNumber: withdrawBankAccount.accountNumber.trim(),
                },
            });
            localStorage.setItem(`employee-bank-account:${email}`, JSON.stringify(withdrawBankAccount));
            const operationNumber = response?.data?.operationNumber;
            setWithdrawMessage(
                operationNumber
                    ? `${response?.data?.message || 'Solicitud enviada.'} Operacion: ${operationNumber}`
                    : (response?.data?.message || 'Solicitud enviada.')
            );
            if (typeof response?.data?.availableBalance === 'number') {
                setMonthlyEarnings((prev) => ({
                    totalCommission: Number(prev?.totalCommission || 0),
                    totalWithdrawn: Number(prev?.totalWithdrawn || 0) + amount,
                    availableBalance: response.data.availableBalance,
                }));
            }
            setWithdrawAmount('');
        } catch (err: any) {
            setWithdrawMessage(err.message || 'No se pudo solicitar el retiro.');
        }
    };

    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setReportMessage('');

        try {
            const response = await api.get<{ data: MyReport }>(`/employees/me/report?period=${reportPeriod}`);
            const report = response.data;
            setGeneratedReport(report);

            const labels: Record<ReportPeriod, string> = {
                daily: 'diario',
                weekly: 'semanal',
                biweekly: 'quincenal',
                monthly: 'mensual',
            };

            setReportMessage(`Reporte ${labels[reportPeriod]} generado con ${report?.summary?.totalServices || 0} servicios.`);
        } catch (err: any) {
            setReportMessage(err.message || 'No se pudo generar el reporte.');
        }
    };

    const renderSectionContent = () => {
        if (activeSection === 'withdraw') {
            return (
                <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                    <h2 className="text-2xl font-bold tracking-tight">Retirar Dinero</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Solo puedes retirar saldo disponible de tu propia cuenta.
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-700">
                        Saldo disponible: S/ {Number((monthlyEarnings?.availableBalance ?? monthlyEarnings?.totalCommission) || 0).toFixed(2)}
                    </p>
                    <form onSubmit={handleWithdraw} className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Titular</label>
                                <input
                                    type="text"
                                    value={withdrawBankAccount.accountHolder}
                                    onChange={(e) => setWithdrawBankAccount((prev) => ({ ...prev, accountHolder: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Banco</label>
                                <input
                                    type="text"
                                    value={withdrawBankAccount.bankName}
                                    onChange={(e) => setWithdrawBankAccount((prev) => ({ ...prev, bankName: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
                                    placeholder="Nombre del banco"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Tipo de cuenta</label>
                                <select
                                    value={withdrawBankAccount.accountType}
                                    onChange={(e) => setWithdrawBankAccount((prev) => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
                                >
                                    <option value="checking">Corriente</option>
                                    <option value="savings">Ahorros</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Numero de cuenta</label>
                                <input
                                    type="text"
                                    value={withdrawBankAccount.accountNumber}
                                    onChange={(e) => setWithdrawBankAccount((prev) => ({ ...prev, accountNumber: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
                                    placeholder="000123456789"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
                            placeholder="Monto a retirar"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-[#63c933] px-6 py-3 text-sm font-bold text-gray-900 hover:bg-[#56b52b]"
                        >
                            Solicitar Retiro
                        </button>
                        </div>
                    </form>
                    {withdrawMessage && (
                        <p className="mt-3 rounded-lg bg-[#edf5ea] px-4 py-2 text-sm font-semibold text-[#356d1c]">
                            {withdrawMessage}
                        </p>
                    )}
                </section>
            );
        }

        if (activeSection === 'history') {
            return (
                <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-bold tracking-tight">Historial de Servicios</h2>
                        <span className="text-sm font-semibold text-gray-500">Total generado: S/ {totalHistoryAmount.toFixed(2)}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Fecha</th>
                                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Cliente</th>
                                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Servicio</th>
                                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceHistory.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50">
                                        <td className="px-3 py-3 text-sm text-gray-700">{new Date(item.date).toLocaleDateString('es-ES')}</td>
                                        <td className="px-3 py-3 text-sm font-semibold text-gray-900">{item.clientName}</td>
                                        <td className="px-3 py-3 text-sm text-gray-700">{item.serviceName}</td>
                                        <td className="px-3 py-3 text-sm font-bold text-gray-900">S/ {Number(item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {serviceHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">
                                            No tienes servicios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            );
        }

        if (activeSection === 'reports') {
            return (
                <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                    <h2 className="text-2xl font-bold tracking-tight">Generar Reportes</h2>
                    <p className="mt-2 text-sm text-gray-500">Los reportes se generan solo con tus servicios.</p>
                    <form onSubmit={handleGenerateReport} className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <select
                            value={reportPeriod}
                            onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
                        >
                            <option value="weekly">Semanal</option>
                            <option value="biweekly">Quincenal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                        <button
                            type="submit"
                            className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
                        >
                            Generar
                        </button>
                    </form>
                    {reportMessage && (
                        <p className="mt-3 rounded-lg bg-[#edf5ea] px-4 py-2 text-sm font-semibold text-[#356d1c]">
                            {reportMessage}
                        </p>
                    )}

                    {generatedReport && (
                        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                            <p className="font-semibold text-gray-900">Servicios: {generatedReport.summary.totalServices}</p>
                            <p className="text-gray-700">Ingresos: S/ {Number(generatedReport.summary.totalRevenue).toFixed(2)}</p>
                            <p className="text-gray-700">Comision: S/ {Number(generatedReport.summary.totalCommission).toFixed(2)}</p>
                            <p className="text-gray-700">Ganancia salon: S/ {Number(generatedReport.summary.totalSalonEarnings).toFixed(2)}</p>
                        </div>
                    )}
                </section>
            );
        }

        return (
            <>
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Citas Hoy</p>
                        <p className="mt-2 text-4xl font-black text-[#62c533]">{dailyReport?.summary?.totalServices || 0}</p>
                        <p className="mt-2 text-sm text-gray-500">Tus servicios del dia actual.</p>
                    </article>
                    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicios Semana</p>
                        <p className="mt-2 text-4xl font-black text-[#62c533]">{weeklyReport?.summary?.totalServices || 0}</p>
                        <p className="mt-2 text-sm text-gray-500">Seguimiento de tus servicios atendidos.</p>
                    </article>
                    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Comision Estimada</p>
                        <p className="mt-2 text-4xl font-black text-[#62c533]">S/ {Number(monthlyEarnings?.totalCommission || 0).toFixed(2)}</p>
                        <p className="mt-2 text-sm text-gray-500">Comision calculada de tu propia cuenta.</p>
                    </article>
                </div>

                <section className="mb-8 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Ingresos por Dia</h2>
                            <p className="mt-1 text-sm text-gray-500">Resumen de tus ultimos 7 dias trabajados.</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            Total semana: <span className="text-[#356d1c]">S/ {totalWeekIncome.toFixed(2)}</span>
                        </p>
                    </div>

                    <div className="mt-6 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyIncomeData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#edf2eb" />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={55}
                                    tickFormatter={(value: number) => `S/${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f8f1' }}
                                    formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Ingresos']}
                                    labelFormatter={(_, payload) => {
                                        const point = payload?.[0]?.payload as DailyIncomePoint | undefined;
                                        return point ? `${point.day} ${point.fullDate}` : '';
                                    }}
                                />
                                <Bar dataKey="income" name="Ingresos" fill="#63c933" radius={[8, 8, 0, 0]} maxBarSize={44} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <h2 className="text-2xl font-bold tracking-tight">Acciones Rapidas</h2>
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={() => setActiveSection('withdraw')}
                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
                            >
                                <span className="font-semibold">Retirar dinero</span>
                                <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('history')}
                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
                            >
                                <span className="font-semibold">Historial de servicios</span>
                                <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('reports')}
                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
                            >
                                <span className="font-semibold">Generar reportes</span>
                                <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <h2 className="text-2xl font-bold tracking-tight">Estado de Cuenta</h2>
                        <p className="mt-3 text-sm text-gray-500">
                            Esta vista esta separada del panel administrativo. Solo muestra informacion de tu perfil logueado.
                        </p>
                        <div className="mt-6 rounded-2xl bg-[#edf5ea] p-5">
                            <p className="text-sm font-semibold text-gray-700">Rol activo: PELUQUERO</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Usuario actual: {email}
                            </p>
                        </div>
                    </section>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f6f3] text-gray-900">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-[#dcead6] bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#63c933]">Panel Peluquero</p>
                        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Tu Dashboard de Trabajo</h1>
                        <p className="mt-2 text-sm text-gray-500">{email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {activeSection !== 'dashboard' && (
                            <button
                                onClick={() => setActiveSection('dashboard')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Volver
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-black"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Cerrar Sesion
                        </button>
                    </div>
                </div>

                {loadError && (
                    <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {loadError}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-500 shadow-sm">Cargando panel...</div>
                ) : (
                    renderSectionContent()
                )}
            </div>
        </div>
    );
};

