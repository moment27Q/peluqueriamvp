// =============================================================================
// BarberAdmin Pro - Configuration
// =============================================================================
// Sistema de Gestión para Peluquerías
// =============================================================================

// -----------------------------------------------------------------------------
// Site Config
// -----------------------------------------------------------------------------
export interface SiteConfig {
  title: string;
  description: string;
  language: string;
  keywords: string;
  ogImage: string;
  canonical: string;
}

export const siteConfig: SiteConfig = {
  title: "BarberAdmin Pro - Sistema de Gestión para Peluquerías",
  description: "Sistema completo de administración para peluquerías y barberías. Gestión de personal, registro de servicios, cálculo automático de comisiones y reportes detallados.",
  language: "es",
  keywords: "peluquería, barbería, gestión, administración, comisiones, reportes, estilistas",
  ogImage: "/images/hero-banner.jpg",
  canonical: "https://barberadmin.pro",
};

// -----------------------------------------------------------------------------
// Navigation Config
// -----------------------------------------------------------------------------
export interface NavDropdownItem {
  name: string;
  href: string;
}

export interface NavLink {
  name: string;
  href: string;
  icon: string;
  dropdown?: NavDropdownItem[];
}

export interface NavigationConfig {
  brandName: string;
  brandSubname: string;
  tagline: string;
  navLinks: NavLink[];
  ctaButtonText: string;
}

export const navigationConfig: NavigationConfig = {
  brandName: "BarberAdmin",
  brandSubname: "Pro",
  tagline: "Sistema de Gestión Premium",
  navLinks: [
    { name: "Inicio", href: "#inicio", icon: "Home" },
    { name: "Servicios", href: "#servicios", icon: "Scissors" },
    { name: "Equipo", href: "#equipo", icon: "Users" },
    { name: "Reportes", href: "#reportes", icon: "BarChart3" },
    { name: "Contacto", href: "#contacto", icon: "Mail" },
  ],
  ctaButtonText: "Acceder al Panel",
};

// -----------------------------------------------------------------------------
// Preloader Config
// -----------------------------------------------------------------------------
export interface PreloaderConfig {
  brandName: string;
  brandSubname: string;
  yearText: string;
}

export const preloaderConfig: PreloaderConfig = {
  brandName: "BarberAdmin",
  brandSubname: "Pro",
  yearText: "Est. 2024",
};

// -----------------------------------------------------------------------------
// Hero Config
// -----------------------------------------------------------------------------
export interface HeroStat {
  value: number;
  suffix: string;
  label: string;
}

export interface HeroConfig {
  scriptText: string;
  mainTitle: string;
  ctaButtonText: string;
  ctaTarget: string;
  stats: HeroStat[];
  decorativeText: string;
  backgroundImage: string;
}

export const heroConfig: HeroConfig = {
  scriptText: "Gestión Profesional para Barberías",
  mainTitle: "Control Total de\nTu Negocio",
  ctaButtonText: "Comenzar Ahora",
  ctaTarget: "#servicios",
  stats: [
    { value: 500, suffix: "+", label: "Clientes Satisfechos" },
    { value: 50, suffix: "%", label: "Ahorro de Tiempo" },
    { value: 99, suffix: "%", label: "Precisión en Comisiones" },
  ],
  decorativeText: "BARBERADMIN PRO",
  backgroundImage: "/images/hero-banner.jpg",
};

// -----------------------------------------------------------------------------
// Services Showcase Config
// -----------------------------------------------------------------------------
export interface ServiceItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
  description: string;
  features: string[];
}

export interface ServiceFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ServicesShowcaseConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  services: ServiceItem[];
  features: ServiceFeature[];
}

