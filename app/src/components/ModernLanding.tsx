import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface ModernLandingProps {
    onNavigate: (page: string) => void;
}

export const ModernLanding: React.FC<ModernLandingProps> = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { type, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [type === 'text' ? 'name' : type]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { api } = await import('../services/api');
            console.log('Sending login request...');
            const response = await api.post<any>('/auth/login', {
                email: formData.email,
                password: formData.password
            });
            console.log('Login response:', response);

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
                throw new Error('Respuesta del servidor invÃ¡lida');
            }

            localStorage.setItem('token', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            // Force App to recognize login
            window.dispatchEvent(new Event('storage'));
            const role = user?.role;
            onNavigate(role === 'EMPLOYEE' ? 'employee' : 'admin');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Credenciales invÃ¡lidas. IntÃ©ntalo de nuevo.');
            setLoading(false); // Only stop loading on error, keep it if success to prevent flicker before unmount? Or just standard finally?
            // If I navigate, component unmounts. If I don't, I need to stop loading.
            // Let's stop loading only on error to avoid button enabling again before redirect?
            // Actually, usually finally is safer.
        }
        // If success, we navigate away, so component unmounts.
        // If failure, we stop loading in catch.
    };

    return (
        <div className="relative min-h-screen flex flex-col font-display bg-white text-gray-900 selection:bg-primary/20 selection:text-primary overflow-x-hidden">
            {/* Navigation Bar */}
            <Header onNavigate={onNavigate} />

            {/* Hero Section */}
            <main className="flex-grow flex items-center relative pt-20 min-h-screen">
                {/* Background Image with Light Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4FSOriT-u2-UdnClithqMYVamVjWBkaq51UI1_mYfzVSbdYXq3RFEb0vjYqMmoBOOxvN40SY1mJETTA4Ld3psvt7lo36P0dtKf6xsihz2IjQ3m2BZz6XJ_dBwkpASvQa_OK6qJ785Nv1JrEjsAr3Wj4A9tUIqM9_NDfGHbb8WnwdwdxqUA-G0xl1M9KzKneGnh4AkwJR6hX8d9mvUYNFtVcqd2N_XB3UsbMsRxotX8XJO8OSKE3fHTHqO6A0rRHmd6hPcV2idrmbS"
                        alt="Interior de barbería premium"
                        className="w-full h-full object-cover opacity-90 hero-kenburns"
                    />
                    {/* White Gradient Overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/40"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10 py-12 lg:py-24">
                    {/* Hero Content */}
                    <div className="max-w-xl fade-up visible">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest mb-8 shadow-sm">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Experiencia Exclusiva
                        </div>
                        <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-8 text-gray-900">
                            Eleva tu estilo en <br className="hidden md:block" />
                            <span className="text-primary">mi pagina.com</span>
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed mb-10 font-medium max-w-lg">
                            Servicios exclusivos de peluquería y barbería para quienes buscan la excelencia en cada detalle.
                        </p>

                        {/* Trust Badges Desktop */}
                        <div className="hidden md:flex gap-10 items-center mt-8 border-t border-gray-200 pt-8">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="material-symbols-outlined">stars</span>
                                    <span className="text-3xl font-extrabold">5.0</span>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Servicio Premium</p>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="material-symbols-outlined text-primary">group</span>
                                    <span className="text-3xl font-extrabold text-white drop-shadow-md lg:text-gray-400 lg:drop-shadow-none">50+</span>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Clientes Satisfechos</p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Card */}
                    <div className="flex justify-center lg:justify-end scale-in visible">
                        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">Comienza tu Cambio</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Regístrate para obtener beneficios exclusivos y agendar tu primera sesión.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">


                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-xl">mail</span>
                                        <input
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-xl">lock</span>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-primary hover:bg-primary/90 text-white font-extrabold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm mt-4 shadow-lg shadow-primary/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </button>
                            </form>

                            <p className="text-center text-[11px] text-gray-400 mt-6 leading-tight">
                                Al registrarte, aceptas nuestros <a href="#" className="text-primary hover:underline font-bold">TÃ©rminos de Servicio</a> y <a href="#" className="text-primary hover:underline font-bold">PolÃ­tica de Privacidad</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Section (Bottom Bar) */}
            <section className="bg-gray-50 border-t border-gray-100 py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="flex flex-col items-center text-center gap-4 group cursor-default">
                            <div className="size-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                <span className="material-symbols-outlined text-primary text-3xl">content_cut</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">Corte ClÃ¡sico</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">TÃ©cnicas tradicionales</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4 group cursor-default">
                            <div className="size-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                <span className="material-symbols-outlined text-primary text-3xl">face</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">Afeitado Spa</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Toalla caliente y aceites</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4 group cursor-default">
                            <div className="size-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">Productos Top</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Marcas internacionales</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4 group cursor-default">
                            <div className="size-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">Citas Online</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Sin esperas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="order-2 lg:order-1 fade-up visible">
                            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-8">
                                Crece junto a los <br />
                                mejores estilistas y <br />
                                <span className="text-primary">forma parte de la comunidad lider en peluqueria y barberia.</span>
                            </h2>
                            <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                                Aqui, cada cambio de look puede volverse inolvidable. Los profesionales del sector nos eligen para gestionar reservas, optimizar pagos y aumentar su facturacion mientras fidelizan clientes y hacen crecer su salon.
                            </p>
                            <button
                                onClick={() => document.getElementById('contactanos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="bg-[#FF4D00] hover:bg-[#E04400] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Quiero unirme
                            </button>
                        </div>

                        {/* Right Content - Vertical Marquee */}
                        <div className="order-1 lg:order-2 h-[600px] relative overflow-hidden mask-vertical-fade">
                            {/* Overlay gradients for smooth fade */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>

                            <div className="marquee-vertical flex flex-col gap-8">
                                {/* Card 1 */}
                                <div className="bg-gray-50 rounded-3xl p-4 shadow-sm border border-gray-100 max-w-sm mx-auto transform rotate-[-2deg]">
                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Usuario" className="w-full h-[400px] object-cover rounded-2xl mb-4" />
                                    <div className="text-center">
                                        <h4 className="font-bold text-xl text-gray-900">Nicolas Abril</h4>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="bg-[#141414] rounded-3xl p-4 shadow-xl border border-gray-800 max-w-sm mx-auto transform rotate-[2deg]">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Usuario" className="w-full h-[400px] object-cover rounded-2xl mb-4 opacity-90" />
                                    <div className="text-center">
                                        <h4 className="font-bold text-xl text-white">Ana MarÃ­a</h4>
                                    </div>
                                </div>
                                {/* Card 3 */}
                                <div className="bg-gray-50 rounded-3xl p-4 shadow-sm border border-gray-100 max-w-sm mx-auto transform rotate-[-1deg]">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Usuario" className="w-full h-[400px] object-cover rounded-2xl mb-4" />
                                    <div className="text-center">
                                        <h4 className="font-bold text-xl text-gray-900">Carlos Ruiz</h4>
                                    </div>
                                </div>
                                {/* Duplicate for infinite loop */}
                                <div className="bg-gray-50 rounded-3xl p-4 shadow-sm border border-gray-100 max-w-sm mx-auto transform rotate-[-2deg]">
                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Usuario" className="w-full h-[400px] object-cover rounded-2xl mb-4" />
                                    <div className="text-center">
                                        <h4 className="font-bold text-xl text-gray-900">Nicolas Abril</h4>
                                    </div>
                                </div>
                                <div className="bg-[#141414] rounded-3xl p-4 shadow-xl border border-gray-800 max-w-sm mx-auto transform rotate-[2deg]">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Usuario" className="w-full h-[400px] object-cover rounded-2xl mb-4 opacity-90" />
                                    <div className="text-center">
                                        <h4 className="font-bold text-xl text-white">Ana MarÃ­a</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Conversion Features Section */}
            <section className="py-24 bg-black text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Main Card - Black */}
                        <div className="bg-[#111] rounded-[2rem] p-10 flex flex-col justify-center border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8 relative z-10">
                                Tu elevas el <br />
                                estilo. <br />
                                <span className="text-white">Nosotros hacemos crecer tus reservas.</span>
                            </h2>
                            <button
                                onClick={() => document.getElementById('contactanos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="bg-[#FF4D00] hover:bg-[#E04400] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full md:w-auto self-start relative z-10"
                            >
                                Aumentar citas ahora
                            </button>
                        </div>

                        {/* 2. Feature Card - Wide - Payment/Phone */}
                        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-[2rem] overflow-hidden relative group min-h-[400px]">
                            <img
                                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                                alt="Autocompletado"
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                                <h3 className="text-3xl font-bold mb-4">+7 % en reservas con agenda rapida.</h3>
                                <p className="text-gray-300 text-lg max-w-xl">Tus clientes agendan en segundos con datos guardados y confirmacion automatica para no perder turnos.</p>
                            </div>
                        </div>

                        {/* 3. Feature Card - Ticket Medio */}
                        <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden relative group min-h-[500px]">
                            <img
                                src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="RecomendaciÃ³n"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20 inline-block w-fit">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs">PDF</div>
                                        <div className="text-xs">
                                            <div className="font-bold text-white">Guia</div>
                                            <div className="text-gray-300">Cuidado capilar</div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">+48 % en ticket medio con recomendacion de servicios.</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Despues de cada cita sugerimos tratamientos, color o productos de mantenimiento en el momento ideal.</p>
                            </div>
                        </div>

                        {/* 4. Feature Card - Checkout */}
                        <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden relative group min-h-[500px]">
                            <img
                                src="https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Checkout"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-2xl font-bold mb-4">Un cobro en salon pensado para cerrar cada servicio.</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Cobro rapido en caja o link de pago, con confirmacion instantanea para reducir cancelaciones y ausencias.</p>
                            </div>
                        </div>

                        {/* 5. Feature Card - Global */}
                        <div className="bg-[#1A1A1A] rounded-[2rem] overflow-hidden relative group min-h-[500px]">
                            <img
                                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Global"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                                <div className="space-y-2 mb-6">
                                    <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-lg transform translate-x-4">
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">âœ“</div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">Servicio completado</div>
                                            <div className="text-xs font-bold text-gray-900">Corte + Barba S/ 25.00</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-lg transform -translate-x-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">âœ“</div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">Producto vendido</div>
                                            <div className="text-xs font-bold text-gray-900">Kit capilar S/ 40.00</div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Tu salon conecta con clientes de todos los perfiles.</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Gestiona citas, servicios y ventas en una sola plataforma para peluqueria y barberia, desde cualquier sede.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Next Step Section */}
            <section className="py-24 bg-[#Fdfbf6]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16">
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
                            <span className="text-[#FF4D00]">Tu proximo paso para tu salon comienza aqui.</span><br />
                            Y el siguiente corte. Y la siguiente reserva...
                        </h2>
                        <button
                            onClick={() => document.getElementById('contactanos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="bg-[#FF4D00] hover:bg-[#E04400] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-4"
                        >
                            Llevar mi salon al siguiente nivel
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px]">
                        {/* Card 1 */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out flex-[1] hover:flex-[3] h-[300px] lg:h-full">
                            <img
                                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                                alt="Disena la experiencia de tu salon"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                                    Diseña la experiencia de tu salon
                                </h3>
                                <p className="text-gray-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-500 overflow-hidden leading-relaxed">
                                    Configura servicios, tiempos y precios para que cada cita se adapte a tu estilo de trabajo.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out flex-[1] hover:flex-[3] h-[300px] lg:h-full">
                            <img
                                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                                alt="Vende mas servicios"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                                    Vende mas con cada visita
                                </h3>
                                <p className="text-gray-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-500 overflow-hidden leading-relaxed">
                                    Ofrece combos de corte, barba y tratamientos para aumentar el ticket promedio de forma natural.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out flex-[1] hover:flex-[3] h-[300px] lg:h-full">
                            <img
                                src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Fideliza a tus clientes"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                                    Convierte clientes en habituales
                                </h3>
                                <p className="text-gray-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-500 overflow-hidden leading-relaxed">
                                    Crea relaciones duraderas con recordatorios, atencion personalizada y seguimiento despues de cada cita.
                                </p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="relative group cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out flex-[1] hover:flex-[3] h-[300px] lg:h-full">
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                                alt="Gestiona tu peluqueria con datos"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                                    Gestiona tu peluqueria con datos
                                </h3>
                                <p className="text-gray-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-500 overflow-hidden leading-relaxed">
                                    Toma decisiones con reportes en tiempo real sobre ingresos, servicios mas pedidos y rendimiento del equipo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Contact Section */}
            <section id="contactanos" className="py-24 bg-[#f3f6f3]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <p className="text-primary text-xs font-bold uppercase tracking-[0.25em] mb-3">Contactanos</p>
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
                            Nos encantara atenderte
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Si buscas un nuevo estilo, un cambio completo o solo resolver una duda, nuestro equipo esta listo para ayudarte.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Envianos un mensaje</h3>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre completo</label>
                                        <input
                                            type="text"
                                            placeholder="Juan Perez"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Correo electronico</label>
                                        <input
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Servicio de interes</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary">
                                        <option value="">Selecciona un servicio</option>
                                        <option>Corte clasico</option>
                                        <option>Corte + barba</option>
                                        <option>Color y tratamientos</option>
                                        <option>Asesoria de imagen</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tu mensaje</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Cuentanos como podemos ayudarte..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="w-full bg-primary hover:bg-primary/90 text-gray-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    Enviar mensaje
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-2">Visitanos</p>
                                        <p className="text-sm text-gray-600">Av. Principal 123, Local 4</p>
                                        <p className="text-sm text-gray-600">Lima, Peru</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-2">Llamanos</p>
                                        <p className="text-sm text-gray-600">Principal: +51 941 147 507</p>
                                        <p className="text-sm text-gray-600">Reservas: +51 941 147 507</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#eaf4e5] rounded-2xl border border-[#dbead2] p-6">
                                <p className="text-lg font-bold text-gray-900 mb-4">Horario de atencion</p>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex items-center justify-between"><span>Lunes a Viernes</span><span>9:00 AM - 8:00 PM</span></div>
                                    <div className="flex items-center justify-between"><span>Sabado</span><span>10:00 AM - 6:00 PM</span></div>
                                    <div className="flex items-center justify-between"><span>Domingo</span><span>Cerrado</span></div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                <div className="w-full h-52 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                                    Ubicacion del salon
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <Footer />
        </div >
    );
};



