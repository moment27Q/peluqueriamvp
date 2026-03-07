import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlansManager } from './PlansManager';

interface SuperAdminDashboardProps {
    onNavigate: (page: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
    const [shopName, setShopName] = useState('');
    const [plan, setPlan] = useState<string>('');
    const [availablePlans, setAvailablePlans] = useState<{ id: string; name: string }[]>([]);
    const [ownerFirstName, setOwnerFirstName] = useState('');
    const [ownerLastName, setOwnerLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'shops' | 'plans' | 'directory'>('shops');
    const [tenants, setTenants] = useState<any[]>([]);
    const [tenantsLoading, setTenantsLoading] = useState(false);
    const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
    const [editSection, setEditSection] = useState<'plan' | 'admin' | null>(null);
    const [editPlanId, setEditPlanId] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [newAdminForm, setNewAdminForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        onNavigate('landing');
    };

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const res: any = await api.get('/plans');
                if (res.success && res.data.length > 0) {
                    setAvailablePlans(res.data);
                    setPlan(res.data[0].name);
                }
            } catch (e) {
                // silently fail
            }
        };
        loadPlans();

        const loadTenants = async () => {
            setTenantsLoading(true);
            try {
                const res: any = await api.get('/admin/tenants');
                if (res.success) setTenants(res.data);
            } catch (e) { /* ignore */ }
            finally { setTenantsLoading(false); }
        };
        loadTenants();
    }, []);

    const handleCreateShop = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            await api.post('/auth/register', {
                shopName,
                plan,
                firstName: ownerFirstName,
                lastName: ownerLastName,
                email,
                password,
            });

            setSuccessMsg(`¡Peluquería "${shopName}" creada exitosamente! El dueño ya puede iniciar sesión.`);
            setShopName('');
            setPlan(availablePlans[0]?.name || '');
            setOwnerFirstName('');
            setOwnerLastName('');
            setEmail('');
            setPassword('');
            // Refresh tenant directory
            try {
                const res: any = await api.get('/admin/tenants');
                if (res.success) setTenants(res.data);
            } catch (e) { /* ignore */ }
        } catch (error: any) {
            setErrorMsg(error.message || 'Error al crear la peluquería.');
        } finally {
            setLoading(false);
        }
    };

    const refreshTenants = async () => {
        try {
            const res: any = await api.get('/admin/tenants');
            if (res.success) setTenants(res.data);
        } catch (e) { /* ignore */ }
    };

    const handleChangePlan = async (tenantId: string) => {
        if (!editPlanId) return;
        setEditSaving(true); setEditError(''); setEditSuccess('');
        try {
            await api.patch(`/admin/tenants/${tenantId}/plan`, { planId: editPlanId });
            setEditSuccess('Plan actualizado exitosamente.');
            await refreshTenants();
            setTimeout(() => { setEditingTenantId(null); setEditSection(null); setEditSuccess(''); }, 1500);
        } catch (err: any) {
            setEditError(err.message || 'Error al cambiar el plan.');
        } finally { setEditSaving(false); }
    };

    const handleAddAdmin = async (e: React.FormEvent, tenantId: string) => {
        e.preventDefault();
        setEditSaving(true); setEditError(''); setEditSuccess('');
        try {
            await api.post(`/admin/tenants/${tenantId}/admins`, newAdminForm);
            setEditSuccess('Administrador añadido exitosamente.');
            setNewAdminForm({ firstName: '', lastName: '', email: '', password: '' });
            await refreshTenants();
            setTimeout(() => { setEditingTenantId(null); setEditSection(null); setEditSuccess(''); }, 1500);
        } catch (err: any) {
            setEditError(err.message || 'Error al añadir el administrador.');
        } finally { setEditSaving(false); }
    };

    const handleToggle = async (tenantId: string, isActive: boolean) => {
        setEditSaving(true); setEditError(''); setEditSuccess('');
        try {
            await api.patch(`/admin/tenants/${tenantId}/toggle`, {});
            setEditSuccess(isActive ? 'Peluquería inhabilitada.' : 'Peluquería habilitada.');
            await refreshTenants();
            setTimeout(() => { setEditingTenantId(null); setEditSection(null); setEditSuccess(''); }, 1500);
        } catch (err: any) {
            setEditError(err.message || 'Error al cambiar el estado.');
        } finally { setEditSaving(false); }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light text-gray-800 font-display">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-white border-r border-gray-200 h-full transition-all shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-900/30">
                        <span className="material-symbols-outlined font-bold text-2xl">shield_person</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">mi pagina.com</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold">superadmin</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('shops')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'shops'
                            ? 'bg-gray-100 text-gray-900 border-l-[3px] border-gray-900'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined">storefront</span>
                        <span className="text-sm">Peluquerías</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'plans'
                            ? 'bg-gray-100 text-gray-900 border-l-[3px] border-gray-900'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined">sell</span>
                        <span className="text-sm">Planes</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'directory'
                            ? 'bg-gray-100 text-gray-900 border-l-[3px] border-gray-900'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined">list_alt</span>
                        <span className="text-sm">Directorio</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-2 bg-gray-50 rounded-lg text-gray-900 text-sm font-bold transition-all hover:bg-gray-200"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'shops' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Peluquerías</h2>
                            <p className="text-gray-500 mt-1">Crea nuevos comercios (Tenants) y asigna a sus dueños.</p>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Registrar Nueva Peluquería</h3>

                            {successMsg && (
                                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    <p className="text-sm font-medium">{successMsg}</p>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-600">error</span>
                                    <p className="text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}

                            <form onSubmit={handleCreateShop} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Datos de la Peluquería */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Datos del Local</h4>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Peluquería (Marca)</label>
                                            <input
                                                type="text"
                                                required
                                                value={shopName}
                                                onChange={(e) => setShopName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                placeholder="Ej. Barbería El Rey"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Plan de Suscripción</label>
                                            <div className="relative">
                                                <select
                                                    value={plan}
                                                    onChange={(e) => setPlan(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                                                >
                                                    {availablePlans.length === 0 ? (
                                                        <option value="">Cargando planes...</option>
                                                    ) : (
                                                        availablePlans.map((p) => (
                                                            <option key={p.id} value={p.name}>{p.name.toUpperCase()}</option>
                                                        ))
                                                    )}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Datos del Dueño */}
                                    <div className="space-y-4 md:col-span-2 mt-4">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Datos del Dueño (Administrador)</h4>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Dueño</label>
                                        <input
                                            type="text"
                                            required
                                            value={ownerFirstName}
                                            onChange={(e) => setOwnerFirstName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="Ej. Juan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Apellido del Dueño</label>
                                        <input
                                            type="text"
                                            required
                                            value={ownerLastName}
                                            onChange={(e) => setOwnerLastName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="Ej. Pérez"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="admin@barberia.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="••••••••"
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Creando Peluquería...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">add_business</span>
                                            <span>Crear Peluquería y Dueño</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : activeTab === 'plans' ? (
                    <PlansManager />
                ) : (
                    /* Directorio de Peluquerías */
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Directorio de Peluquerías</h2>
                                <p className="text-gray-500 mt-1">Todas las peluquerías registradas con su dueño y equipo.</p>
                            </div>
                            <span className="bg-gray-100 text-gray-700 font-bold text-sm px-4 py-2 rounded-full">{tenants.length} registradas</span>
                        </div>

                        {tenantsLoading ? (
                            <div className="text-center py-20 text-gray-400 font-medium">Cargando...</div>
                        ) : tenants.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 font-medium">No hay peluquerías registradas aún.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {tenants.map((tenant: any) => {
                                    const owner = tenant.users?.[0];
                                    const ownerName = owner?.employee
                                        ? `${owner.employee.firstName} ${owner.employee.lastName}`
                                        : owner?.email || 'Sin dueño';
                                    const isEditing = editingTenantId === tenant.id;

                                    return (
                                        <div key={tenant.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            {/* Card Header */}
                                            <div className="p-6 flex flex-col gap-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow">
                                                            <span className="material-symbols-outlined">storefront</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-extrabold text-gray-900">{tenant.name}</h3>
                                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                                {tenant.subscriptionPlan?.name?.toUpperCase() || 'SIN PLAN'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${tenant.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                            {tenant.isActive ? '● Activa' : '○ Inactiva'}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if (isEditing) {
                                                                    setEditingTenantId(null);
                                                                    setEditSection(null);
                                                                    setEditError('');
                                                                    setEditSuccess('');
                                                                } else {
                                                                    setEditingTenantId(tenant.id);
                                                                    setEditSection(null);
                                                                    setEditPlanId(tenant.subscriptionPlan?.id || '');
                                                                    setEditError('');
                                                                    setEditSuccess('');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isEditing
                                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                : 'bg-gray-900 text-white hover:bg-black'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
                                                            {isEditing ? 'Cerrar' : 'Editar'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dueño / Administrador</p>
                                                        {tenant.users?.map((u: any) => {
                                                            const adminName = u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : u.email;
                                                            return (
                                                                <div key={u.id} className="flex items-center gap-2 mb-1">
                                                                    <span className="material-symbols-outlined text-gray-400 text-lg">manage_accounts</span>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-800 text-sm">{adminName}</p>
                                                                        <p className="text-xs text-gray-400">{u.email}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {(!tenant.users || tenant.users.length === 0) && (
                                                            <p className="text-xs text-gray-400 italic">Sin administrador</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trabajadores ({tenant.employees?.length || 0})</p>
                                                        {tenant.employees?.length === 0 ? (
                                                            <p className="text-xs text-gray-400 italic">Sin trabajadores registrados</p>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2">
                                                                {tenant.employees.map((emp: any) => (
                                                                    <span key={emp.id} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${emp.isActive ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-gray-50 text-gray-400 border-gray-100 line-through'}`}>
                                                                        {emp.firstName} {emp.lastName}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Panel */}
                                            {isEditing && (
                                                <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
                                                    {/* Tab switcher */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { setEditSection('plan'); setEditError(''); setEditSuccess(''); }}
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${editSection === 'plan'
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">sell</span>
                                                            Cambiar Plan
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditSection('admin'); setEditError(''); setEditSuccess(''); }}
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${editSection === 'admin'
                                                                ? 'bg-gray-900 text-white'
                                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                                            Añadir Administrador
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(tenant.id, tenant.isActive)}
                                                            disabled={editSaving}
                                                            className={`ml-auto px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-60 ${tenant.isActive
                                                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
                                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">{tenant.isActive ? 'block' : 'check_circle'}</span>
                                                            {tenant.isActive ? 'Inhabilitar' : 'Habilitar'}
                                                        </button>
                                                    </div>

                                                    {/* Feedback */}
                                                    {(editError || editSuccess) && (
                                                        <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${editError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-sm">{editError ? 'error' : 'check_circle'}</span>
                                                            {editError || editSuccess}
                                                        </div>
                                                    )}

                                                    {/* Change Plan */}
                                                    {editSection === 'plan' && (
                                                        <div className="flex items-end gap-3">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-bold text-gray-600 mb-1">Nuevo Plan</label>
                                                                <select
                                                                    value={editPlanId}
                                                                    onChange={(e) => setEditPlanId(e.target.value)}
                                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                                >
                                                                    <option value="">Seleccionar plan...</option>
                                                                    {availablePlans.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <button
                                                                onClick={() => handleChangePlan(tenant.id)}
                                                                disabled={editSaving || !editPlanId}
                                                                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-60 transition-all flex items-center gap-1"
                                                            >
                                                                {editSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">save</span>}
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Add Admin */}
                                                    {editSection === 'admin' && (
                                                        <form onSubmit={(e) => handleAddAdmin(e, tenant.id)} className="space-y-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
                                                                    <input required type="text" value={newAdminForm.firstName}
                                                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, firstName: e.target.value })}
                                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                                        placeholder="Juan" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Apellido</label>
                                                                    <input required type="text" value={newAdminForm.lastName}
                                                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, lastName: e.target.value })}
                                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                                        placeholder="Pérez" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Correo</label>
                                                                    <input required type="email" value={newAdminForm.email}
                                                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                                        placeholder="admin@barberia.com" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña</label>
                                                                    <input required type="password" minLength={8} value={newAdminForm.password}
                                                                        onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                                        placeholder="••••••••" />
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                disabled={editSaving}
                                                                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-60 transition-all flex items-center gap-1"
                                                            >
                                                                {editSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">person_add</span>}
                                                                Añadir Admin
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