export const servicesShowcaseConfig: ServicesShowcaseConfig = {
  scriptText: "Nuestros Servicios",
  subtitle: "SERVICIOS PREMIUM",
  mainTitle: "Cortes y Estilos\nExcepcionales",
  services: [
    {
      id: "corte",
      name: "Corte de Cabello",
      subtitle: "Clásico o Moderno",
      price: "S/ 25",
      image: "/images/barber-1.jpg",
      description: "Corte personalizado según tu estilo y tipo de rostro. Incluye lavado y peinado.",
      features: ["Consulta de estilo", "Lavado premium", "Peinado incluido"],
    },
    {
      id: "afeitado",
      name: "Afeitado Tradicional",
      subtitle: "Con Navaja",
      price: "S/ 15",
      image: "/images/barber-2.jpg",
      description: "Afeitado clásico con toalla caliente, espuma premium y navaja de filo.",
      features: ["Toalla caliente", "Productos premium", "Acabado perfecto"],
    },
    {
      id: "combo",
      name: "Corte y Afeitado",
      subtitle: "Combo Completo",
      price: "S/ 35",
      image: "/images/barber-3.jpg",
      description: "La experiencia completa de barbería con corte y afeitado tradicional.",
      features: ["Ahorra S/ 5", "Experiencia VIP", "Bebida incluida"],
    },
  ],
  features: [
    {
      icon: "Scissors",
      title: "Técnicas Modernas",
      description: "Especialistas en cortes contemporáneos y clásicos",
    },
    {
      icon: "Sparkles",
      title: "Productos Premium",
      description: "Utilizamos solo las mejores marcas del mercado",
    },
    {
      icon: "Clock",
      title: "Puntualidad",
      description: "Respetamos tu tiempo con citas puntuales",
    },
  ],
};

// -----------------------------------------------------------------------------
// Team Config
// -----------------------------------------------------------------------------
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  specialty: string;
  commissionRate: number;
}

export interface TeamConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  members: TeamMember[];
}

export const teamConfig: TeamConfig = {
  scriptText: "Nuestro Equipo",
  subtitle: "PROFESIONALES EXPERTOS",
  mainTitle: "Conoce a Nuestros\nEstilistas",
  members: [
    {
      id: "1",
      name: "Juan Pérez",
      role: "Barbero Senior",
      image: "/images/barber-1.jpg",
      specialty: "Cortes clásicos y afeitados",
      commissionRate: 50,
    },
    {
      id: "2",
      name: "María García",
      role: "Estilista",
      image: "/images/barber-2.jpg",
      specialty: "Color y tratamientos",
      commissionRate: 45,
    },
    {
      id: "3",
      name: "Carlos López",
      role: "Barbero",
      image: "/images/barber-3.jpg",
      specialty: "Diseños y fades",
      commissionRate: 55,
    },
  ],
};

// -----------------------------------------------------------------------------
// Reports Config
// -----------------------------------------------------------------------------
export interface ReportFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ReportsConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  features: ReportFeature[];
}

export const reportsConfig: ReportsConfig = {
  scriptText: "Reportes y Estadísticas",
  subtitle: "ANÁLISIS DETALLADO",
  mainTitle: "Control Financiero\nCompleto",
  features: [
    {
      icon: "TrendingUp",
      title: "Ganancias por Período",
      description: "Reportes diarios, semanales, quincenales y mensuales detallados",
    },
    {
      icon: "Users",
      title: "Rendimiento por Empleado",
      description: "Seguimiento de servicios, ingresos y comisiones de cada estilista",
    },
    {
      icon: "PieChart",
      title: "Estadísticas Visuales",
      description: "Gráficos interactivos para analizar el crecimiento de tu negocio",
    },
    {
      icon: "Shield",
      title: "Seguridad Total",
      description: "Cálculos automáticos en el servidor, sin manipulación posible",
    },
  ],
};

// -----------------------------------------------------------------------------
// Contact Form Config
// -----------------------------------------------------------------------------
export interface ContactInfoItem {
  icon: string;
  label: string;
  value: string;
  subtext: string;
}

export interface ContactFormFields {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitText: string;
  submittingText: string;
  successMessage: string;
  errorMessage: string;
}

export interface ContactFormConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  introText: string;
  contactInfoTitle: string;
  contactInfo: ContactInfoItem[];
  form: ContactFormFields;
  privacyNotice: string;
  formEndpoint: string;
}

