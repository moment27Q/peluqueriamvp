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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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
            setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
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
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                            <span className="material-symbols-outlined text-4xl">content_cut</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight uppercase text-gray-900 mb-1">
                            mi <span className="text-primary">pagina.com</span>
                        </h1>
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
                                <a href="#" className="text-xs text-primary font-bold hover:underline">¿Olvidaste tu contraseña?</a>
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

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg mb-4 text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs transition-all transform active:scale-[0.98] mt-4 shadow-lg shadow-primary/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 w-full text-center border-t border-gray-50">
                        <p className="text-gray-400 text-xs">
                            ¿No tienes una cuenta?
                            <a href="#" className="text-primary font-bold hover:underline ml-1">Regístrate aquí</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

