import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface WithdrawalItem {
    id: string;
    operationNumber: string;
    amount: number | string;
    status: WithdrawalStatus;
    accountHolder: string;
    bankName: string;
    accountType: string;
    maskedAccountNumber: string;
    createdAt: string;
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        user?: {
            email?: string;
        } | null;
    };
}

const statusLabels: Record<WithdrawalStatus, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    CANCELLED: 'Cancelado',
};

const statusStyles: Record<WithdrawalStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
    CANCELLED: 'bg-gray-100 text-gray-600',
};

export const AdminWithdrawals: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
    const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'ALL'>('PENDING');
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            setError('');
            const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
            const res = await api.get<{ data: WithdrawalItem[] }>(`/withdrawals${query}`);
            setWithdrawals(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Error loading withdrawals:', err);
            setError(err.message || 'No se pudo cargar los retiros');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [statusFilter]);

    const handleStatusUpdate = async (id: string, status: WithdrawalStatus) => {
        try {
            setUpdatingId(id);
            await api.put(`/withdrawals/${id}/status`, { status });
            await fetchWithdrawals();
        } catch (err: any) {
            console.error('Error updating withdrawal:', err);
            setError(err.message || 'No se pudo actualizar la solicitud');
        } finally {
            setUpdatingId(null);
        }
    };

    const pendingCount = useMemo(
        () => withdrawals.filter((w) => w.status === 'PENDING').length,
        [withdrawals]
    );

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Retiros</h2>
                    <p className="text-gray-500 mt-1">Solicitudes de retiro enviadas por los peluqueros.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
                        Pendientes: {pendingCount}
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as WithdrawalStatus | 'ALL')}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700"
                    >
                        <option value="PENDING">Pendientes</option>
                        <option value="APPROVED">Aprobados</option>
                        <option value="REJECTED">Rechazados</option>
                        <option value="CANCELLED">Cancelados</option>
                        <option value="ALL">Todos</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-500 shadow-sm">
                    Cargando retiros...
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Empleado</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Banco</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {withdrawals.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">
                                                {item.employee?.firstName} {item.employee?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.employee?.user?.email || 'Sin correo'}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {item.operationNumber}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            S/ {Number(item.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <p className="font-semibold">{item.bankName}</p>
                                            <p className="text-xs text-gray-500">{item.accountHolder}</p>
                                            <p className="text-xs text-gray-400">{item.accountType} • {item.maskedAccountNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${statusStyles[item.status]}`}>
                                                {statusLabels[item.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                                                        disabled={updatingId === item.id}
                                                        className="px-3 py-2 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 disabled:opacity-60"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(item.id, 'REJECTED')}
                                                        disabled={updatingId === item.id}
                                                        className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-60"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Sin acciones</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {withdrawals.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                            No hay solicitudes para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
