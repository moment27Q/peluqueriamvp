import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface ServiceType {
    id: string;
    name: string;
    description?: string | null;
    defaultPrice: number | string;
    durationMinutes?: number | null;
    isActive: boolean;
}

interface ServiceFormState {
    name: string;
    description: string;
    defaultPrice: string;
    durationMinutes: string;
    isActive: boolean;
}

const initialForm: ServiceFormState = {
    name: '',
    description: '',
    defaultPrice: '',
    durationMinutes: '',
    isActive: true,
};

export const AdminServices: React.FC = () => {
    const [services, setServices] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceType | null>(null);
    const [formData, setFormData] = useState<ServiceFormState>(initialForm);

    const fetchServices = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get<{ data: ServiceType[] }>('/services/types/all?includeInactive=true');
            setServices(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error('Error fetching services:', err);
            setError(err.message || 'Error al cargar servicios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const openCreateModal = () => {
        setEditingService(null);
        setFormData(initialForm);
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (service: ServiceType) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            defaultPrice: String(service.defaultPrice),
            durationMinutes: service.durationMinutes ? String(service.durationMinutes) : '',
            isActive: service.isActive,
        });
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        setFormData(initialForm);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const defaultPrice = Number(formData.defaultPrice);
            const durationMinutes = formData.durationMinutes
                ? Number(formData.durationMinutes)
                : undefined;

            if (!formData.name.trim()) {
                throw new Error('El nombre es requerido');
            }
            if (!Number.isFinite(defaultPrice) || defaultPrice <= 0) {
                throw new Error('El precio debe ser mayor a 0');
            }
            if (durationMinutes !== undefined && (!Number.isInteger(durationMinutes) || durationMinutes <= 0)) {
                throw new Error('La duración debe ser un número entero positivo');
            }

            const basePayload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                defaultPrice,
                durationMinutes,
            };

            if (editingService) {
                await api.put(`/services/types/${editingService.id}`, {
                    ...basePayload,
                    isActive: formData.isActive,
                });
            } else {
                await api.post('/services/types', basePayload);
            }

            await fetchServices();
            closeModal();
        } catch (err: any) {
            console.error('Error saving service:', err);
            setError(err.message || 'No se pudo guardar el servicio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service: ServiceType) => {
        const confirmed = window.confirm(`Eliminar servicio "${service.name}"?`);
        if (!confirmed) return;

        try {
            await api.delete(`/services/types/${service.id}`);
            await fetchServices();
        } catch (err: any) {
            console.error('Error deleting service:', err);
            setError(err.message || 'No se pudo eliminar el servicio');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando servicios...</div>;
    }

    return (
        <div className="p-8 font-display">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">Gestion de Servicios</h2>
                    <p className="text-primary font-medium">Crear, editar y eliminar servicios.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-gray-900 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Servicio
                </button>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className={`bg-white p-6 rounded-2xl border ${service.isActive ? 'border-gray-100' : 'border-red-200 opacity-75'} shadow-sm relative`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                                ${Number(service.defaultPrice).toFixed(2)}
                            </span>
                        </div>

                        <p className="text-gray-500 text-sm mb-4 min-h-[40px] line-clamp-2">
                            {service.description || 'Sin descripcion'}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                {service.durationMinutes ? `${service.durationMinutes} min` : 'Duracion variable'}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(service)}
                                    className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(service)}
                                    className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                                    title="Eliminar"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>

                        {!service.isActive && (
                            <div className="absolute top-2 right-12 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                Inactivo
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-2xl font-black text-gray-900 mb-6">
                            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                    placeholder="Ej. Corte Clasico"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Precio ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={formData.defaultPrice}
                                        onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Duracion (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={formData.durationMinutes}
                                        onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Descripcion</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary resize-none"
                                    placeholder="Descripcion del servicio..."
                                />
                            </div>

                            {editingService && (
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Servicio activo</span>
                                </label>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full bg-primary text-gray-900 font-bold py-4 rounded-xl uppercase tracking-widest text-xs mt-4 hover:shadow-lg hover:shadow-primary/30 transition-all ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {saving ? 'Guardando...' : editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
