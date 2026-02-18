import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// --- Interfaces ---
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    commissionRate?: number | string;
}

interface ServiceType {
    id: string;
    name: string;
    defaultPrice: number | string;
    durationMinutes?: number;
    category?: string; // Mock category for now
    image?: string; // Mock image for now
}

interface CartItem {
    uniqueId: string; // To handle multiple instances of same service
    service: ServiceType;
    price: number;
}

type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

// --- Mock Data Helpers ---
const MOCK_CATEGORIES = ['Todos', 'Corte', 'Barba', 'Facial', 'Color'];

const getServiceImage = (name: string) => {
    const lower = name.toLowerCase();

    // Corte y Afeitado (Cut + Shave)
    if (lower.includes('corte') && lower.includes('afeitado')) {
        return 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?q=80&w=2070&auto=format&fit=crop';
    }

    // Afeitado (Shave)
    if (lower.includes('afeitado') || lower.includes('barba')) {
        return 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop';
    }

    // Tratamiento Capilar (Hair Treatment)
    if (lower.includes('capilar') || lower.includes('tratamiento')) {
        return 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2069&auto=format&fit=crop';
    }

    // Tinte / Color (Hair Dye)
    if (lower.includes('tinte') || lower.includes('color')) {
        return 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=1974&auto=format&fit=crop';
    }

    // Facial / Mascarilla
    if (lower.includes('facial') || lower.includes('mascarilla')) {
        return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2670&auto=format&fit=crop';
    }

    // Corte (Cut)
    if (lower.includes('corte')) {
        return 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?q=80&w=2070&auto=format&fit=crop';
    }

    // Default
    return 'https://images.unsplash.com/photo-1585747685350-31c2dc714ef0?q=80&w=2070&auto=format&fit=crop';
};



const getMockCategory = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('barba') || lower.includes('afeitado')) return 'Barba';
    if (lower.includes('facial') || lower.includes('mascarilla')) return 'Facial';
    if (lower.includes('tinte') || lower.includes('color') || lower.includes('capilar') || lower.includes('tratamiento')) return 'Color';
    return 'Corte';
};

