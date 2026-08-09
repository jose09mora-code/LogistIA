import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { AIToolCard } from './components/AIToolCard';
import { UnitsSection } from './components/UnitsSection';
import { Footer } from './components/Footer';
import { ToolType } from './types';
import { GeneralConsultant } from './components/GeneralConsultant';
import { ContentBlocks } from './components/ContentBlocks';
import { Dashboard } from './components/Dashboard';
import { Map, Scale, BrainCircuit, ArrowUpRight } from 'lucide-react';

// Utility to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomePage = () => (
  <>
    <Hero />
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <div className="mb-16">
          <span className="text-brand-600 font-black uppercase tracking-[0.2em] text-xs">Ecosistema Logístico</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-6 tracking-tight">Eficiencia de Vanguardia</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Optimiza cada eslabón de tu cadena de suministro con herramientas diseñadas para el transporte moderno y la distribución de última milla.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Tarjeta Rutas */}
          <Link to="/tools" className="group relative flex flex-col h-[420px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1524230659192-35f3dfee46f1?q=80&w=800&auto=format&fit=crop" 
                alt="Optimización de Rutas" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>
            <div className="relative mt-auto p-8 text-left">
              <div className="w-14 h-14 bg-brand-500/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-500">
                <Map size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                Planificación de Rutas
                <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Algoritmos inteligentes para minimizar distancias, tiempos de entrega y costes operativos en entornos urbanos complejos.
              </p>
              <div className="h-1 w-0 bg-brand-500 group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>

          {/* Tarjeta Legal */}
          <Link to="/tools" className="group relative flex flex-col h-[420px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800&auto=format&fit=crop" 
                alt="Cumplimiento Legal" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>
            <div className="relative mt-auto p-8 text-left">
              <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-500">
                <Scale size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                Asesoría Legal AI
                <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Generación instantánea de cláusulas CMR, LOTT y ROTT adaptadas a tus necesidades contractuales específicas.
              </p>
              <div className="h-1 w-0 bg-purple-500 group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>

          {/* Tarjeta Experto */}
          <Link to="/consultant" className="group relative flex flex-col h-[420px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" 
                alt="Consultoría Técnica" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>
            <div className="relative mt-auto p-8 text-left">
              <div className="w-14 h-14 bg-emerald-500/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-500">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                Consultoría Senior
                <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Resolución técnica sobre normativa ADR, tacógrafos y tiempos de conducción con precisión experta.
              </p>
              <div className="h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  </>
);

const ToolsPage = () => (
  <section id="ia-tools" className="pt-24 pb-20 container mx-auto px-4 relative">
    <div className="text-center mb-16 max-w-3xl mx-auto">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase mb-4">
            Herramientas Profesionales
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Asistente Logístico Inteligente</h2>
        <p className="text-slate-600 text-lg leading-relaxed">
            Utiliza la potencia de los modelos <span className="font-semibold text-brand-600">Gemini 3 Pro</span> para resolver tareas complejas de planificación y documentación legal.
        </p>
    </div>
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <AIToolCard type={ToolType.ROUTE} />
        <AIToolCard type={ToolType.CONTRACT} />
    </div>
  </section>
);

const ProgramPage = () => (
  <>
    <UnitsSection />
    <ContentBlocks />
    <section id="competencias" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Competencias Profesionales</h2>
            <div className="flex flex-wrap justify-center gap-4">
                {['Organización de rutas', 'Gestión de costes', 'Legislación vigente', 'Atención al cliente', 'Tecnología aplicada', 'Normativa ADR', 'Comercio Exterior'].map((skill) => (
                    <span key={skill} className="px-6 py-3 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-brand-600 hover:border-brand-500 transition-colors cursor-default">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    </section>
  </>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <ScrollToTop />
      <NavBar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/consultant" element={<GeneralConsultant />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;