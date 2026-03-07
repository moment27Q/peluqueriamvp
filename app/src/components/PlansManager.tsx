import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface Plan {
    id: string;
    name: string;
    price: string | number;
    features: string[];
    isActive: boolean;
    displayOrder: number;
}

export const PlansManager: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Editing State
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res: any = await api.get('/plans');
            if (res.success) {
                setPlans(res.data);
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Error al cargar la lista de planes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;

        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (editingPlan.id) {
                await api.put(`/plans/${editingPlan.id}`, {
                    name: editingPlan.name,
                    price: Number(editingPlan.price),
                    features: editingPlan.features.filter(f => f.trim() !== ''),
                    isActive: editingPlan.isActive,
                    displayOrder: Number(editingPlan.displayOrder),
                });
                setSuccessMsg(`Plan "${editingPlan.name}" actualizado exitosamente.`);
            } else {
                await api.post('/plans', {
                    name: editingPlan.name,
                    price: Number(editingPlan.price),
                    features: editingPlan.features.filter(f => f.trim() !== ''),
                    isActive: editingPlan.isActive,
                    displayOrder: Number(editingPlan.displayOrder),
                });
                setSuccessMsg(`Plan "${editingPlan.name}" creado exitosamente.`);
            }

            setEditingPlan(null);
            fetchPlans();
        } catch (error: any) {
            setErrorMsg(error.message || 'Error al guardar el plan.');
        }
    };

    const handleRemovePlan = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este plan?')) return;
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await api.delete(`/plans/${id}`);
            setSuccessMsg('Plan eliminado exitosamente.');
            fetchPlans();
        } catch (error: any) {
            setErrorMsg(error.message || 'Error al eliminar el plan.');
        }
    }

    const handleAddFeature = () => {
        if (editingPlan) {
            setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ''] });
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        if (editingPlan) {
            const newFeatures = [...editingPlan.features];
            newFeatures[index] = value;
            setEditingPlan({ ...editingPlan, features: newFeatures });
        }
    }

    const handleRemoveFeature = (index: number) => {
        if (editingPlan) {
            const newFeatures = editingPlan.features.filter((_, i) => i !== index);
            setEditingPlan({ ...editingPlan, features: newFeatures });
        }
    }

    if (loading && plans.length === 0) {
        return <div className="p-8 text-center text-gray-500">Cargando planes...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Planes</h2>
                    <p className="text-gray-500 mt-1">Configura los precios y ventajas de los planes de suscripción (máximo 4).</p>
                </div>
                {!editingPlan && plans.length < 4 && (
                    <button
                        onClick={() => setEditingPlan({ id: '', name: '', price: '', features: [''], isActive: true, displayOrder: plans.length + 1 })}
                        className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Crear Nuevo Plan
                    </button>
                )}
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl mb-6 text-sm font-medium border border-emerald-100 flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMsg}
                </div>
            )}

            {/* Grid de Planes */}
            {!editingPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan: Plan) => (
                        <div key={plan.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col relative transition-all hover:shadow-md">
                            {!plan.isActive && (
                                <span className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">
                                    INACTIVO
                                </span>
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide">{plan.name}</h3>
                                {Number(plan.price) === 0 ? (
                                    <div className="text-3xl font-extrabold text-indigo-600 mb-6">
                                        Consultar Precio
                                    </div>
                                ) : (
                                    <div className="text-4xl font-extrabold text-indigo-600 mb-6 flex items-end gap-1">
                                        ${Number(plan.price).toFixed(2)}
                                        <span className="text-sm text-gray-400 font-medium mb-1">/mes</span>
                                    </div>
                                )}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                                            <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingPlan(plan)}
                                    className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleRemovePlan(plan.id)}
                                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    title="Eliminar Plan"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {plans.length === 0 && (
                        <div className="col-span-3 text-center py-20 text-gray-500 font-medium">
                            No hay planes configurados todavía. Haz clic en "Crear Nuevo Plan" para empezar.
                        </div>
                    )}
                </div>
            ) : (
                /* Formulario de Edición */
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingPlan.id ? (
                                <>Editando Plan: <span className="uppercase text-indigo-600">{editingPlan.name}</span></>
                            ) : (
                                <>Creando Nuevo Plan</>
                            )}
                        </h3>
                        <button
                            onClick={() => setEditingPlan(null)}
                            className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSavePlan} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Plan</label>
                                <input
                                    type="text"
                                    required
                                    value={editingPlan.name}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Orden de Aparición</label>
                                {(() => {
                                    const isOrderTaken = plans.some(
                                        (p) => Number((p as any).displayOrder) === Number(editingPlan.displayOrder) && p.id !== editingPlan.id
                                    );
                                    const usedOrders = plans
                                        .filter(p => p.id !== editingPlan.id)
                                        .map(p => (p as any).displayOrder ?? 0)
                                        .join(', ');
                                    return (
                                        <>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={editingPlan.displayOrder}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, displayOrder: parseInt(e.target.value) || 1 })}
                                                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium ${isOrderTaken
                                                        ? 'border-red-400 focus:ring-red-400 bg-red-50'
                                                        : 'border-gray-200 focus:ring-indigo-500'
                                                    }`}
                                                title="Posición de izquierda a derecha (menor = primero)"
                                            />
                                            {isOrderTaken && (
                                                <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">warning</span>
                                                    Ya en uso. Números ocupados: {usedOrders}
                                                </p>
                                            )}
                                            {!isOrderTaken && usedOrders && (
                                                <p className="mt-1 text-xs text-gray-400">Ocupados por otros: {usedOrders}</p>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Precio ($)</label>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        required={Number(editingPlan.price) !== 0}
                                        disabled={Number(editingPlan.price) === 0 && editingPlan.price !== '' && editingPlan.price !== '0'}
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                                        placeholder={Number(editingPlan.price) === 0 ? 'Consultar Precio' : '0.00'}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="consultPrice"
                                            checked={Number(editingPlan.price) === 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setEditingPlan({ ...editingPlan, price: 0 });
                                                } else {
                                                    setEditingPlan({ ...editingPlan, price: '' });
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <label htmlFor="consultPrice" className="text-sm font-medium text-gray-600 cursor-pointer">
                                            Mostrar como "Consultar Precio"
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Características (Beneficios)</label>
                            <div className="space-y-3">
                                {editingPlan.features.map((feature: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(i, e.target.value)}
                                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(i)}
                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title="Eliminar Característica"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Añadir característica
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={editingPlan.isActive}
                                onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <label htmlFor="isActive" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                                Plan Activo (Visible para clientes)
                            </label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditingPlan(null)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
