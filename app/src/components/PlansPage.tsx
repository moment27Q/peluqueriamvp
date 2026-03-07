import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Header } from './Header';
import { Footer } from './Footer';

interface PlansPageProps {
    onNavigate: (page: string) => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({ onNavigate }) => {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    return (
        <div
            className="relative flex min-h-screen w-full flex-col font-display text-gray-900 selection:bg-[#e6ceba]/30"
            style={{
                backgroundColor: '#faf8f5',
                backgroundImage: 'radial-gradient(circle at top right, #f2e6db 0%, transparent 40%), radial-gradient(circle at bottom left, #eed8c5 0%, transparent 40%)'
            }}
        >
            <Header onNavigate={onNavigate} />

            <main className="flex-1 relative z-10 w-full py-20 pb-32 pt-32 lg:pt-48">
                {/* Planes Section */}
                <div className="container mx-auto px-6 mb-20">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#3e2723] leading-[1.05] mb-6">
                            Planes a tu <span className="italic text-[#2d1b18]">Medida</span>
                        </h2>
                        <p className="text-[#3e2723]/80 text-[1.1rem] md:text-xl mix-blend-color-burn font-medium leading-relaxed max-w-xl mx-auto">
                            Selecciona la arquitectura digital que mejor se adapte a la etapa y visión de tu salón de autor.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
                        {loading ? (
                            <div className="col-span-3 text-center py-20 text-[#3e2723] font-bold text-xl">
                                Cargando planes...
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="col-span-3 text-center py-20 text-[#3e2723] font-bold text-xl">
                                No hay planes activos en este momento.
                            </div>
                        ) : (
                            plans.map((plan, index) => {
                                const isPopular = index === 1; // Hacer que el plan del medio sea "Destacado"

                                return (
                                    <div
                                        key={plan.id}
                                        className={
                                            isPopular
                                                ? "bg-[#3e2723] rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 hover:-translate-y-3 transition-all duration-500 flex flex-col relative transform lg:scale-105 z-20"
                                                : "bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-xl shadow-black/5 hover:-translate-y-3 transition-all duration-500 flex flex-col group relative"
                                        }
                                    >
                                        {isPopular && (
                                            <>
                                                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                                </div>
                                                <div className="absolute -top-4 -right-4 bg-[#e6ceba] text-[#3e2723] px-6 py-2 rounded-full font-bold text-xs tracking-wider shadow-lg uppercase border-4 border-[#3e2723] z-50">Más Popular</div>
                                            </>
                                        )}
                                        <div className="relative z-10 flex flex-col h-full">
                                            <h3 className={`font-serif text-[1.8rem] font-bold mb-8 uppercase ${isPopular ? 'text-white' : 'text-[#3e2723]'}`}>{plan.name}</h3>

                                            {Number(plan.price) === 0 ? (
                                                <div className={`text-3xl font-extrabold font-serif mb-10 h-[60px] flex items-center ${isPopular ? 'text-white' : 'text-[#3e2723]'}`}>
                                                    Consultar Precio
                                                </div>
                                            ) : (
                                                <div className="mb-10 flex items-baseline gap-2 h-[60px] items-center">
                                                    <span className={`text-5xl font-bold font-serif ${isPopular ? 'text-white' : 'text-[#3e2723]'}`}>${Number(plan.price).toFixed(2)}</span>
                                                    <span className={`text-lg font-sans font-medium ${isPopular ? 'text-white/60' : 'text-[#3e2723]/60'}`}>/mes</span>
                                                </div>
                                            )}
                                            <ul className="space-y-5 mb-12 flex-1 relative z-10">
                                                {plan.features.map((feature: string, i: number) => (
                                                    <li key={i} className={`flex items-start gap-4 font-medium ${isPopular ? 'text-white/90' : 'text-[#3e2723]/80'}`}>
                                                        <span className={`material-symbols-outlined mt-0.5 ${isPopular ? 'text-[#e6ceba]' : 'text-[#869c8a]'}`}>check_circle</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            <a
                                                href={`https://wa.me/51941147507?text=Hola%2C%20estoy%20interesado%20en%20el%20plan%20*${encodeURIComponent(plan.name)}*%20(%24${plan.price}%2Fmes).%20Me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full py-4 rounded-full font-bold transition-all duration-300 relative z-10 text-center ${isPopular
                                                    ? 'bg-[#e6ceba] text-[#3e2723] hover:bg-white shadow-xl hover:shadow-black/30'
                                                    : 'bg-white border border-[#3e2723]/20 text-[#3e2723] hover:bg-[#3e2723] hover:text-[#e8ecef] hover:border-[#3e2723] shadow-sm'
                                                    }`}
                                            >
                                                Elegir {plan.name}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
