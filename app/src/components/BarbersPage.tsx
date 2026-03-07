import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface BarbersPageProps {
    onNavigate: (page: string) => void;
}

export const BarbersPage: React.FC<BarbersPageProps> = ({ onNavigate }) => {

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f8f9fa] text-slate-900 antialiased font-display">
            <Header onNavigate={onNavigate} />

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12 lg:px-10 pt-32 lg:pt-40 min-h-[60vh]">
                {/* Hero Header Section */}
                <div className="mb-16 flex flex-col items-start text-left max-w-2xl px-2 fade-up visible">
                    <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#ea580c]">
                        Exclusividad Garantizada
                    </span>
                    <h2 className="text-5xl md:text-6xl font-light tracking-tight text-[#1e293b] leading-[1.1]">
                        Nuestras <span className="font-serif italic text-slate-400">Marcas <br /></span>
                    </h2>
                    <p className="mt-6 text-slate-500 font-medium text-[1.05rem] leading-relaxed">
                        Nuestra red de excelencia: Trabajamos exclusivamente con las firmas de cuidado capilar más prestigiosas a nivel mundial, para llevar la experiencia en tu salón a niveles de calidad sin precedentes.
                    </p>
                </div>

                {/* Grid Content */}
                <div className="flex-1 w-full pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 px-2">
                        {/* Brand 1 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop" alt="Kérastase" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Kérastase</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">LUXURY CARE</p>
                        </div>

                        {/* Brand 2 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500&auto=format&fit=crop" alt="L'Oréal Professional" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">L'Oréal Professional</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">EXPERT COLOR</p>
                        </div>

                        {/* Brand 3 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=500&auto=format&fit=crop" alt="Oribe" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Oribe</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">ARTISANAL LUXURY</p>
                        </div>

                        {/* Brand 4 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=500&auto=format&fit=crop" alt="Olaplex" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Olaplex</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">BOND BUILDING</p>
                        </div>

                        {/* Brand 5 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=500&auto=format&fit=crop" alt="Redken" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Redken</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">SCIENTIFIC COLOR</p>
                        </div>

                        {/* Brand 6 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=500&auto=format&fit=crop" alt="Wella" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Wella</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">SALON HERITAGE</p>
                        </div>

                        {/* Brand 7 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6">
                                <img src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=500&auto=format&fit=crop" alt="Moroccanoil" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-sm" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Moroccanoil</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">OIL-INFUSED CARE</p>
                        </div>

                        {/* Brand 8 */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                            <div className="aspect-square bg-[#f8f9fa] rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6 bg-white">
                                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=500&auto=format&fit=crop" alt="Dyson Professional" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 shadow-md" />
                            </div>
                            <h3 className="font-bold text-[#1e293b] text-xl mb-1.5 tracking-tight">Dyson Professional</h3>
                            <p className="text-[#ea580c] text-[10px] font-bold tracking-[0.15em] uppercase">PRECISION TECH</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
