import React from 'react';

interface HeaderProps {
    onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
                    <div className="text-primary transition-transform duration-300 group-hover:rotate-12">
                        <span className="material-symbols-outlined text-4xl">content_cut</span>
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tighter uppercase text-gray-900">
                        mi <span className="text-primary font-light">pagina.com</span>
                    </h2>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <button onClick={() => onNavigate('services')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Servicios</button>
                    <button onClick={() => onNavigate('barbers')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Barberos</button>
                    <button onClick={() => onNavigate('admin-help')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Centro de Ayuda</button>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('login')} className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                        Entrar
                    </button>
                </div>
            </div>
        </header>
    );
};
