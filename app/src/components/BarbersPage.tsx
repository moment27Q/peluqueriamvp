import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface BarbersPageProps {
    onNavigate: (page: string) => void;
}

const BARBERS_DATA = [
    {
        id: 1,
        name: "Julian 'The Blade'",
        role: "Senior Master Barber",
        exp: "12 AÑOS EXP.",
        tags: ["Master of Fades", "Hair Tattoo"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbo33S6pN-nNoKYgHS2_UISQFVHAycCHKf2hefUlo5FZG_L1IRnl51LEgJLM49C4PBlsmmjLn3sZMa73SYgziLWcDnPQwgS9DDzbIUAejom9hNVq0rSNdMSUng1CrvX3Fm4VbMCvElaiCIovbsmJbjc1meQWPOs2fbaALErPkxImAN8OWPlffCkC5KjN-UWYsRnwedCDPQkjHDn6YeL8ixjPUiSm5JZCDc4W3AyObAQUgqPY8hcAdaWoJKqpA6SkUjg24VriDXMgrF"
    },
    {
        id: 2,
        name: "Adrian Valencia",
        role: "Afeitado Tradicional",
        exp: "10 AÑOS EXP.",
        tags: ["Razor Shave", "Beard Sculpt"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDsI1AwrSOst-YtFJMyBnLaV-l4NsUO5_ZX3y-Zf5zi1leTpL3uFvvlKNKLM74WGMgC8EA6aTbh6vkH2wSC2QL_Hvr_cl9HeT1Coh_xcVj8BYJIm9YvTB9hBHQ1opptHoOptx-89695ahrktP0Kva53b6Gd7RGvOs71TsrYIah_M8LAF0Vy3Id0xyupd0sn_QGQjC7DhjHC8gtFtMNgqkG42ZvoHYAixonYvxefJzRxbj1zeKCoc9FOrRDIdn17x16OKCFHeLIdMI7"
    },
    {
        id: 3,
        name: "Mateo Reyes",
        role: "Modern Stylist",
        exp: "8 AÑOS EXP.",
        tags: ["Scissor Work", "Texturing"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXq5lP55ujbwkRAWtiADwaKQZCAKbfUMl74wFIl7VFSiV2xuTv3T814L5eAXo681Cvp_GCBqh0GtUPLmmpQQ62uB6fAE_UgZB7fp1CtOw0UZBd4zrzC4rTyheQK9OyRpHmUcbN2X2ZFEde-PUPv7oha6rjtIbjcj3nn4x84QRcMZSqMVUkiVxrfaP6n__0t0umRIRcjvZdzrG2M3--efaO0n7Q270deyabr35FJi0qnjhgMzsaCDqLeeMhZqxfHpx2L7nGw7zd4th0"
    },
    {
        id: 4,
        name: "Lucas Smith",
        role: "Shop Manager & Master",
        exp: "15 AÑOS EXP.",
        tags: ["Total Looks", "Education"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcOJQ12GQvfrKoJJ3F7kD9Gt9inh4C_v6E5nI2g6BhqlO8JMxgzvgFvyyIFPe6brCuwn68B6gMti_DkqoKwpcs88d01mmWgA1AYObypgGJdDShd6-sbxSdQKGMobfmHYNrWjcbP274EQ3UgN5YN5u8oSyGOpIJ3cHf5SlPV8VsIuUR5Jvac_jXYh-JUvrXFSo9oTwS2Eeasf9aemlf02xZE_T7y-at3GU61MKwPpEci0utnGjbJD9FIB5KRnxVbsOgjQ3915OygkSy"
    }
];

const FILTERS = ['TODOS', 'EXPERTO EN FADES', 'AFEITADO CLÁSICO', 'CORTE DE TIJERA'];

export const BarbersPage: React.FC<BarbersPageProps> = ({ onNavigate }) => {
    const [selectedSpecialty, setSelectedSpecialty] = useState('TODOS');

    const filteredBarbers = BARBERS_DATA.filter(barber => {
        if (selectedSpecialty === 'TODOS') return true;

        const tagsString = barber.tags.join(' ').toLowerCase();
        const roleString = barber.role.toLowerCase();

        if (selectedSpecialty === 'EXPERTO EN FADES') return tagsString.includes('fades') || roleString.includes('fades');
        if (selectedSpecialty === 'AFEITADO CLÁSICO') return tagsString.includes('shave') || roleString.includes('afeitado');
        if (selectedSpecialty === 'CORTE DE TIJERA') return tagsString.includes('scissor') || roleString.includes('stylist');

        return true;
    });

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white text-gray-900 antialiased font-display">
            <Header onNavigate={onNavigate} />

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12 lg:px-10 pt-32">
                {/* Hero Header Section */}
                <div className="mb-12 flex flex-col items-center text-center fade-up visible">
                    <span className="mb-2 inline-block rounded-full border border-green-200 bg-green-50 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        Maestros del Oficio
                    </span>
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                        Nuestros <span className="text-primary">Barberos</span>
                    </h2>
                    <div className="mt-4 h-1 w-24 rounded-full bg-primary/30"></div>
                </div>
                {/* Filters */}
                <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedSpecialty(filter)}
                            className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all transform hover:scale-105 ${selectedSpecialty === filter
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                {/* Barbers Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredBarbers.map((barber) => (
                        <div key={barber.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                                <img alt={`Portrait of ${barber.name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={barber.image} />
                                <div className="absolute right-3 top-3 rounded-md bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-black text-gray-900 shadow-sm border border-gray-100">
                                    {barber.exp}
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col pt-5 pb-2">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{barber.name}</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{barber.role}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {barber.tags.map((tag, index) => (
                                        <span key={index} className="text-[10px] border border-gray-100 px-2 py-1 rounded-md text-gray-500 bg-gray-50 font-semibold">{tag}</span>
                                    ))}
                                </div>
                                <button className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/25">
                                    RESERVAR
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};
