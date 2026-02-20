import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface TermsPageProps {
    onNavigate: (page: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
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

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Términos de Servicio</h1>
                    <p className="text-sm text-gray-500 mb-10">Última actualización: 19 de febrero de 2026</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Uso de la plataforma</h2>
                            <p>
                                Esta plataforma permite gestionar reservas, servicios y comunicación entre clientes, barberos y administradores del salón.
                                Al usarla, aceptas utilizarla de forma legal y respetuosa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Cuentas y acceso</h2>
                            <p>
                                Cada usuario es responsable de mantener segura su contraseña y la información de su cuenta.
                                El acceso es personal y no debe compartirse con terceros.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Reservas y pagos</h2>
                            <p>
                                Las reservas están sujetas a disponibilidad. Los montos mostrados se expresan en soles (S/).
                                El salón puede actualizar precios y políticas de cancelación cuando sea necesario.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Conducta y restricciones</h2>
                            <p>
                                No está permitido usar la plataforma para actividades fraudulentas, suplantación de identidad o cualquier uso que afecte el servicio.
                                El incumplimiento puede generar suspensión de la cuenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Cambios en los términos</h2>
                            <p>
                                Estos términos pueden actualizarse para mejorar el servicio o cumplir requisitos legales.
                                Las nuevas versiones estarán disponibles en esta misma sección.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
