import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

interface AdminPlansOnboardingProps {
    tenantName: string;
    tenantPlan: string;
    trialEndsAt?: string | null;
    trialUsed?: boolean;
    onTrialActivated?: (data: { trialEndsAt?: string | null; trialUsed?: boolean }) => void;
}

export const AdminPlansOnboarding: React.FC<AdminPlansOnboardingProps> = ({ tenantName, tenantPlan, trialEndsAt, trialUsed, onTrialActivated }) => {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [trialMessage, setTrialMessage] = useState('');
    const [trialError, setTrialError] = useState('');
    const [plansError, setPlansError] = useState('');

    const VENDOR_PHONE = '51941147507';
    const OWNER_PHONE = '51941147507';

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setPlansError('');
                const res: any = await api.get('/plans');
                if (res.success) {
                    setPlans(res.data);
                    return;
                }
            } catch (error: any) {
                console.error('Error fetching plans:', error.message);
                setPlansError(error.message || 'No se pudo cargar la lista completa de planes.');
                // Fallback to active plans if full list is not accessible
                try {
                    const resActive: any = await api.get('/plans/active');
                    if (resActive.success) {
                        setPlans(resActive.data);
                    }
                } catch (fallbackError: any) {
                    console.error('Error fetching active plans:', fallbackError.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const displayPlans = useMemo(() => {
        const base = Array.isArray(plans) ? [...plans] : [];
        const hasTrial = base.some((p) => String(p?.name || '').toLowerCase().includes('prueba gratuita'));
        if (!hasTrial) {
            base.push({
                id: 'trial',
                name: 'Prueba gratuita',
                price: 0,
                features: [
                    'Acceso completo por tiempo limitado',
                    'Sin tarjeta de credito',
                    'Soporte para activar tu cuenta',
                ],
                isTrial: true,
            });
        }
        return base;
    }, [plans]);

    const shopLabel = tenantName || 'mi peluqueria';
    const vendorText = `Hola, soy de ${shopLabel}. Quiero solicitar la prueba gratuita. ¿Me ayudan a activarla?`;
    const ownerText = `Hola, soy de ${shopLabel}. Quiero contactar al dueño de la pagina para mas informacion.`;
    const now = Date.now();
    const trialEndsAtMs = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
    const trialActive = trialEndsAtMs ? trialEndsAtMs > now : false;
    const trialExpired = !!trialUsed && !!trialEndsAtMs && trialEndsAtMs <= now;
    const trialEndsLabel = trialEndsAtMs ? new Date(trialEndsAtMs).toLocaleDateString('es-ES') : '';

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Planes</h2>
                    <p className="text-gray-500 mt-1">Elige el plan ideal para tu negocio.</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        {tenantName && (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                {tenantName}
                            </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700">
                            Plan: {tenantPlan || 'SIN PLAN'}
                        </span>
                    </div>
                    {(trialMessage || trialError || plansError) && (
                        <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${trialError || plansError ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {trialError || plansError || trialMessage}
                        </div>
                    )}
                </div>

                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`https://wa.me/${VENDOR_PHONE}?text=${encodeURIComponent(vendorText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border border-green-200 text-green-700 hover:bg-green-50 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-green-600">support_agent</span>
                                Contactar vendedor
                            </a>
                    <a
                        href={`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(ownerText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-500/30"
                    >
                        <span className="material-symbols-outlined">person</span>
                        Contactar dueño
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-20 text-gray-500 font-bold text-lg">
                        Cargando planes...
                    </div>
                ) : displayPlans.length === 0 ? (
                    <div className="col-span-3 text-center py-20 text-gray-500 font-bold text-lg">
                        No hay planes activos en este momento.
                    </div>
                ) : (
                    displayPlans.map((plan, index) => {
                        const isPopular = index === 1;
                        const planName = String(plan.name || '');
                        const isEnterprise = planName.toLowerCase().includes('enterprise');
                        const isTrial = !!plan.isTrial;
                        const showTrial = isTrial && !isEnterprise;

                        return (
                            <div
                                key={plan.id}
                                className={`rounded-3xl border p-8 shadow-sm flex flex-col relative transition-all ${isPopular
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                                    : 'bg-white border-gray-100 hover:shadow-md'}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow">
                                        Mas popular
                                    </div>
                                )}
                                {showTrial && (
                                    <div className="absolute -top-4 -left-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow">
                                        Prueba
                                    </div>
                                )}

                                <h3 className={`text-2xl font-black uppercase mb-4 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>

                                {isEnterprise ? (
                                    <div className="mb-6 flex items-center gap-3">
                                        <span className={`text-3xl font-extrabold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                            Consultar con dueño
                                        </span>
                                    </div>
                                ) : showTrial ? (
                                    <div className="mb-6 flex items-center gap-3">
                                        <span className={`text-3xl font-extrabold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                            Prueba gratuita
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isPopular ? 'bg-white/15 text-white' : 'bg-green-100 text-green-700'}`}>
                                            0 / mes
                                        </span>
                                    </div>
                                ) : Number(plan.price) === 0 ? (
                                    <div className="mb-6 flex items-center gap-3">
                                        <span className={`text-3xl font-extrabold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                            Consultar precio
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mb-6 flex items-baseline gap-2">
                                        <span className={`text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                            ${Number(plan.price).toFixed(2)}
                                        </span>
                                        <span className={`${isPopular ? 'text-white/60' : 'text-gray-500'}`}>/mes</span>
                                    </div>
                                )}

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature: string, i: number) => (
                                        <li key={i} className={`flex items-start gap-2 text-sm font-medium ${isPopular ? 'text-white/85' : 'text-gray-700'}`}>
                                            <span className={`material-symbols-outlined text-base ${isPopular ? 'text-green-300' : 'text-green-500'}`}>check_circle</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {showTrial ? (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (trialActive) return;
                                            if (trialExpired) return;
                                            try {
                                                setTrialError('');
                                                setTrialMessage('');
                                                const res: any = await api.patch('/auth/trial', {});
                                                const nextEndsAt = res?.data?.trialEndsAt || null;
                                                const nextUsed = res?.data?.trialUsed ?? true;
                                                onTrialActivated?.({ trialEndsAt: nextEndsAt, trialUsed: nextUsed });
                                                if (nextEndsAt) {
                                                    const label = new Date(nextEndsAt).toLocaleDateString('es-ES');
                                                    setTrialMessage(`Prueba gratuita activada. Vence el ${label}.`);
                                                } else {
                                                    setTrialMessage('Prueba gratuita activada.');
                                                }
                                            } catch (err) {
                                                console.error('Error activating trial', err);
                                                setTrialError('No se pudo activar la prueba. Intenta nuevamente.');
                                            }
                                        }}
                                        className={`w-full py-3 rounded-xl font-bold text-center transition-all ${isPopular
                                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'} ${trialActive || trialExpired ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        disabled={trialActive || trialExpired}
                                    >
                                        {trialActive
                                            ? `Prueba activa hasta ${trialEndsLabel}`
                                            : trialExpired
                                                ? 'Prueba gratuita terminada'
                                                : 'Activar prueba'}
                                    </button>
                                ) : (
                                    <a
                                        href={`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(`Hola, soy de ${shopLabel}. Estoy interesado en el plan ${plan.name}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-3 rounded-xl font-bold text-center transition-all ${isPopular
                                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                    >
                                        {isEnterprise ? 'Contactar dueño' : `Elegir ${plan.name}`}
                                    </a>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
