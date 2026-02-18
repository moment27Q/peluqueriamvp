import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    photoUrl?: string | null;
    commissionRate: number | string;
    isActive: boolean;
    user: {
        email: string;
        role: string;
        isActive: boolean;
    };
}

interface EmployeeFormState {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    photoUrl: string;
    commissionRate: string;
    isActive: boolean;
}

interface FormFieldErrors {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    photoUrl?: string;
    commissionRate?: string;
    submit?: string;
}

interface CreateEmployeePayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photoUrl?: string;
    commissionRate: number;
}

interface UpdateEmployeePayload {
    firstName: string;
    lastName: string;
    phone?: string;
    photoUrl?: string;
    commissionRate: number;
    isActive: boolean;
}

const initialForm: EmployeeFormState = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    photoUrl: '',
    commissionRate: '50',
    isActive: true,
};

export const AdminTeam: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState<FormFieldErrors>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<EmployeeFormState>(initialForm);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get<{ data: Employee[] }>('/employees');
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error('Error fetching employees:', err);
            setError(err.message || 'Error al cargar empleados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const openCreateModal = () => {
        setEditingEmployee(null);
        setFormData(initialForm);
        setError('');
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            email: employee.user.email,
            password: '',
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone || '',
            photoUrl: employee.photoUrl || '',
            commissionRate: String(employee.commissionRate),
            isActive: employee.isActive,
        });
        setError('');
        setFormErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData(initialForm);
        setError('');
        setFormErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});

        try {
            const normalizedFirstName = formData.firstName.trim();
            const normalizedLastName = formData.lastName.trim();
            const normalizedEmail = formData.email.trim();
            const normalizedPassword = formData.password;
            const normalizedPhone = formData.phone.trim();
            const normalizedPhotoUrl = formData.photoUrl.trim();
            const commissionRateNumber = Number(formData.commissionRate);

            const nextErrors: FormFieldErrors = {};
            if (!editingEmployee) {
                if (!normalizedEmail) nextErrors.email = 'El email es obligatorio';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Email invalido';

                if (!normalizedPassword) nextErrors.password = 'La contrasena es obligatoria';
                else if (normalizedPassword.length < 8) nextErrors.password = 'Minimo 8 caracteres';
            }
            if (!normalizedFirstName) nextErrors.firstName = 'El nombre es obligatorio';
            if (!normalizedLastName) nextErrors.lastName = 'El apellido es obligatorio';
            if (!Number.isFinite(commissionRateNumber) || commissionRateNumber < 0 || commissionRateNumber > 100) {
                nextErrors.commissionRate = 'Debe ser un numero entre 0 y 100';
            }
            if (normalizedPhotoUrl) {
                try {
                    new URL(normalizedPhotoUrl);
                } catch {
                    nextErrors.photoUrl = 'La URL de foto no es valida';
                }
            }
            if (Object.keys(nextErrors).length > 0) {
                setFormErrors(nextErrors);
                return;
            }

            if (editingEmployee) {
                const payload: UpdateEmployeePayload = {
                    firstName: normalizedFirstName,
                    lastName: normalizedLastName,
                    phone: normalizedPhone || undefined,
                    photoUrl: normalizedPhotoUrl || undefined,
                    commissionRate: commissionRateNumber,
                    isActive: formData.isActive,
                };
                await api.put(`/employees/${editingEmployee.id}`, payload);
            } else {
                const payload: CreateEmployeePayload = {
                    email: normalizedEmail,
                    password: formData.password,
                    firstName: normalizedFirstName,
                    lastName: normalizedLastName,
                    phone: normalizedPhone || undefined,
                    photoUrl: normalizedPhotoUrl || undefined,
                    commissionRate: commissionRateNumber,
                };
                await api.post('/employees', payload);
            }

            await fetchEmployees();
            closeModal();
        } catch (err: any) {
            console.error('Error saving employee:', err);
            setFormErrors({
                submit: err.message || 'No se pudo guardar el barbero',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (employee: Employee) => {
        const confirmed = window.confirm(
            `Eliminar a ${employee.firstName} ${employee.lastName}?`
        );
        if (!confirmed) return;

        try {
            await api.delete(`/employees/${employee.id}`);
            await fetchEmployees();
        } catch (err: any) {
            console.error('Error deleting employee:', err);
            setError(err.message || 'No se pudo eliminar el empleado');
        }
    };

    return (
        <div className="p-8 font-display">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">Gestion de Equipo</h2>
                    <p className="text-primary font-medium">Crear, editar y eliminar barberos.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-gray-900 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Barbero
                </button>
            </header>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 font-bold text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="p-8 flex justify-center text-gray-500">Cargando equipo...</div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Barbero</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Comision</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm bg-gray-200"
                                                    style={{ backgroundImage: employee.photoUrl ? `url('${employee.photoUrl}')` : undefined }}
                                                >
                                                    {!employee.photoUrl && (
                                                        <span className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">
                                                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{employee.firstName} {employee.lastName}</p>
                                                    <p className="text-xs text-gray-500">{employee.phone || 'Sin telefono'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{employee.user.email}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{Number(employee.commissionRate)}%</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${employee.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {employee.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(employee)}
                                                    className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee)}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-2xl font-black text-gray-900 mb-6">
                            {editingEmployee ? 'Editar Barbero' : 'Crear Barbero'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingEmployee && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary ${formErrors.email ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder="ejemplo@correo.com"
                                        />
                                        {formErrors.email && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Contrasena</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary ${formErrors.password ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder="Minimo 8 caracteres"
                                        />
                                        {formErrors.password && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.password}</p>}
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary ${formErrors.firstName ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                    {formErrors.firstName && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary ${formErrors.lastName ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                    {formErrors.lastName && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.lastName}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Telefono</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Comision (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                        value={formData.commissionRate}
                                        onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary ${formErrors.commissionRate ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                    {formErrors.commissionRate && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.commissionRate}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Foto URL (opcional)</label>
                                <input
                                    type="url"
                                    value={formData.photoUrl}
                                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary ${formErrors.photoUrl ? 'border-red-300' : 'border-gray-200'}`}
                                    placeholder="https://..."
                                />
                                {formErrors.photoUrl && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.photoUrl}</p>}
                            </div>

                            {formErrors.submit && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
                                    {formErrors.submit}
                                </div>
                            )}

                            {editingEmployee && (
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Empleado activo</span>
                                </label>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full bg-primary text-gray-900 font-bold py-4 rounded-xl uppercase tracking-widest text-xs mt-4 hover:shadow-lg hover:shadow-primary/30 transition-all ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {saving ? 'Guardando...' : editingEmployee ? 'Guardar Cambios' : 'Crear Barbero'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