export const AdminSales: React.FC = () => {
    // --- State ---
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // POS State
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
    const [clientName, setClientName] = useState('Cliente Casual');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [discountCode, setDiscountCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- Effects ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, servRes] = await Promise.all([
                    api.get<{ data: Employee[] }>('/employees'),
                    api.get<{ data: ServiceType[] }>('/services/types/all?includeInactive=false')
                ]);

                const loadedEmployees = Array.isArray(empRes.data) ? empRes.data : [];
                setEmployees(loadedEmployees);
                if (loadedEmployees.length > 0) setSelectedBarber(loadedEmployees[0].id);

                const loadedServices = (Array.isArray(servRes.data) ? servRes.data : []).map((s) => ({
                    ...s,
                    category: getMockCategory(s.name),
                    image: getServiceImage(s.name),
                    durationMinutes: 30 // Mock duration if missing
                }));
                setServiceTypes(loadedServices);
            } catch (err: any) {
                console.error('Error loading POS data:', err);
                setError('Error al cargar datos.');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // --- Helpers ---
    const filteredServices = serviceTypes.filter(s => {
        const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (service: ServiceType) => {
        setCart([...cart, {
            uniqueId: Math.random().toString(36).substr(2, 9),
            service,
            price: Number(service.defaultPrice)
        }]);
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(cart.filter(item => item.uniqueId !== uniqueId));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAfterDiscount = subtotal - discountAmount;

    const applyDiscountCode = () => {
        const parsed = Number(discountCode.replace(/[^\d.]/g, ''));
        if (!Number.isFinite(parsed)) {
            setError('Código de descuento inválido');
            return;
        }
        const normalized = Math.max(0, Math.min(100, parsed));
        setDiscountPercent(normalized);
        setError(null);
    };

    const handleCheckout = async () => {
        if (!selectedBarber) {
            setError('Selecciona un barbero');
            return;
        }
        if (cart.length === 0) {
            setError('El carrito está vacío');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Create a record for each service in the cart
            // Note: In a real app, we might want to group these into a single "Transaction" object,
            // but the current API seems to be service-record based.
            // We'll proceed by creating individual service records for now.

            const promises = cart.map(item => api.post('/services', {
                employeeId: selectedBarber,
                serviceTypeId: item.service.id,
                clientName: clientName,
                price: Number((item.price * (1 - discountPercent / 100)).toFixed(2)),
                notes: `Pago: ${paymentMethod}. Descuento aplicado: ${discountPercent}%`
            }));

            await Promise.all(promises);

            setSuccess('Venta registrada con éxito!');
            setCart([]);
            setClientName('Cliente Casual');
            setDiscountPercent(0);
            setDiscountCode('');
            window.dispatchEvent(new Event('sales:updated'));

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err?.message || 'Error al procesar la venta. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-8 text-gray-500">Cargando TPV...</div>;

    const selectedBarberObj = employees.find(e => e.id === selectedBarber);
    const selectedBarberCommissionRate = selectedBarberObj
        ? Number(selectedBarberObj.commissionRate ?? 50)
        : 0;
    const barberEarnings = totalAfterDiscount * (selectedBarberCommissionRate / 100);
    const total = totalAfterDiscount - barberEarnings;

    return (
        <div className="flex h-full bg-gray-50 overflow-hidden font-display">
            {/* LEFT PANEL - SERVICE SELECTION */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header / Search */}
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Nuevo Servicio</h1>
                        <p className="text-gray-500 text-sm">Selecciona los servicios para el cliente</p>
                    </div>

                    {/* Search & Categories */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96 group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Buscar servicios..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
                            {MOCK_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Barber Selection */}
                <div className="px-8 py-4 bg-white border-b border-gray-100 overflow-x-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Asignar Barbero</h3>
                    <div className="flex gap-4">
                        {employees.map(emp => (
                            <button
                                key={emp.id}
                                onClick={() => setSelectedBarber(emp.id)}
                                className={`flex flex-col items-center gap-2 group min-w-[80px] transition-all p-2 rounded-2xl ${selectedBarber === emp.id ? 'bg-primary/5 ring-2 ring-primary' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`size-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md relative overflow-hidden transition-transform group-hover:scale-105 ${selectedBarber === emp.id ? 'bg-primary' : 'bg-gray-300'}`}>
                                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                    {/* Mock Status Dot */}
                                    <div className="absolute bottom-0 right-0 size-3 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <span className={`text-xs font-bold truncate max-w-full ${selectedBarber === emp.id ? 'text-primary' : 'text-gray-600'}`}>
                                    {emp.firstName}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Service Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServices.map(service => (
                            <button
                                key={service.id}
                                onClick={() => addToCart(service)}
                                className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group text-left flex flex-col h-full"
                            >
                                <div className="aspect-[4/3] rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1585747685350-31c2dc714ef0?q=80&w=2070&auto=format&fit=crop';
                                            e.currentTarget.onerror = null;
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-black text-gray-900 shadow-sm">
                                        ${Number(service.defaultPrice).toFixed(0)}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-1">{service.name}</h3>
                                <p className="text-xs text-gray-500 mt-auto">{service.durationMinutes} min • {service.category}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - SUMMARY */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        <span>Resumen de Venta</span>
                        <span>ID: #{(Date.now() % 100000).toString().padStart(5, '0')}</span>
                    </div>
                    {/* Client Input */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block">Cliente</label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full bg-transparent font-bold text-gray-900 outline-none text-sm p-0 placeholder:text-gray-300"
                                placeholder="Nombre Cliente"
                            />
                        </div>
                        <button className="text-primary text-xs font-bold hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors">
                            Cambiar
                        </button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                            <span className="material-symbols-outlined text-6xl">shopping_cart_off</span>
                            <p className="text-sm font-medium text-center px-8">Selecciona servicios del menú para comenzar una orden</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.uniqueId} className="flex gap-4 group">
                                <img src={item.service.image} alt="" className="size-16 rounded-xl object-cover bg-gray-100" />
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.service.name}</h4>
                                        <span className="font-bold text-gray-900 text-sm ml-2">${item.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Barbero: {selectedBarberObj?.firstName || 'Sin asignar'}</p>
                                    <button
                                        onClick={() => removeFromCart(item.uniqueId)}
                                        className="text-[10px] font-bold text-red-500 mt-2 hover:bg-red-50 px-2 py-0.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                    {/* Discount */}
                    <div className="mb-6">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-3">
                            <span className="material-symbols-outlined text-sm">local_offer</span>
                            Aplicar Descuento
                        </h4>
                        <div className="flex gap-2">
                            {[0, 5, 10, 20].map(disc => (
                                <button
                                    key={disc}
                                    onClick={() => setDiscountPercent(disc)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${discountPercent === disc
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {disc === 0 ? '0%' : `${disc}%`}
                                </button>
                            ))}
                            <div className="relative flex-[2]">
                                <input
                                    type="text"
                                    placeholder="Código"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="w-full h-full px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    onClick={applyDiscountCode}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-500 text-white rounded-lg p-1 hover:bg-green-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 mb-6 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                            <span>Descuento ({discountPercent}%)</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-amber-600">
                            <span>Comisión ({selectedBarberCommissionRate.toFixed(0)}%)</span>
                            <span>-${barberEarnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                            <span>Gana {selectedBarberObj?.firstName || 'Peluquero'}</span>
                            <span>${barberEarnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-extrabold text-xl pt-2 border-t border-gray-100">
                            <span>Total a Pagar</span>
                            <span className="text-green-600">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === method
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="material-symbols-outlined mb-1">
                                    {method === 'EFECTIVO' ? 'payments' : method === 'TARJETA' ? 'credit_card' : 'account_balance'}
                                </span>
                                <span className="text-[10px] font-bold capitalize">{method.toLowerCase()}</span>
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl">{success}</div>}

                    {/* Actions */}
                    <button
                        onClick={handleCheckout}
                        disabled={submitting}
                        className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>PROCESAR PAGO <span className="material-symbols-outlined">print</span></>
                        )}
                    </button>
                    <button
                        onClick={() => setCart([])}
                        className="w-full mt-3 text-gray-400 font-bold text-xs hover:text-red-500 transition-colors"
                    >
                        CANCELAR ORDEN
                    </button>
                </div>
            </div>
        </div>
    );
};

