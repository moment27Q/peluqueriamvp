import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface PrivacyPageProps {
    onNavigate: (page: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Header onNavigate={onNavigate} />

            <main className="flex-grow pt-28 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline mb-6"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Volver al inicio
                    </button>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Política de Privacidad</h1>
                    <p className="text-sm text-gray-500 mb-10">Última actualización: 19 de febrero de 2026</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Datos que recopilamos</h2>
                            <p>
                                Podemos recopilar datos como nombre, correo electrónico, teléfono, historial de reservas y datos operativos del salón para ofrecer el servicio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Uso de la información</h2>
                            <p>
                                Usamos tus datos para gestionar citas, mejorar la experiencia, brindar soporte y enviar notificaciones relacionadas al servicio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Compartición de datos</h2>
                            <p>
                                No vendemos información personal. Solo compartimos datos cuando es necesario para operar la plataforma o por obligación legal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Seguridad</h2>
                            <p>
                                Aplicamos medidas técnicas y organizativas razonables para proteger la información.
                                Aun así, ningún sistema en internet es 100% infalible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Tus derechos</h2>
                            <p>
                                Puedes solicitar acceso, corrección o eliminación de tus datos personales. Para ello, escríbenos a nuestro canal de soporte.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
