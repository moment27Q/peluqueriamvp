import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface ServicesPageProps {
    onNavigate: (page: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
    const services = [
        {
            title: 'Agenda de Citas Online',
            description: 'Tus clientes reservan 24/7 desde su celular. Confirmaciones automaticas, sin llamadas, sin confusiones.',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop',
            alt: 'Gestion de Reservas'
        },
        {
            title: 'Gestion de Empleados',
            description: 'Registra a tu equipo, asigna turnos, controla asistencia y mide el rendimiento de cada uno sin esfuerzo.',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop',
            alt: 'Persona cortando el pelo'
        },
        {
            title: 'Cobros y Facturacion',
            description: 'Cobra en caja o envia un link de pago al instante. Historial de ingresos siempre a la mano.',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
            alt: 'Cobros en caja'
        },
        {
            title: 'Control de Inventario',
            description: 'Sabe exactamente que productos tienes, cuando reponer y cuanto estas gastando en suministros.',
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=900&auto=format&fit=crop',
            alt: 'Productos'
        },
        {
            title: 'Recordatorios por WhatsApp',
            description: 'Reduce las ausencias enviando recordatorios automaticos a tus clientes antes de su cita.',
            image: '/images/recordatorios_img.png',
            alt: 'Recordatorios en el telefono'
        },
        {
            title: 'Reportes y Metricas',
            description: 'Visualiza el crecimiento de tu negocio con reportes claros: ventas, clientes frecuentes y servicios mas populares.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
            alt: 'Reportes y metricas'
        }
    ];

    return (
        <div
            className="relative flex min-h-screen w-full flex-col font-display text-gray-900 selection:bg-primary/30"
            style={{
                backgroundColor: '#d4ded6',
                backgroundImage: 'conic-gradient(from 90deg at 50% 50%, #e6ede8 25%, #dbe3dc 25%, #dbe3dc 50%, #e6ede8 50%, #e6ede8 75%, #dbe3dc 75%, #dbe3dc 100%)',
                backgroundSize: '50vw 50vw'
            }}
        >
            <Header onNavigate={onNavigate} />

            <main className="flex-1 relative z-10 w-full py-20 pb-32">
                {/* Top section */}
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center mb-16 lg:mb-32 mt-12 px-6 lg:px-0">
                    <div className="px-6 lg:pl-20 xl:pl-32 flex flex-col justify-center">
                        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] font-serif text-[#3e2723] mb-8 text-center relative z-20">
                            Servicios de <br />
                            <span className="italic text-[#2d1b18]">Autor para</span><br />
                            <span className="italic text-[#2d1b18]">Salones de</span><br />
                            Vanguardia
                        </h1>
                        <p className="text-[#3e2723]/80 text-[1.1rem] md:text-xl max-w-lg mx-auto text-center leading-relaxed mix-blend-color-burn font-medium relative z-20 pb-12 lg:pb-0">
                            Diseñamos soluciones tecnológicas con la misma precisión que un corte de autor. Arquitectura digital para elevar la experiencia de tu salón.
                        </p>
                    </div>
                    {/* Hero image with guaranteed minimum height */}
                    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[650px] overflow-hidden rounded-3xl lg:rounded-l-3xl lg:rounded-r-none shadow-2xl shadow-black/10">
                        <img
                            src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1000&auto=format&fit=crop"
                            alt="Interior del salón"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Servicios incluidos */}
                <div className="container mx-auto px-6 mb-24">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {services.map((service, index) => {
                            const isLastRowPair = services.length % 4 === 2 && index >= services.length - 2;
                            return (
                            <div
                                key={service.title}
                                className={`group flex flex-col ${isLastRowPair ? 'lg:col-span-2 lg:max-w-[420px] lg:justify-self-center' : ''}`}
                            >
                                <div className="bg-[#e9e9e9] rounded-3xl aspect-[4/5] mb-6 overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10">
                                    <img
                                        src={service.image}
                                        alt={service.alt}
                                        className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="font-serif text-[1.6rem] font-bold text-[#3e2723] mb-3">{service.title}</h3>
                                <p className="text-[#3e2723]/80 text-[0.95rem] leading-relaxed mix-blend-color-burn font-medium">
                                    {service.description}
                                </p>
                            </div>
                        )})}
                    </div>
                </div>

                {/* Call to action */}
                <div className="text-center max-w-3xl mx-auto py-12">
                    <h2 className="text-5xl md:text-[4.5rem] font-serif text-[#3e2723] leading-[1.05] mb-8">
                        ¿Listo para transformar <br />
                        <span className="italic text-[#2d1b18]">tu espacio de autor?</span>
                    </h2>
                    <p className="text-[#3e2723]/80 text-lg mb-12 mix-blend-color-burn max-w-2xl mx-auto font-medium leading-relaxed">
                        Permítenos mostrarte cómo la arquitectura digital puede elevar tu negocio a un nuevo nivel de excelencia y eficiencia.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-4">
                        <a
                            href="https://wa.me/51941147507?text=Hla%20quiero%20mas%20informacion%20sobre%20el%20servicio"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#e6ceba] text-[#3e2723] px-10 py-4 rounded-full font-serif text-lg font-bold transition-all duration-500 shadow-xl shadow-black/10 flex items-center gap-3 hover:-translate-y-2 hover:bg-[#d8bfac] hover:shadow-2xl hover:shadow-black/20"
                        >
                            Contáctanos ahora <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