export const contactFormConfig: ContactFormConfig = {
  scriptText: "Contáctanos",
  subtitle: "ESTAMOS PARA AYUDARTE",
  mainTitle: "¿Listo para\nModernizar tu Negocio?",
  introText: "Contáctanos hoy mismo y descubre cómo BarberAdmin Pro puede transformar la gestión de tu peluquería o barbería.",
  contactInfoTitle: "Información de Contacto",
  contactInfo: [
    {
      icon: "MapPin",
      label: "Dirección",
      value: "Calle Principal 123",
      subtext: "Ciudad de México, México",
    },
    {
      icon: "Phone",
      label: "Teléfono",
      value: "+52 55 1234 5678",
      subtext: "Lun-Vie: 9am - 6pm",
    },
    {
      icon: "Mail",
      label: "Email",
      value: "info@barberadmin.pro",
      subtext: "Respondemos en 24h",
    },
    {
      icon: "Clock",
      label: "Horario",
      value: "Lunes a Sábado",
      subtext: "9:00 AM - 8:00 PM",
    },
  ],
  form: {
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre completo",
    emailLabel: "Email",
    emailPlaceholder: "tu@email.com",
    phoneLabel: "Teléfono",
    phonePlaceholder: "+52 55 1234 5678",
    messageLabel: "Mensaje",
    messagePlaceholder: "Cuéntanos sobre tu negocio...",
    submitText: "Enviar Mensaje",
    submittingText: "Enviando...",
    successMessage: "¡Mensaje enviado! Te contactaremos pronto.",
    errorMessage: "Error al enviar. Por favor, intenta de nuevo.",
  },
  privacyNotice: "Al enviar este formulario, aceptas nuestra política de privacidad.",
  formEndpoint: "https://formspree.io/f/YOUR_FORM_ID",
};

// -----------------------------------------------------------------------------
// Footer Config
// -----------------------------------------------------------------------------
export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterContactItem {
  icon: string;
  text: string;
}

export interface FooterConfig {
  brandName: string;
  tagline: string;
  description: string;
  socialLinks: SocialLink[];
  linkGroups: FooterLinkGroup[];
  contactItems: FooterContactItem[];
  newsletterLabel: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  newsletterSuccessText: string;
  newsletterErrorText: string;
  newsletterEndpoint: string;
  copyrightText: string;
  legalLinks: string[];
  icpText: string;
  backToTopText: string;
  ageVerificationText: string;
}

export const footerConfig: FooterConfig = {
  brandName: "BarberAdmin",
  tagline: "Pro",
  description: "Sistema profesional de gestión para peluquerías y barberías. Controla tu negocio con precisión y elegancia.",
  socialLinks: [
    { icon: "Instagram", label: "Instagram", href: "#" },
    { icon: "Facebook", label: "Facebook", href: "#" },
    { icon: "Twitter", label: "Twitter", href: "#" },
  ],
  linkGroups: [
    {
      title: "Producto",
      links: [
        { name: "Características", href: "#servicios" },
        { name: "Precios", href: "#" },
        { name: "Demo", href: "#" },
        { name: "Actualizaciones", href: "#" },
      ],
    },
    {
      title: "Soporte",
      links: [
        { name: "Documentación", href: "#" },
        { name: "Tutoriales", href: "#" },
        { name: "FAQ", href: "#" },
        { name: "Contacto", href: "#contacto" },
      ],
    },
  ],
  contactItems: [
    { icon: "MapPin", text: "Calle Principal 123, CDMX" },
    { icon: "Phone", text: "+52 55 1234 5678" },
    { icon: "Mail", text: "info@barberadmin.pro" },
  ],
  newsletterLabel: "Suscríbete a nuestro newsletter",
  newsletterPlaceholder: "tu@email.com",
  newsletterButtonText: "Suscribirse",
  newsletterSuccessText: "¡Gracias por suscribirte!",
  newsletterErrorText: "Error al suscribirse. Intenta de nuevo.",
  newsletterEndpoint: "https://formspree.io/f/YOUR_FORM_ID",
  copyrightText: "© 2024 BarberAdmin Pro. Todos los derechos reservados.",
  legalLinks: ["Política de Privacidad", "Términos de Uso"],
  icpText: "",
  backToTopText: "Volver arriba",
  ageVerificationText: "",
};

// -----------------------------------------------------------------------------
// Scroll To Top Config
// -----------------------------------------------------------------------------
export interface ScrollToTopConfig {
  ariaLabel: string;
}

export const scrollToTopConfig: ScrollToTopConfig = {
  ariaLabel: "Volver arriba",
};

