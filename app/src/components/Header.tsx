import React, { useState } from 'react';

interface HeaderProps {
    onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [showCreateAccount, setShowCreateAccount] = useState(false);

    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
                        <img
                            src="/images/logo-izichamba.png"
                            alt="Izichamba"
                            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => onNavigate('services')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Servicios</button>
                        <button onClick={() => onNavigate('plans')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Planes</button>
                        <button onClick={() => onNavigate('admin-help')} className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Centro de Ayuda</button>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowCreateAccount(true)}
                            className="border border-primary text-primary text-sm font-bold px-6 py-2.5 rounded-lg transition-all hover:bg-primary/10"
                        >
                            Crear cuenta
                        </button>
                        <button onClick={() => onNavigate('login')} className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                            Entrar
                        </button>
                    </div>
                </div>
            </header>

            {showCreateAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                        <button
                            onClick={() => setShowCreateAccount(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                            aria-label="Cerrar modal"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-2xl font-black text-gray-900 mb-2">Crear cuenta</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Elige una opcion para comenzar. Tambien puedes ver los planes disponibles antes de registrarte.
                        </p>

                        <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setShowCreateAccount(false);
                                onNavigate('register');
                            }}
                            className="w-full px-5 py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all"
                        >
                            Crear cuenta
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateAccount(false);
                                    onNavigate('plans');
                                }}
                                className="w-full px-5 py-3 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Ver planes
                            </button>
                            <button
                                onClick={() => setShowCreateAccount(false)}
                                className="w-full px-5 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
