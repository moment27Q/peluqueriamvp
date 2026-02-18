import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface HelpCenterPageProps {
    onNavigate: (page: string) => void;
}

const categories = [
    {
        icon: 'event',
        title: 'Citas',
        description: 'Gestion de reservas, cambios y cancelaciones de horario.',
    },
    {
        icon: 'auto_awesome',
        title: 'Servicios',
        description: 'Informacion detallada sobre cortes, color y tratamientos.',
    },
    {
        icon: 'payments',
        title: 'Precios',
        description: 'Tarifas vigentes, paquetes especiales y metodos de pago.',
    },
    {
        icon: 'shield',
        title: 'Mi Cuenta',
        description: 'Perfil, historial de servicios y puntos de fidelidad.',
    },
];

const faqItems = [
    {
        question: 'Como puedo cancelar o reprogramar mi cita?',
        answer:
            'Puedes cancelar o reprogramar tu cita directamente desde la seccion "Mi Cuenta" o a traves del enlace en tu correo de confirmacion con al menos 24 horas de antelacion para evitar cargos adicionales.',
    },
    {
        question: 'Que tipo de productos utilizan para el cuidado del cabello?',
        answer:
            'Trabajamos con lineas profesionales para distintos tipos de cabello, incluyendo opciones hidratantes, reparadoras y libres de sulfatos.',
    },
    {
        question: 'Ofrecen servicios para eventos especiales o bodas?',
        answer:
            'Si, contamos con paquetes para novias, eventos sociales y producciones especiales con agendamiento previo.',
    },
    {
        question: 'Como funciona el programa de puntos Elite?',
        answer:
            'Acumulas puntos por cada servicio realizado y puedes canjearlos por descuentos, upgrades o beneficios exclusivos.',
    },
];

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onNavigate }) => {
    const [openFaq, setOpenFaq] = useState(0);

    return (
        <div className="min-h-screen bg-[#f5f6f5] text-gray-900 font-sans">
            <Header onNavigate={onNavigate} />

            <main className="pt-20">
                <section className="border-b border-[#e4eee1] bg-[#e9f1e7]">
                <div className="mx-auto w-full max-w-7xl px-6 py-16">
                    <div className="mx-auto max-w-4xl text-center">
                        <p className="mx-auto mb-6 inline-flex rounded-full bg-[#d8ecd0] px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#57bf28]">
                            Soporte al cliente
                        </p>
                        <h2 className="mb-8 text-4xl font-extrabold tracking-tight md:text-6xl">En que podemos ayudarte hoy?</h2>
                        <div className="flex h-16 items-center rounded-2xl border border-[#d7e7d1] bg-white px-5 shadow-sm">
                            <span className="material-symbols-outlined text-[#6ecf3b]">search</span>
                            <input
                                type="text"
                                placeholder="Busca temas, servicios o dudas frecuentes..."
                                className="h-full w-full bg-transparent pl-3 text-lg text-gray-700 placeholder:text-gray-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
                </section>

                <section className="mx-auto w-full max-w-7xl px-6 py-14">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {categories.map((category) => (
                        <article key={category.title} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e8f3e3]">
                                <span className="material-symbols-outlined text-[#6ccb3b]">{category.icon}</span>
                            </div>
                            <h3 className="mb-3 text-3xl font-bold tracking-tight">{category.title}</h3>
                            <p className="text-sm leading-relaxed text-gray-500">{category.description}</p>
                        </article>
                    ))}
                </div>
                </section>

                <section className="bg-white py-20">
                <div className="mx-auto w-full max-w-4xl px-6">
                    <div className="mb-10 text-center">
                        <h3 className="text-5xl font-extrabold tracking-tight">Preguntas Frecuentes</h3>
                        <p className="mt-4 text-gray-500">Encuentra respuestas rapidas a las dudas mas comunes de nuestra comunidad.</p>
                    </div>

                    <div className="space-y-4">
                        {faqItems.map((item, index) => {
                            const isOpen = index === openFaq;
                            return (
                                <article key={item.question} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        className="flex w-full items-center justify-between px-7 py-6 text-left"
                                    >
                                        <span className="text-2xl font-semibold tracking-tight">{item.question}</span>
                                        <span className="material-symbols-outlined text-gray-500">
                                            {isOpen ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>
                                    {isOpen && (
                                        <p className="border-t border-gray-100 px-7 pb-6 pt-5 text-lg leading-relaxed text-gray-600">
                                            {item.answer}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </div>
                </section>

                <section className="px-6 pb-20 pt-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-[#dcead6] bg-[#e9f1e7] px-8 py-14 text-center">
                    <h3 className="text-5xl font-extrabold tracking-tight">Aun necesitas ayuda?</h3>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                        Nuestro equipo de atencion personalizada esta disponible para resolver cualquier duda especifica que no hayas encontrado en esta seccion.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button className="inline-flex min-w-60 items-center justify-center gap-2 rounded-xl bg-[#25d366] px-6 py-3.5 text-sm font-bold text-white">
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                            WhatsApp Directo
                        </button>
                        <button className="inline-flex min-w-60 items-center justify-center gap-2 rounded-xl bg-[#101a0c] px-6 py-3.5 text-sm font-bold text-white">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                            Correo Electronico
                        </button>
                    </div>
                </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
