import { useState, useEffect, useRef } from 'react';
import { Scissors, Sparkles, Clock, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { servicesShowcaseConfig } from '../config';

// Icon lookup map for dynamic icon resolution from config strings
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Sparkles, Clock,
};

export function ServicesShowcase() {
  // Null check: if config is empty, render nothing
  if (!servicesShowcaseConfig.mainTitle || servicesShowcaseConfig.services.length === 0) return null;

  const [activeService, setActiveService] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.fade-up, .slide-in-left, .slide-in-right');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const services = servicesShowcaseConfig.services;
  const features = servicesShowcaseConfig.features;
  const service = services[activeService];

  const nextService = () => setActiveService((prev) => (prev + 1) % services.length);
  const prevService = () => setActiveService((prev) => (prev - 1 + services.length) % services.length);

  return (
    <section
      id="servicios"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #d2a855 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container-custom relative">
        {/* Section Title */}
        <div className="fade-up text-center mb-16">
          <span className="font-script text-3xl text-gold-400 block mb-2">{servicesShowcaseConfig.scriptText}</span>
          <span className="text-gold-500 text-xs uppercase tracking-[0.2em] mb-4 block">
            {servicesShowcaseConfig.subtitle}
          </span>
          <h2 className="font-serif text-h1 text-white">{servicesShowcaseConfig.mainTitle}</h2>
        </div>

        {/* Service Tabs */}
        <div className="fade-up flex justify-center gap-2 mb-16" style={{ transitionDelay: '0.1s' }}>
          {services.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveService(i)}
              className={`px-6 py-3 rounded-sm text-sm transition-all duration-300 ${
                i === activeService
                  ? 'bg-gold-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left: Service Info */}
          <div className="slide-in-left lg:col-span-2 order-2 lg:order-1">
            {/* Price + Name */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-serif text-5xl lg:text-6xl text-gold-500 leading-none">{service.price}</span>
                <div>
                  <h2 className="font-serif text-h3 text-white leading-tight">{service.name}</h2>
                  <span className="font-script text-xl text-gold-400">{service.subtitle}</span>
                </div>
              </div>
              <div className="w-16 h-px bg-gold-500 mt-4" />
            </div>

            {/* Description */}
            <p className="text-white/85 leading-relaxed mb-8">{service.description}</p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-gold-500" />
                  </div>
                  <span className="text-white/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                const element = document.querySelector('#contacto');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary rounded-sm flex items-center gap-2 group"
              aria-label="Reservar servicio"
            >
              Reservar Ahora
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Center: Service Image */}
          <div className="lg:col-span-1 order-1 lg:order-2 flex justify-center">
            <div className="relative" style={{ width: '280px', height: '400px' }}>
              {/* Glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 bg-gold-500/15 rounded-full blur-3xl transition-colors duration-700" />
              </div>

              {/* Images */}
              {services.map((s, i) => (
                <img
                  key={s.id}
                  src={s.image}
                  alt={`${s.name} - ${s.subtitle}`}
                  loading={i === 0 ? undefined : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover rounded-lg z-10 drop-shadow-2xl transition-all duration-700 ${
                    i === activeService
                      ? 'opacity-100 scale-100 translate-y-0'
                      : i < activeService
                        ? 'opacity-0 scale-90 -translate-y-6 pointer-events-none'
                        : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
                  }`}
                />
              ))}

              {/* Switcher Arrows */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <button
                  onClick={prevService}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 transition-all duration-300"
                  aria-label="Servicio anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-white/50 font-serif tabular-nums whitespace-nowrap">
                  {activeService + 1} / {services.length}
                </span>
                <button
                  onClick={nextService}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 transition-all duration-300"
                  aria-label="Siguiente servicio"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className="slide-in-right lg:col-span-2 order-3">
            <div className="space-y-6">
              {features.map((feature) => {
                const IconComponent = iconMap[feature.icon] || Scissors;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-gold-500/30 transition-colors">
                      <IconComponent className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-white/65 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quote */}
            <div className="mt-10 p-6 bg-white/[0.03] rounded-lg border-l-2 border-gold-500/50">
              <p className="font-script text-2xl text-gold-400 mb-2">Experiencia Premium</p>
              <p className="text-white/70 text-sm italic leading-relaxed">
                "Cada corte es una obra de arte. Nuestros barberos combinan técnicas tradicionales con estilos modernos para crear tu look perfecto."
              </p>
              <p className="text-gold-500 text-xs mt-3">— BarberAdmin Pro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
