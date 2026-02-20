import React from 'react';

const faqItems = [
    {
        title: 'No me deja iniciar sesión',
        answer: 'Verifica email y contraseña. Si aparece token expirado, cierra sesión y vuelve a entrar.',
    },
    {
        title: 'No aparecen servicios o equipo',
        answer: 'Confirma que estás en la cuenta admin y que backend está corriendo en http://localhost:3001.',
    },
    {
        title: 'Error al procesar venta',
        answer: 'Revisa que hayas seleccionado peluquero y al menos un servicio en el carrito.',
    },
    {
        title: 'Reportes en cero',
        answer: 'Haz una venta de prueba y recarga. Si sigue en cero, revisa conexión con la base de datos.',
    },
];

export const AdminHelpCenter: React.FC = () => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Centro de Ayuda</h2>
                <p className="text-gray-500 mt-1">Soporte rápido para dashboard, ventas, servicios y reportes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Inicio Rápido</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>1. Crea equipo en la sección Equipo.</li>
                        <li>2. Crea tipos de servicio en Servicios.</li>
                        <li>3. Registra ventas desde Ventas.</li>
                        <li>4. Revisa métricas en Dashboard y Reportes.</li>
                    </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Atajos Útiles</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>Actualización rápida: registrar venta refresca dashboard automáticamente.</li>
                        <li>Exportación: en Reportes puedes descargar PDF y Excel.</li>
                        <li>Filtros: usa rango de fecha para analizar periodos.</li>
                    </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Contacto Soporte</h3>
                    <p className="text-sm text-gray-600 mb-2">Canales recomendados para incidencias:</p>
                    <p className="text-sm font-semibold text-gray-800">Email: oropezafernando07@gmail.com</p>
                    <p className="text-sm font-semibold text-gray-800">WhatsApp: +51 941 147 507</p>
                    <p className="text-xs text-gray-400 mt-2">Horario: Lun a Vie, 09:00 a 18:00</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Preguntas Frecuentes</h3>
                <div className="space-y-4">
                    {faqItems.map((item) => (
                        <div key={item.title} className="rounded-xl border border-gray-100 p-4 bg-gray-50/60">
                            <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                            <p className="text-sm text-gray-600">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
