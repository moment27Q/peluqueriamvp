import { useEffect, useRef } from 'react';
import { Scissors, Star, TrendingUp } from 'lucide-react';
import { teamConfig } from '../config';

export function TeamSection() {
  // Null check
  if (!teamConfig.mainTitle || teamConfig.members.length === 0) return null;

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

    const elements = sectionRef.current?.querySelectorAll('.fade-up, .scale-in');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const members = teamConfig.members;

  return (
    <section
      id="equipo"
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-[#0f0f0f]"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #d2a855 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container-custom relative">
        {/* Section Title */}
        <div className="fade-up text-center mb-16">
          <span className="font-script text-3xl text-gold-400 block mb-2">{teamConfig.scriptText}</span>
          <span className="text-gold-500 text-xs uppercase tracking-[0.2em] mb-4 block">
            {teamConfig.subtitle}
          </span>
          <h2 className="font-serif text-h1 text-white">{teamConfig.mainTitle}</h2>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="fade-up group"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-lg bg-white/[0.02] border border-white/10 hover:border-gold-500/30 transition-all duration-500">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                  
                  {/* Commission Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gold-500/90 rounded-sm">
                    <span className="text-xs font-medium text-white">{member.commissionRate}% Comisión</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-serif text-xl text-white mb-1">{member.name}</h3>
                      <p className="text-gold-400 text-sm">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                      <span className="text-white text-sm">4.9</span>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm mb-4">{member.specialty}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-gold-500" />
                      <span className="text-white/70 text-xs">150+ cortes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gold-500" />
                      <span className="text-white/70 text-xs">Top rendimiento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="fade-up text-center mt-16" style={{ transitionDelay: '0.4s' }}>
          <p className="text-white/60 mb-6">¿Quieres unirte a nuestro equipo?</p>
          <button
            onClick={() => {
              const element = document.querySelector('#contacto');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-secondary rounded-sm"
          >
            Aplicar Ahora
          </button>
        </div>
      </div>
    </section>
  );
}
