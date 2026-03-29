import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { api } from '../services/api';

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
    const [plans, setPlans] = useState<any[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const OWNER_PHONE = '51941147507';
    const [activeFeature, setActiveFeature] = useState<{
        id: string;
        label: string;
        title: string;
        description: string;
        image: string;
        icon: string;
    } | null>(null);

    const features = [
        {
            id: 'agenda',
            label: '01',
            icon: 'calendar_month',
            title: 'Agenda de Citas Online',
            description: 'Tus clientes reservan 24/7 desde su celular. Confirmaciones automaticas, sin llamadas, sin confusiones.',
            image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 'empleados',
            label: '02',
            icon: 'group',
            title: 'Gestion de Empleados',
            description: 'Registra a tu equipo, asigna turnos, controla asistencia y mide el rendimiento de cada uno sin esfuerzo.',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 'cobros',
            label: '03',
            icon: 'payments',
            title: 'Cobros y Facturacion',
            description: 'Cobra en caja o envia un link de pago al instante. Historial de ingresos siempre a la mano.',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 'inventario',
            label: '04',
            icon: 'inventory_2',
            title: 'Control de Inventario',
            description: 'Sabe exactamente que productos tienes, cuando reponer y cuanto estas gastando en suministros.',
            image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 'recordatorios',
            label: '05',
            icon: 'sms',
            title: 'Recordatorios por WhatsApp',
            description: 'Reduce las ausencias enviando recordatorios automaticos a tus clientes antes de su cita.',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 'reportes',
            label: '06',
            icon: 'analytics',
            title: 'Reportes y Metricas',
            description: 'Visualiza el crecimiento de tu negocio con reportes claros: ventas, clientes frecuentes y servicios mas populares.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
        }
    ];

    const displayPlans = Array.isArray(plans) ? plans : [];

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res: any = await api.get('/plans/active');
                if (res.success) {
                    setPlans(res.data);
                }
            } catch (error: any) {
                console.error('Error fetching plans:', error.message);
            } finally {
                setPlansLoading(false);
            }
        };

        fetchPlans();
    }, []);

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
            <main className="flex-grow flex items-center justify-center relative pt-20 min-h-screen">
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

                <div className="max-w-5xl mx-auto px-6 w-full flex flex-col items-start relative z-10 py-12 lg:py-24">
                    {/* Hero Content */}
                    <div className="max-w-xl fade-up visible text-center mx-auto">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest mb-8 shadow-sm">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Sistema de gestión para salones y barberías
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-[4.8rem] leading-[1.05] tracking-tight mb-8 text-gray-900 font-serif text-center w-fit mx-auto -translate-x-8 md:-translate-x-12 lg:-translate-x-20">
                            <span className="block whitespace-nowrap">¿Aún llevas tu salón</span>
                            <span className="block whitespace-nowrap">
                                con{' '}
                                <span
                                    className="italic text-[#7a8a7a]"
                                    style={{
                                        textDecorationLine: 'line-through',
                                        textDecorationColor: '#4ad24a',
                                        textDecorationThickness: '3px',
                                        textDecorationSkipInk: 'none'
                                    }}
                                >
                                    cuadernos y papeles
                                </span>
                                ?
                            </span>
                            <span className="block whitespace-nowrap">Ya no tienes que hacerlo.</span>
                            <span className="block italic text-[#4ad24a] whitespace-nowrap">Nosotros lo hacemos por ti.</span>
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed mb-10 font-medium max-w-lg mx-auto">
                            Digitaliza tu peluquería o barbería en minutos. Controla empleados, citas, pagos e inventario desde un solo lugar — sin complicaciones.
                        </p>

                        {/* Trust Badges Desktop */}

                    </div>
                </div>
            </main>

            {/* Feature Section (Bottom Bar) */}
            <section className="bg-gray-50 border-t border-gray-100 py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-left flex flex-col items-start w-full">
                    <p className="text-[#4ad24a] font-bold tracking-widest uppercase text-xs mb-4">Lo que hacemos por ti</p>
                    <h2 className="text-4xl md:text-[3.5rem] text-gray-900 leading-[1.1] mb-6 font-serif tracking-tight pr-4">
                        Todo lo que tu salón <br />
                        necesita, <span className="italic text-[#4ad24a]">en un solo lugar.</span>
                    </h2>
                    <p className="max-w-3xl text-sm text-gray-500 font-medium leading-relaxed pr-4 mb-16">
                        Olvídate de los cuadernos, los WhatsApps desordenados y los cobros a mano. Con MIPAGINA.COM tienes el control total.
                    </p>

                                        {/* Features Grid */}
                    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            {features.map((feature) => (
                                <button
                                    key={feature.id}
                                    type="button"
                                    onClick={() => setActiveFeature(feature)}
                                    className="text-left p-8 lg:p-10 flex flex-col items-start bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-[#4ad24a] font-black text-xs mb-6 inline-block">{feature.label}</span>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-[#4ad24a]">{feature.icon}</span>
                                        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">{feature.label}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-2">
                                        {feature.description}
                                    </p>
                                    <span className="mt-6 text-xs font-bold text-[#4ad24a] uppercase tracking-widest">Ver detalle</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {activeFeature && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
                        <div className="relative">
                            <img
                                src={activeFeature.image}
                                alt={activeFeature.title}
                                className="w-full h-64 md:h-80 object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setActiveFeature(null)}
                                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest shadow"
                            >
                                Cerrar
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-[#4ad24a] font-bold tracking-widest uppercase text-xs mb-3">
                                {activeFeature.label} - {activeFeature.title}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">
                                {activeFeature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {activeFeature.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados Reales Section */}
            <section className="py-32 bg-[#0d140b] text-white overflow-hidden border-t border-white/5 relative">
                {/* Full section background image */}
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80" alt="Salón ambiente" className="w-full h-full object-cover opacity-20 grayscale blur-[4px]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d140b] via-[#0d140b]/60 to-[#0d140b]"></div>
                    <div className="absolute inset-0 bg-[#0d140b]/40"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div className="fade-up visible">
                            <p className="text-[#4ad24a] font-bold tracking-widest uppercase text-xs mb-6">RESULTADOS REALES</p>
                            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif leading-[1.1] mb-8 tracking-tight text-white drop-shadow-md">
                                Los números que <br />
                                cambian tu <span className="italic text-[#4ad24a]">negocio.</span>
                            </h2>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium max-w-md drop-shadow">
                                Salones que usaron MIPAGINA.COM reportaron mejoras notables desde el primer mes. La tecnología que antes era solo para grandes cadenas, ahora está en tu mano.
                            </p>
                        </div>


                        {/* Stats Grid */}
                        <div className="w-full bg-[#111a0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative z-20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                                {/* Stat 1 */}
                                <div className="p-8 sm:p-10 border-b border-white/10">
                                    <div className="text-4xl sm:text-5xl font-serif text-[#4ad24a] mb-4">+48%</div>
                                    <p className="text-xs text-gray-400 font-medium">Aumento en ticket promedio por cliente</p>
                                </div>

                                {/* Stat 2 */}
                                <div className="p-8 sm:p-10 border-b border-white/10">
                                    <div className="text-4xl sm:text-5xl font-serif text-[#4ad24a] mb-4">-32%</div>
                                    <p className="text-xs text-gray-400 font-medium">Reducción de ausencias con recordatorios</p>
                                </div>

                                {/* Stat 3 */}
                                <div className="p-8 sm:p-10 border-b sm:border-b-0 border-white/10">
                                    <div className="text-4xl sm:text-5xl font-serif text-[#4ad24a] mb-4">3x</div>
                                    <p className="text-xs text-gray-400 font-medium">Más reservas en el primer mes de uso</p>
                                </div>

                                {/* Stat 4 */}
                                <div className="p-8 sm:p-10">
                                    <div className="text-4xl sm:text-5xl font-serif text-[#4ad24a] mb-4">5.0</div>
                                    <p className="text-xs text-gray-400 font-medium">Calificación promedio de nuestros clientes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Planes Section */}
            <section className="py-28 bg-[#f6f8f6] text-gray-900 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-left mb-16 max-w-2xl">
                        <p className="text-[#4ad24a] font-bold tracking-widest uppercase text-xs mb-4">Planes</p>
                        <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif leading-[1.1] mb-6 tracking-tight">
                            Simple y sin sorpresas.
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed font-medium">
                            Elige el plan que se adapta al tamaño de tu salón. Sin contratos, cancela cuando quieras.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
                        {plansLoading ? (
                            <div className="lg:col-span-3 text-center py-16 text-gray-600 font-semibold">
                                Cargando planes...
                            </div>
                        ) : displayPlans.length === 0 ? (
                            <div className="lg:col-span-3 text-center py-16 text-gray-600 font-semibold">
                                No hay planes activos en este momento.
                            </div>
                        ) : (
                            displayPlans.map((plan, index) => {
                                const isPopular = index === 1;
                                const planName = String(plan.name || '');
                                const isEnterprise = planName.toLowerCase().includes('enterprise');
                                const isTrial = !!plan.isTrial && !isEnterprise;

                                return (
                                    <div
                                        key={plan.id}
                                        className={
                                            isPopular
                                                ? "bg-[#0d140b] text-white rounded-[2.5rem] p-10 shadow-2xl border border-[#1c2a17] flex flex-col relative"
                                                : "bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-lg flex flex-col"
                                        }
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-4 -right-4 bg-[#4ad24a] text-[#0d140b] px-5 py-2 rounded-full font-bold text-xs tracking-wider shadow-lg uppercase border-4 border-[#0d140b]">
                                                Más popular
                                            </div>
                                        )}
                                        {isTrial && (
                                            <div className="absolute -top-4 -left-4 bg-[#4ad24a] text-white px-5 py-2 rounded-full font-bold text-xs tracking-wider shadow-lg uppercase border-4 border-white">
                                                Nuevo
                                            </div>
                                        )}
                                        <div className="flex flex-col h-full">
                                            <h3 className={`font-serif text-[1.8rem] font-bold mb-6 uppercase ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                                {plan.name}
                                            </h3>

                                            {isEnterprise ? (
                                                <div className="mb-8 h-[60px] flex items-center gap-3">
                                                    <span className={`text-4xl font-extrabold font-serif ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                                        Consultar con dueño
                                                    </span>
                                                </div>
                                            ) : Number(plan.price) === 0 ? (
                                                <div className="mb-8 h-[60px] flex items-center gap-3">
                                                    <span className={`text-4xl font-extrabold font-serif ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                                        Prueba gratuita
                                                    </span>
                                                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isPopular ? 'bg-white/15 text-white' : 'bg-[#dff7dd] text-[#1f4d1f]'}`}>
                                                        0 / mes
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="mb-8 flex items-baseline gap-2 h-[60px] items-center">
                                                    <span className={`text-5xl font-bold font-serif ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                                        ${Number(plan.price).toFixed(2)}
                                                    </span>
                                                    <span className={`text-lg font-sans font-medium ${isPopular ? 'text-white/60' : 'text-gray-600'}`}>/mes</span>
                                                </div>
                                            )}

                                            <ul className="space-y-4 mb-10 flex-1">
                                                {plan.features.map((feature: string, i: number) => (
                                                    <li key={i} className={`flex items-start gap-3 font-medium ${isPopular ? 'text-white/85' : 'text-gray-700'}`}>
                                                        <span className={`material-symbols-outlined mt-0.5 ${isPopular ? 'text-[#4ad24a]' : 'text-[#4ad24a]'}`}>check_circle</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            <a
                                                href={isEnterprise
                                                    ? `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent('Hola, quiero consultar el plan Enterprise. ¿Me pueden ayudar?')}`
                                                    : isTrial
                                                        ? "https://wa.me/51941147507?text=Hola%2C%20quiero%20solicitar%20la%20prueba%20gratuita.%20%C2%BFMe%20ayudan%20a%20activarla%3F"
                                                        : `https://wa.me/51941147507?text=Hola%2C%20estoy%20interesado%20en%20el%20plan%20*${encodeURIComponent(plan.name)}*%20(%24${plan.price}%2Fmes).%20Me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full py-3.5 rounded-full font-bold transition-all duration-300 text-center ${isPopular
                                                    ? 'bg-[#4ad24a] text-[#0d140b] hover:bg-[#62e85a] shadow-lg'
                                                    : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-900 hover:text-white'
                                                    }`}
                                            >
                                                {isEnterprise ? 'Contactar dueño' : isTrial ? 'Contactar vendedor' : Number(plan.price) === 0 ? 'Probar gratis' : `Elegir ${plan.name}`}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        )}
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

            {/* Footer */}
            <Footer />
        </div >
    );
};






