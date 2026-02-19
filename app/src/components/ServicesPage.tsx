import { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { api } from '../services/api';

interface ServiceType {
    id: string;
    name: string;
    description?: string;
    defaultPrice: number | string;
    durationMinutes?: number;
    isActive: boolean;
}

interface ServicesPageProps {
    onNavigate: (page: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
    const [services, setServices] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('TODOS');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get<{ data: ServiceType[] }>('/services/types/public');
                const data = response.data;
                if (Array.isArray(data)) {
                    setServices(data);
                }
            } catch (err: any) {
                console.error('Error fetching services:', err);
                // Fallback to empty or specific error handling if needed
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const filteredServices = services.filter(service => {
        if (selectedCategory === 'TODOS') return true;
        // Simple keyword matching for demo purposes since we don't have a category field in DB yet
        const lowerName = service.name.toLowerCase();
        if (selectedCategory === 'CABELLO') return lowerName.includes('corte') || lowerName.includes('cabello') || lowerName.includes('pelo');
        if (selectedCategory === 'BARBA') return lowerName.includes('barba') || lowerName.includes('afeitado');
        if (selectedCategory === 'FACIAL') return lowerName.includes('facial') || lowerName.includes('mascarilla') || lowerName.includes('limpieza');
        return true;
    });

    // Helper to get image based on service name (mock logic for demo purposes since we don't have real images in DB yet)
    const getServiceImage = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('barba')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuDGkCrmleZOjEeF6cc4ntgwc5rdjoaFdHGlFEnclffXvspMYsfNuFoI6goG4a4ZRhCzPKpJyH-nNaOWzFwHLJ07qZVaREp60W16ya-xtmzlpyPqpvC5rIbVmteYu4zim-3brekR18FqMC9oS1KOE1WtOBbccH3dHCbA8WBVr4U4GbNlE5EChWof2J47Lx2xIN_dXafhR_RIcb6L-qmz7ESKtyR2yZe1bki1EulE5LyAKDDMCgGMU496t-r73awY1zj2N7W3zmhA_faF";
        if (lowerName.includes('afeitado')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuBH73aoZHbyC9SuRJaQMNNLqgrX2d8lW1VtfKxZihTX3nUsXglJMzY8uNlWO0BY3Xz84AxB1yYHOb1knr8PLvlMZdztfbRRh9EVRZBrykb2jLes_K4Pu1i1B40Brhf9gEgrbrQ-cyWmyv9sdj-8I5MLDnKKCMLRg3XeM3v243gicg94iFlpv0GjY90IEB0pRTC7Mx781oNmdhsZD4EfXVPLDmJVvAbav9Tws2Jw-41CBZWcxXfhTDC80OvFIQrF5gdssFxz5EK1gaB5";
        if (lowerName.includes('facial')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuApLcfz_wVBeGYJTm-kcNv0sxhroqQyzYt9PLIkVxA35qhuY1A6cPXdiiHdocI6ZpAcefey2zLATmFr4-H6-ZqqhOj350HEqU2XkU1KCbX8TWIpPIzb6P4djdb3DyeUabz5Tsjkn2Re6SCT9qk_q1A_QX_EuI6yhyrwVdPFV0braCKjh8sDNrlKaAlJCLPJIJmRrDpfj_DPfUe3M4MpFAoEADWWRG3eKA-HIBe8CTkLSFJLKBNEsnX8O8rjZGmBQKctNOGYlKxgGcZM";
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuDsi0sAxTmzmz0qv0_qaoySoEv00KlJ8l92v1buCdowbJ4zAmHLTXbZS9-SY77hclQRigoFSSM7BDDmzBWmefdMe_bcWQmtXrPqeoeSMz-k0CkbejF34uXx7Ws3w91OWU9HENNfiFT-LRFctexkaMBHZuN44Kdt5gKR2wLyNEXivBED-WVYIsQe6_vxj2lIxpeQygtQtqOk3YgtCNeugmmJ9uSk2mwIYYADRyVbxjXvDa85o1prwfNeEy3mMGfShY8oxC8hdZp9UHJU"; // Default
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-white overflow-x-hidden font-display text-gray-900 selection:bg-primary/30">
            {/* Navigation */}
            <Header onNavigate={onNavigate} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-20 py-12 pt-32">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4 fade-up visible">
                    <p className="text-primary text-xs font-bold uppercase tracking-[0.4em] bg-green-50 inline-block px-3 py-1 rounded-full border border-green-100">Experiencia de Lujo</p>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-gray-900">Nuestros Servicios</h1>
                    <div className="flex justify-center items-center gap-4 max-w-md mx-auto">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary/40"></div>
                        <span className="material-symbols-outlined text-primary">star</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary/40"></div>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex justify-center mb-12 border-b border-gray-100 overflow-x-auto no-scrollbar">
                    <div className="flex gap-12 pb-4">
                        {['TODOS', 'CABELLO', 'BARBA', 'FACIAL'].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`relative text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${selectedCategory === category ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                {category}
                                {selectedCategory === category && (
                                    <span className="absolute -bottom-[17px] left-0 w-full h-[3px] bg-primary"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredServices.map((service) => (
                            <div key={service.id} className="bg-white border border-gray-100 hover:border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 group transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5">
                                <div className="w-full sm:w-40 aspect-square overflow-hidden rounded-xl">
                                    <img
                                        src={getServiceImage(service.name)}
                                        alt={service.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold tracking-tight text-gray-900">{service.name}</h3>
                                            <span className="text-primary font-bold text-lg">S/ {Number(service.defaultPrice)}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                            {service.description || 'Consulta los detalles con tu barbero.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                                            {service.durationMinutes ? `${service.durationMinutes} Minutos` : 'Duración Variable'}
                                        </span>
                                        <button className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-tighter hover:gap-3 transition-all">
                                            Reservar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

