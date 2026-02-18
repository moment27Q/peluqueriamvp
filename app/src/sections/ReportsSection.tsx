import { useEffect, useRef } from 'react';
import { TrendingUp, Users, PieChart, Shield, BarChart3, Calendar, Lock, ArrowRight } from 'lucide-react';
import { reportsConfig } from '../config';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, Users, PieChart, Shield, BarChart3, Calendar, Lock,
};

export function ReportsSection() {
  // Null check
  if (!reportsConfig.mainTitle || reportsConfig.features.length === 0) return null;

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

  const features = reportsConfig.features;

  return (
    <section
      id="reportes"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-[#1a1a1a] to-[#141414]" />

      {/* Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #d2a855 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container-custom relative">
        {/* Section Title */}
        <div className="fade-up text-center mb-16">
          <span className="font-script text-3xl text-gold-400 block mb-2">{reportsConfig.scriptText}</span>
          <span className="text-gold-500 text-xs uppercase tracking-[0.2em] mb-4 block">
            {reportsConfig.subtitle}
          </span>
          <h2 className="font-serif text-h1 text-white">{reportsConfig.mainTitle}</h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || BarChart3;
            return (
              <div
                key={feature.title}
                className={`fade-up p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-gold-500/30 transition-all duration-500 group ${
                  index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-white mb-2">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Preview */}
        <div className="fade-up relative" style={{ transitionDelay: '0.4s' }}>
          <div className="relative rounded-xl overflow-hidden bg-[#0f0f0f] border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-white/40 text-sm">Panel de Administración</span>
              <div className="w-20" />
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Ingresos Hoy', value: '$1,250', change: '+12%' },
                  { label: 'Servicios', value: '24', change: '+5%' },
                  { label: 'Comisiones', value: '$625', change: '+12%' },
                  { label: 'Clientes', value: '18', change: '+8%' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-white/50 text-xs mb-1">{stat.label}</p>
                    <p className="font-serif text-2xl text-white mb-1">{stat.value}</p>
                    <p className="text-green-400 text-xs">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="h-48 rounded-lg bg-white/[0.02] border border-white/5 flex items-end justify-around px-6 pb-6">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
                  <div
                    key={i}
                    className="w-8 bg-gradient-to-t from-gold-500/60 to-gold-500/20 rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              {/* Table */}
              <div className="mt-6 rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-white/5 text-white/50 text-xs">
                  <span>Empleado</span>
                  <span>Servicios</span>
                  <span>Ingresos</span>
                  <span>Comisión</span>
                </div>
                {[
                  { name: 'Juan Pérez', services: 8, revenue: '$400', commission: '$200' },
                  { name: 'María García', services: 6, revenue: '$300', commission: '$135' },
                  { name: 'Carlos López', services: 10, revenue: '$550', commission: '$302' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-white/5 text-white/70 text-sm">
                    <span>{row.name}</span>
                    <span>{row.services}</span>
                    <span>{row.revenue}</span>
                    <span className="text-gold-400">{row.commission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -top-4 -right-4 px-4 py-2 bg-gold-500 rounded-lg shadow-lg">
            <span className="text-white text-sm font-medium">Demo en Vivo</span>
          </div>
        </div>

        {/* CTA */}
        <div className="fade-up text-center mt-12" style={{ transitionDelay: '0.5s' }}>
          <button
            onClick={() => {
              const element = document.querySelector('#contacto');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary rounded-sm inline-flex items-center gap-2 group"
          >
            Solicitar Demo
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
