'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Analytics helper
const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  console.log(`[Analytics Event] ${eventName}`, eventParams);
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }
};

// FAQ Type
interface FaqItem {
  question: string;
  answer: string;
}

// Compare Card Type
interface ComparisonCard {
  bad: string;
  good: string;
  description: string;
}

export default function CtasLandingClient() {
  // Ref for the form section to scroll to it
  const formRef = useRef<HTMLDivElement>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [queQuieresMejorar, setQueQuieresMejorar] = useState('Solo quiero ver ejemplos');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ nombre?: string; correo?: string }>({});

  // FAQ states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Track page view or initial component mount (analytics)
  useEffect(() => {
    trackEvent('resource_landing_view', { resource: '30 Mensajes CTA' });
  }, []);

  // Scroll to Form helper
  const scrollToForm = (triggerName: string) => {
    trackEvent(triggerName);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Wait for scroll to complete and focus name input
      setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 800);
    }
  };

  // Form start typing tracker
  const handleInputFocus = (field: string) => {
    setFocusedInput(field);
    trackEvent('resource_form_start', { field });
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('resource_form_submit');

    // Validation
    const errors: { nombre?: string; correo?: string } = {};
    if (!nombre.trim()) {
      errors.nombre = 'Por favor, escribe tu nombre.';
    }
    if (!correo.trim()) {
      errors.correo = 'Por favor, escribe tu correo.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.correo = 'Por favor, introduce un correo electrónico válido.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormState('error');
      setErrorMessage('Por favor, corrige los campos marcados en rojo.');
      trackEvent('resource_form_validation_failed', { errors });
      return;
    }

    setFormErrors({});
    setFormState('loading');

    try {
      const response = await fetch('/api/cta-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, correo, queQuieresMejorar }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la información. Por favor intenta de nuevo.');
      }

      // Success
      setFormState('success');
      trackEvent('resource_form_success', { nombre, correo, queQuieresMejorar });
      trackEvent('download_guide_click');
    } catch (err: any) {
      console.error(err);
      setFormState('error');
      setErrorMessage(err.message || 'Ocurrió un error inesperado al enviar el formulario.');
    }
  };

  // Static content data
  const comparisons: ComparisonCard[] = [
    { bad: 'Enviar', good: 'Descargar la guía', description: 'Suena a trámite vs. recompensa inmediata.' },
    { bad: 'Solicitar información', good: 'Recibir una cotización', description: 'Ambigüedad vs. un entregable claro.' },
    { bad: 'Contactar', good: 'Agendar mi llamada', description: 'Genérico vs. una acción específica y personal.' },
    { bad: 'Enviar solicitud', good: 'Recibir mi diagnóstico', description: 'Proceso burocrático vs. valor personalizado.' },
    { bad: 'Registrarme', good: 'Guardar mi lugar', description: 'Trámite de registro vs. asegurar un beneficio limitado.' },
    { bad: 'Suscribirme', good: 'Recibir ideas cada semana', description: 'Suscripción genérica vs. expectativa de contenido de valor.' },
  ];

  const valueItems = [
    {
      title: '30 CTAs listos para adaptar',
      description: 'Ejemplos listos para usar en guías, diagnósticos, cotizaciones, demostraciones en vivo, webinars y boletines informativos.',
    },
    {
      title: 'Fórmulas para mejores botones',
      description: 'Estructuras lingüísticas sencillas y probadas para componer CTAs de alto impacto: [Verbo] + [Recurso] + [Resultado esperado].',
    },
    {
      title: 'Checklist de revisión de formulario',
      description: 'Una pauta rápida paso a paso para identificar si tu botón de formulario pide demasiado esfuerzo y ofrece poca recompensa.',
    },
    {
      title: 'Microcopy para reducir fricción',
      description: 'Textos complementarios muy cortos y estratégicos que disminuyen el miedo al spam y aclaran qué pasará exactamente después.',
    },
  ];

  const beforeAfterTable = [
    { bad: 'Enviar', good: 'Descargar la guía' },
    { bad: 'Solicitar información', good: 'Recibir una cotización' },
    { bad: 'Contactar', good: 'Agendar mi llamada' },
    { bad: 'Enviar solicitud', good: 'Recibir mi diagnóstico' },
    { bad: 'Registrarme', good: 'Guardar mi lugar' },
    { bad: 'Suscribirme', good: 'Recibir ideas cada semana' },
  ];

  const faqs: FaqItem[] = [
    {
      question: '¿La guía es realmente gratis?',
      answer: 'Sí. Es un recurso libre de costo. Comparte tu nombre y correo en el formulario de arriba y te enviaremos el enlace directo de descarga al instante.',
    },
    {
      question: '¿Esto aplica solo para lead magnets?',
      answer: 'No. Estas fórmulas y principios funcionan perfectamente para botones de contacto, solicitudes de cotizaciones, agendamientos de llamadas, accesos a demos y registros de webinars.',
    },
    {
      question: '¿Por qué no debería usar el botón "Enviar"?',
      answer: 'Porque "Enviar" es un término técnico que describe lo que hace el navegador web, no el valor que recibe el usuario. Al recordarle al usuario la recompensa que obtendrá, reduces la fricción psicológica de compartir sus datos.',
    },
    {
      question: '¿Puedo usar estos CTAs tal cual vienen en la guía?',
      answer: 'Por supuesto. Están estructurados para que los copies y pegues directamente. Lo ideal es que reemplaces los términos genéricos por el nombre específico del recurso o beneficio que entregas.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070709] text-neutral-100 font-sans selection:bg-[#a6d920]/20 selection:text-[#a6d920] overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full blur-3xl pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(166, 217, 32, 0.05) 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] right-[-15%] w-[50%] h-[60%] rounded-full blur-3xl pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(166, 217, 32, 0.05) 0%, transparent 70%)' }} />

      {/* Navigation Header */}
      <header className="border-b border-neutral-900 bg-[#070709]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs tracking-wider uppercase font-semibold text-neutral-400">
              Sutura Systems
            </span>
            <span className="text-neutral-700">|</span>
            <span className="text-xs tracking-wider uppercase font-semibold text-[#a6d920]">
              La Vida de un Creativo
            </span>
          </div>
          <button
            onClick={() => scrollToForm('cta_header_click')}
            className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#a6d920] px-4 py-2.5 rounded-full hover:bg-[#b8ef24] active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(166,217,32,0.15)]"
          >
            <span>Obtener guía</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920] animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Recurso gratuito para mejorar formularios
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.1] font-sans">
              30 CTAs para <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
                reemplazar el botón "Enviar"
              </span>
            </h1>

            <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              Una guía práctica para escribir botones de formulario que prometen una recompensa clara: guías, diagnósticos, cotizaciones, demos y llamadas.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => scrollToForm('cta_hero_click')}
                className="inline-flex items-center justify-center space-x-3 text-sm font-semibold uppercase tracking-wider text-black bg-[#a6d920] px-8 py-4.5 rounded-full hover:bg-[#b8ef24] hover:shadow-[0_0_30px_rgba(166,217,32,0.3)] active:scale-98 transition-all duration-300"
              >
                <span>Descargar la guía</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              <button
                onClick={() => {
                  trackEvent('cta_hero_secondary_click');
                  const target = document.getElementById('antes-despues');
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center space-x-2 text-sm font-semibold uppercase tracking-wider text-neutral-300 border border-neutral-800 bg-neutral-900/40 px-8 py-4.5 rounded-full hover:bg-neutral-800 hover:text-white transition-all duration-300"
              >
                <span>Ver ejemplos</span>
              </button>
            </div>
          </motion.div>

          {/* Hero Right Visual (Card Comparison) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="relative">
              {/* Decorative Glow behind the Card */}
              <div className="absolute inset-0 bg-[#a6d920]/10 rounded-[32px] blur-2xl transform rotate-3 -z-10" />
              
              {/* Premium White Card */}
              <div className="bg-white text-neutral-950 border border-neutral-100 rounded-[32px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#a6d920]" />
                
                <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-400 mb-6">
                  El Botón de Formulario es Clave
                </h3>

                <div className="space-y-6">
                  {/* Bad Form Block */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">Formulario Tradicional</span>
                      <span className="text-red-500 font-semibold px-2 py-0.5 rounded bg-red-50">Malo</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div className="w-[60%] h-2 bg-neutral-200 rounded mb-4" />
                      <div className="w-full h-11 bg-neutral-300 rounded-lg flex items-center justify-center text-neutral-600 font-medium text-sm">
                        Enviar
                      </div>
                    </div>
                  </div>

                  {/* Spacer Arrow */}
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-neutral-400 transform rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Better Form Block */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">Con Enfoque de Recompensa</span>
                      <span className="text-emerald-600 font-semibold px-2 py-0.5 rounded bg-emerald-50">Mejor</span>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 relative overflow-hidden">
                      <div className="w-[60%] h-2 bg-neutral-200 rounded mb-4" />
                      <div className="w-full h-11 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md hover:bg-neutral-800 transition-all">
                        Descargar la guía
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-500 text-xs sm:text-sm mt-6 text-center italic leading-relaxed border-t border-neutral-100 pt-6">
                  "Un buen CTA no dice lo que la marca quiere. Dice lo que la persona va a recibir."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-neutral-950 py-24 border-y border-neutral-900 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-[#a6d920]">
              El Problema Oculto
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
              El error no está solo en el diseño. <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">
                Está en la intención.
              </span>
            </h2>
            <div className="h-0.5 w-16 bg-[#a6d920] mt-6" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6 text-neutral-400 font-light text-lg leading-relaxed">
              <p>
                Muchas marcas cuidan minuciosamente el título, el hero, la imagen del recurso, los campos del formulario y el diseño general... pero cometen el desliz final de terminar con un botón apagado que dice <strong className="text-white font-medium">"Enviar"</strong>.
              </p>
              <p>
                El problema de raíz es que <strong className="text-white font-semibold">"Enviar"</strong> habla estrictamente desde el lado de la marca: lo que la marca quiere que la persona haga (transmitirnos sus valiosos datos a nuestra base).
              </p>
              <p className="text-white font-normal text-xl border-l-2 border-[#a6d920] pl-6 py-1 italic">
                Nadie quiere "enviar" sus datos. La gente lo que quiere es recibir una solución: una guía, una cotización, una llamada, un diagnóstico o una respuesta inmediata.
              </p>
            </div>

            {/* Micro Comparison Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comparisons.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0c0d10] border border-neutral-900 rounded-2xl p-6 hover:border-neutral-800 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-neutral-500 font-semibold line-through decoration-red-500/50">
                      {item.bad}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-neutral-600 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs text-[#a6d920] font-bold px-2 py-0.5 rounded bg-[#a6d920]/10 border border-[#a6d920]/20">
                      {item.good}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 font-light mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Section (What's Included) */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-[#a6d920]">
              Contenido del Recurso
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Qué incluye la guía
            </h2>
            <p className="text-neutral-400 font-light text-sm sm:text-base">
              Herramientas concretas diseñadas para cambiar botones genéricos por CTAs cargados de recompensa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {valueItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white text-neutral-900 border border-neutral-100 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:translate-y-[-2px] transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-2.5 h-full bg-[#a6d920]" />
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-[#a6d920] border border-neutral-100 shadow-sm font-mono font-bold text-lg">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 font-light leading-relaxed text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Mockup Section */}
      <section className="bg-neutral-950 py-24 border-t border-neutral-900 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-neutral-800 bg-[#a6d920]/10 text-[#a6d920]">
              <span className="text-xs uppercase tracking-widest font-semibold">
                PDF gratuito · 14 páginas
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
              Una lectura de 10 minutos <br />
              <span className="font-normal text-neutral-400">
                que cambia tu conversión para siempre.
              </span>
            </h2>
            <p className="text-neutral-400 font-light text-lg leading-relaxed">
              No necesitas un rediseño completo de tus páginas web para conseguir más registros. Con frecuencia, el cambio de microcopy en el botón del formulario es la palanca más rápida y económica para elevar tus métricas.
            </p>
            <div className="pt-2">
              <button
                onClick={() => scrollToForm('cta_pdf_click')}
                className="inline-flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#a6d920] px-6 py-3.5 rounded-full hover:bg-[#b8ef24] transition-all"
              >
                <span>Descargar PDF</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Book Mockup Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white text-neutral-900 border border-neutral-100 rounded-[32px] p-8 shadow-2xl relative overflow-hidden aspect-[3/4] flex flex-col justify-between group">
              {/* Graphic accents on PDF cover */}
              <div className="absolute top-0 right-0 w-32 h-32 blur-xl pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(166, 217, 32, 0.15) 0%, transparent 70%)' }} />
              <div className="absolute bottom-0 left-0 w-2.5 h-full bg-[#a6d920]" />
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                    Sutura Systems x LVDC
                  </div>
                  <div className="text-[10px] bg-[#a6d920] text-black font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Guía Práctica
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight leading-none">
                    No pongas <br />
                    <span className="text-[#a6d920] bg-black text-white px-2 py-1 inline-block rounded mt-1 font-mono uppercase text-2xl sm:text-3xl">
                      "Enviar"
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light pt-2">
                    Guía rápida de CTAs para formularios que convierten mejor porque prometen una recompensa clara.
                  </p>
                </div>
              </div>

              {/* Inside page simulation bullet lists */}
              <div className="border-t border-neutral-100 pt-6 space-y-3.5">
                <div className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920]" />
                  <span className="text-xs text-neutral-700 font-medium">Biblioteca de CTAs por objetivo</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920]" />
                  <span className="text-xs text-neutral-700 font-medium">Antes/después de botones genéricos</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920]" />
                  <span className="text-xs text-neutral-700 font-medium">Checklist de landing page funcional</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920]" />
                  <span className="text-xs text-neutral-700 font-medium">Microcopy de seguridad para formularios</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Download Form Section */}
      <section
        ref={formRef}
        id="formulario-descarga"
        className="py-24 px-6 relative"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-white text-neutral-900 border border-neutral-100 rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#a6d920]" />

            <AnimatePresence mode="wait">
              {formState === 'success' ? (
                // SUCCESS STATE
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-10 space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#a6d920]/15 text-[#a6d920] mx-auto flex items-center justify-center border border-[#a6d920]/30 shadow-inner">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                      ¡Recurso enviado!
                    </h3>
                    <p className="text-[#a6d920] bg-black font-semibold text-sm px-4 py-2 rounded-full inline-block">
                      Listo. Revisa tu correo para acceder a la guía.
                    </p>
                    <p className="text-neutral-500 font-light text-sm max-w-md mx-auto pt-2">
                      Hemos enviado el enlace de descarga del PDF en menos de un minuto. Si no lo ves en tu bandeja principal, por favor revisa la carpeta de Promociones o Spam.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 space-y-4">
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                      ¿Quieres acelerar tus resultados?
                    </p>
                    <a
                      href="https://wa.me/525522026291?text=Hola!%20Acabo%20de%20descargar%20la%20guia%20de%20CTAs%20y%20me%20gustaria%20que%20revisen%20mi%20landing%20page%20para%20mejorar%20mis%20formularios."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 px-6 py-3.5 rounded-full transition-all"
                    >
                      <span>Quiero que revisen mi landing</span>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ) : (
                // FORM STATE (IDLE, LOADING, ERROR)
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider font-extrabold text-[#a6d920] bg-black text-white px-3 py-1 inline-block rounded-full">
                      Descarga Directa
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                      Recibe la guía para mejorar tus formularios
                    </h3>
                    <p className="text-neutral-500 font-light text-sm sm:text-base leading-relaxed">
                      Déjanos tu correo y te enviaremos el PDF con ejemplos concretos para cambiar botones genéricos por CTAs con recompensa.
                    </p>
                  </div>

                  {/* Inline Error Alert banner */}
                  {formState === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-red-500 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-semibold">Ha ocurrido un problema:</span> {errorMessage}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-nombre" className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Nombre completo
                      </label>
                      <input
                        id="input-nombre"
                        type="text"
                        placeholder="Ej. Israel Granados"
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          if (formErrors.nombre) setFormErrors((prev) => ({ ...prev, nombre: undefined }));
                        }}
                        onFocus={() => handleInputFocus('nombre')}
                        onBlur={() => setFocusedInput(null)}
                        aria-invalid={!!formErrors.nombre}
                        aria-describedby={formErrors.nombre ? 'error-nombre' : undefined}
                        className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all outline-none ${
                          formErrors.nombre
                            ? 'border-red-300 bg-red-50/30 text-red-950 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : focusedInput === 'nombre'
                            ? 'border-[#a6d920] bg-neutral-50 text-neutral-950 focus:ring-1 focus:ring-[#a6d920]'
                            : 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300'
                        }`}
                      />
                      {formErrors.nombre && (
                        <p id="error-nombre" className="text-red-500 text-xs font-medium pl-1 mt-1">
                          {formErrors.nombre}
                        </p>
                      )}
                    </div>

                    {/* Input Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-correo" className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Correo electrónico
                      </label>
                      <input
                        id="input-correo"
                        type="email"
                        placeholder="Ej. correo@tudominio.com"
                        value={correo}
                        onChange={(e) => {
                          setCorreo(e.target.value);
                          if (formErrors.correo) setFormErrors((prev) => ({ ...prev, correo: undefined }));
                        }}
                        onFocus={() => handleInputFocus('correo')}
                        onBlur={() => setFocusedInput(null)}
                        aria-invalid={!!formErrors.correo}
                        aria-describedby={formErrors.correo ? 'error-correo' : undefined}
                        className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all outline-none ${
                          formErrors.correo
                            ? 'border-red-300 bg-red-50/30 text-red-950 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : focusedInput === 'correo'
                            ? 'border-[#a6d920] bg-neutral-50 text-neutral-950 focus:ring-1 focus:ring-[#a6d920]'
                            : 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300'
                        }`}
                      />
                      {formErrors.correo && (
                        <p id="error-correo" className="text-red-500 text-xs font-medium pl-1 mt-1">
                          {formErrors.correo}
                        </p>
                      )}
                    </div>

                    {/* Input Dropdown Select */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-objetivo" className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        ¿Qué te gustaría mejorar en tu negocio?
                      </label>
                      <div className="relative">
                        <select
                          id="input-objetivo"
                          value={queQuieresMejorar}
                          onChange={(e) => setQueQuieresMejorar(e.target.value)}
                          onFocus={() => handleInputFocus('objetivo')}
                          onBlur={() => setFocusedInput(null)}
                          className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium bg-white text-neutral-950 transition-all outline-none appearance-none cursor-pointer ${
                            focusedInput === 'objetivo'
                              ? 'border-[#a6d920] ring-1 ring-[#a6d920]'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <option value="Quiero más descargas">Quiero más descargas de recursos (leads)</option>
                          <option value="Quiero más cotizaciones">Quiero más solicitudes de cotización</option>
                          <option value="Quiero más llamadas agendadas">Quiero más llamadas agendadas de venta</option>
                          <option value="Quiero mejorar mi landing">Quiero mejorar el rendimiento de mi landing page</option>
                          <option value="Solo quiero ver ejemplos">Solo quiero ver ejemplos y aprender</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-neutral-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        disabled={formState === 'loading'}
                        className="w-full relative overflow-hidden h-14 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider text-sm flex items-center justify-center transition-all cursor-pointer disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.99]"
                      >
                        {formState === 'loading' ? (
                          <div className="flex items-center space-x-3">
                            {/* Loading Spinner */}
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Procesando envío...</span>
                          </div>
                        ) : (
                          <span>Descargar la guía</span>
                        )}
                      </button>

                      <p className="text-center text-xs text-neutral-400 font-medium pt-1">
                        Recibirás el PDF en tu correo en menos de un minuto. Sin spam.
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Before and After Table Grid */}
      <section
        id="antes-despues"
        className="bg-neutral-950 py-24 border-y border-neutral-900 px-6"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-[#a6d920]">
              Casos Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Pequeños cambios. Mejor expectativa.
            </h2>
            <p className="text-neutral-400 font-light max-w-xl mx-auto text-sm">
              Una simple palabra cambia cómo el cerebro del usuario interpreta el esfuerzo. Observa la diferencia:
            </p>
          </div>

          {/* Table Design */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-neutral-950/80 px-6 py-4.5 border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <div>En vez de</div>
              <div className="text-[#a6d920]">Prueba</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-neutral-900">
              {beforeAfterTable.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 px-6 py-4.5 text-sm sm:text-base font-medium items-center hover:bg-neutral-900/30 transition-colors"
                >
                  <div className="text-neutral-400 font-mono font-light line-through decoration-red-500/20">{row.bad}</div>
                  <div className="text-white font-bold flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920]" />
                    <span>{row.good}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4">
            <blockquote className="text-xl sm:text-2xl text-neutral-300 font-light italic leading-relaxed">
              "Uno pide una acción. El otro recuerda una recompensa."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Author/Creator Block */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto bg-white text-neutral-900 border border-neutral-100 rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-[#a6d920]" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Col Profile Info */}
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#a6d920] bg-black text-white px-3 py-1 inline-block rounded-full">
                  Creadores
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  Creado por Sutura Systems x La Vida de un Creativo
                </h2>
              </div>

              <p className="text-neutral-600 font-light leading-relaxed text-sm sm:text-base">
                Construyo landings, formularios, funnels y automatizaciones. Y si hay algo que veo todo el tiempo es esto: muchas páginas no fallan porque la idea sea mala, fallan porque piden datos sin explicar bien la recompensa.
              </p>
              <p className="text-neutral-600 font-light leading-relaxed text-sm sm:text-base">
                Este recurso existe para ayudarte a detectar ese error rápido y corregirlo con ejemplos concretos.
              </p>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-neutral-950 leading-tight">
                    Israel Granados
                  </h4>
                  <p className="text-xs text-neutral-400 font-medium">
                    La Vida de un Creativo
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6d920]" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">
                    Est. 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col Visual Signature */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-40 h-40 rounded-full border border-neutral-100 shadow-inner bg-neutral-50 flex items-center justify-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#a6d920]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-center p-4">
                  <span className="block font-mono text-xs uppercase font-bold text-neutral-400 tracking-wider">
                    Sutura
                  </span>
                  <span className="block font-serif text-3xl font-extrabold text-neutral-900 my-0.5">
                    X
                  </span>
                  <span className="block font-mono text-xs uppercase font-bold text-[#a6d920] bg-black text-white px-2 py-0.5 rounded tracking-wide">
                    LVDC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-neutral-950 py-24 border-t border-neutral-900 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-[#a6d920]">
              Dudas Comunes
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Preguntas Frecuentes
            </h2>
            <div className="h-0.5 w-12 bg-[#a6d920] mx-auto mt-4" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-neutral-800 bg-neutral-900/20 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => {
                      const newIndex = isOpen ? null : idx;
                      setOpenFaqIndex(newIndex);
                      trackEvent('faq_click', { question: faq.question, state: newIndex !== null ? 'open' : 'closed' });
                    }}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-800/10 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-white pr-4">
                      {faq.question}
                    </span>
                    <span className={`text-neutral-400 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#a6d920]' : ''}`}>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed border-t border-neutral-900/60 mt-0.5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-28 px-6 text-center relative overflow-hidden bg-neutral-950/40">
        <div className="absolute inset-0 blur-3xl pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(166, 217, 32, 0.04) 0%, transparent 70%)' }} />
        
        <div className="max-w-4xl mx-auto space-y-8 relative">
          <span className="text-xs uppercase tracking-widest font-extrabold text-neutral-500 bg-neutral-900 border border-neutral-850 px-4 py-1.5 rounded-full">
            Última oportunidad
          </span>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-tight">
            No pidas datos. <br />
            <span className="font-normal text-[#a6d920]">
              Recuerda la recompensa.
            </span>
          </h2>

          <p className="text-neutral-400 font-light text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Descarga la guía y empieza a cambiar CTAs genéricos por botones que le digan a la persona qué va a recibir.
          </p>

          <div className="pt-4">
            <button
              onClick={() => scrollToForm('cta_final_click')}
              className="inline-flex items-center justify-center space-x-3 text-sm font-semibold uppercase tracking-wider text-black bg-[#a6d920] px-10 py-5 rounded-full hover:bg-[#b8ef24] hover:shadow-[0_0_35px_rgba(166,217,32,0.35)] active:scale-97 transition-all duration-300"
            >
              <span>Descargar la guía</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-6 bg-[#070709] text-center text-xs text-neutral-500 space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Sutura Systems x La Vida de un Creativo. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-neutral-300">Aviso de Privacidad</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-neutral-300">Términos de Servicio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
