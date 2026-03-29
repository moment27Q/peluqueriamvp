import React, { useState } from 'react';

interface LoginPageProps {
    onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tenantInactive, setTenantInactive] = useState<{ phone: string } | null>(null);
    const [accountLocked, setAccountLocked] = useState<{ minutesLeft: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setTenantInactive(null);
        setAccountLocked(null);
        setLoading(true);

        try {
            const { api } = await import('../services/api');

            const response = await api.post<any>('/auth/login', {
                email,
                password
            });

            const accessToken =
                response?.data?.tokens?.accessToken ??
                response?.data?.token ??
                response?.token;
            const refreshToken =
                response?.data?.tokens?.refreshToken ??
                response?.data?.refreshToken;
            const user =
                response?.data?.user ??
                response?.user;

            if (!accessToken) {
                throw new Error('No se recibiÃ³ un token vÃ¡lido del servidor');
            }

            localStorage.setItem('token', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            console.log('Login successful:', user);
            const role = user?.role;
            onNavigate(role === 'EMPLOYEE' ? 'employee' : 'admin');
        } catch (err: any) {
            console.error('Login error:', err);
            const isLocked = err?.code === 'ACCOUNT_LOCKED' || err?.message === 'ACCOUNT_LOCKED';
            const isInactive = err?.code === 'TENANT_INACTIVE' || err?.message === 'TENANT_INACTIVE';
            if (isInactive) {
                setTenantInactive({ phone: err.phone || '' });
            } else if (isLocked) {
                setAccountLocked({ minutesLeft: err.minutesLeft || 15 });
            } else {
                setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display text-gray-900 min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
            {/* Split Layout Background */}
            <div className="fixed inset-0 z-0 flex">
                <div className="w-full lg:w-1/2 bg-white hidden lg:block relative overflow-hidden">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJG4VheG2b04Ys-owawpkAg7EvuWIu5XHOxJLi5jI0Ae923AM-6dU9VSz5ReTCJpVm0g7i2EWWuy6H1-ajd_cDfKKbf_LyOjno7pYaT1hPDtI9N1tagI9rbEJsBV1MmxPvp1OcSw9dhC209A_8OranZAXIuQe7xnFwbb5FxZYoEeupe6jLaKgQZv9GthVhWnCTw5yBgZEetjCfRKNreVFoEYGMkdImqJYufoV7WRf2OoVk55QZuiiJGp18cImVFnyZ7U9mktqJ7f50"
                        alt="Barbershop Interior"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                </div>
                <div className="w-full lg:w-1/2 bg-white relative">
                    {/* Pattern or styling for form side */}
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => onNavigate('landing')}
                className="absolute top-6 left-6 z-30 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-bold">Volver al inicio</span>
            </button>

            <div className="relative z-30 w-full max-w-[450px] lg:ml-auto lg:mr-24 lg:translate-x-0">
                {/* Login Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 shadow-2xl shadow-gray-200/50 flex flex-col items-center">
                    {/* Logo Section */}
                    <div className="mb-10 flex flex-col items-center">
                        <img
                            src="/images/logo-izichamba.png"
                            alt="Izichamba"
                            className="h-16 w-auto mb-2"
                        />
                    </div>

                    <div className="w-full text-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
                        <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-lg group-focus-within:text-primary transition-colors">mail</span>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                    placeholder="ejemplo@barberia.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-gray-700">Contraseña</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 text-lg group-focus-within:text-primary transition-colors">lock</span>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-3 px-1 pt-1">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-primary focus:ring-primary focus:ring-offset-0"
                            />
                            <label htmlFor="remember" className="text-xs text-gray-500 font-medium cursor-pointer select-none">Recordarme en este dispositivo</label>
                        </div>

                        {/* Account Locked Banner */}
                        {accountLocked && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
                                <p className="text-red-600 text-sm font-bold">
                                    ⏱ En {accountLocked.minutesLeft} minuto{accountLocked.minutesLeft === 1 ? '' : 's'} podrá intentar nuevamente.
                                </p>
                            </div>
                        )}

                        <p className="text-center text-[11px] text-gray-400 mt-6 leading-tight">
                                Al registrarte, aceptas nuestros{' '}
                                <button
                                    type="button"
                                    onClick={() => onNavigate('terms')}
                                    className="text-primary hover:underline font-bold"
                                >
                                    Términos de Servicio
                                </button>{' '}
                                y{' '}
                                <button
                                    type="button"
                                    onClick={() => onNavigate('privacy')}
                                    className="text-primary hover:underline font-bold"
                                >
                                    Política de Privacidad
                                </button>
                                .
                            </p>

                        {/* Tenant Inactive Banner */}
                        {tenantInactive && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex flex-col items-center gap-1 text-center">
                                <div className="flex items-center gap-2 text-amber-600 font-black text-sm uppercase tracking-wide">
                                    <span className="material-symbols-outlined text-xl">block</span>
                                    Cuenta inhabilitada
                                </div>
                                <p className="text-amber-700 text-xs font-medium mt-1">
                                    Tu peluquería se encuentra desactivada.
                                </p>
                                {tenantInactive.phone && (
                                    <a
                                        href={`tel:${tenantInactive.phone}`}
                                        className="mt-2 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shadow"
                                    >
                                        <span className="material-symbols-outlined text-sm">call</span>
                                        Llamar al {tenantInactive.phone}
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg mb-4 text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !!accountLocked}
                            className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs transition-all transform active:scale-[0.98] mt-4 shadow-lg shadow-primary/30 ${(loading || accountLocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

