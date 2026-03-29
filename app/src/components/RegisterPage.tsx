import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';

interface RegisterPageProps {
    onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
    const [shopName, setShopName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopName: shopName.trim(),
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                const message = data?.error || data?.message || `Error ${response.status} al crear la cuenta.`;
                throw new Error(message);
            }

            const accessToken =
                data?.data?.tokens?.accessToken ??
                data?.data?.token ??
                data?.token;
            const refreshToken =
                data?.data?.tokens?.refreshToken ??
                data?.data?.refreshToken;
            const user =
                data?.data?.user ??
                data?.user;

            if (accessToken) {
                localStorage.setItem('token', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            window.dispatchEvent(new Event('storage'));

            localStorage.setItem('trialEligible', '1');
            setSuccess('Cuenta creada. Ahora puedes elegir tu plan.');
            setTimeout(() => onNavigate('admin-plans'), 400);
        } catch (err: any) {
            const rawMessage = err?.message || 'No se pudo crear la cuenta.';
            const lower = rawMessage.toLowerCase();
            const safeMessage =
                lower.includes('sesion expirada') || lower.includes('token no proporcionado')
                    ? 'No se pudo crear la cuenta. Intenta nuevamente.'
                    : rawMessage;
            setError(safeMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display text-gray-900 min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
            <div className="fixed inset-0 z-0 flex">
                <div className="w-full lg:w-1/2 bg-white hidden lg:block relative overflow-hidden">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJG4VheG2b04Ys-owawpkAg7EvuWIu5XHOxJLi5jI0Ae923AM-6dU9VSz5ReTCJpVm0g7i2EWWuy6H1-ajd_cDfKKbf_LyOjno7pYaT1hPDtI9N1tagI9rbEJsBV1MmxPvp1OcSw9dhC209A_8OranZAXIuQe7xnFwbb5FxZYoEeupe6jLaKgQZv9GthVhWnCTw5yBgZEetjCfRKNreVFoEYGMkdImqJYufoV7WRf2OoVk55QZuiiJGp18cImVFnyZ7U9mktqJ7f50"
                        alt="Barbershop Interior"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                </div>
                <div className="w-full lg:w-1/2 bg-white relative"></div>
            </div>

            <button
                onClick={() => onNavigate('landing')}
                className="absolute top-6 left-6 z-30 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-bold">Volver al inicio</span>
            </button>

            <div className="relative z-30 w-full max-w-[480px] lg:ml-auto lg:mr-24 lg:translate-x-0">
                <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 shadow-2xl shadow-gray-200/50 flex flex-col items-center">
                    <div className="mb-8 flex flex-col items-center">
                        <img
                            src="/images/logo-izichamba.png"
                            alt="Izichamba"
                            className="h-16 w-auto mb-2"
                        />
                    </div>

                    <div className="w-full text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
                        <p className="text-gray-500 text-sm">Completa tus datos y luego elige tu plan</p>
                    </div>

                    {error && (
                        <div className="w-full mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="w-full mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nombre del negocio</label>
                            <input
                                type="text"
                                required
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                placeholder="Mi peluqueria"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Apellido</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Correo</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Contrasena</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                                placeholder="Minimo 8 caracteres"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/30 ${(loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                    </form>

                    <div className="w-full mt-4 text-center text-sm text-gray-500">
                        Prefieres ver planes primero?{' '}
                        <button onClick={() => onNavigate('plans')} className="text-primary font-bold hover:underline">
                            Ver planes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
