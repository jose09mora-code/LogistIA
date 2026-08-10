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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const FeatureCard = ({ to, image, alt, icon: Icon, iconClass, title, children }: { to: string; image: string; alt: string; icon: React.ElementType; iconClass: string; title: string; children: React.ReactNode }) => (
  <Link to={to} className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
    <div className="absolute inset-0 bg-slate-900"><img src={image} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40" /><div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" /></div>
    <div className="relative mt-auto p-8 text-left">
      <div className={'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 ' + iconClass}><Icon size={28} /></div>
      <h3 className="mb-2 flex items-center gap-2 text-2xl font-black text-white">{title}<ArrowUpRight size={20} className="opacity-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" /></h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{children}</p><div className="h-1 w-0 bg-brand-500 transition-all duration-500 group-hover:w-full" />
    </div>
  </Link>
);

const HomePage = () => (
  <>
    <Hero />
    <section className="bg-white py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-5 text-center sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl sm:mb-16"><span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Ecosistema Logístico</span><h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Todo lo importante, más claro</h2><p className="mx-auto mt-6 text-lg leading-relaxed text-slate-500">Un espacio de trabajo pensado para convertir la complejidad del transporte en decisiones sencillas y accionables.</p></div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard to="/tools" image="https://images.unsplash.com/photo-1524230659192-35f3dfee46f1?q=80&w=800&auto=format&fit=crop" alt="Planificación de rutas" icon={Map} iconClass="bg-brand-500/20 group-hover:bg-brand-500" title="Planificación de rutas">Algoritmos inteligentes para minimizar distancias, tiempos de entrega y costes operativos.</FeatureCard>
          <FeatureCard to="/tools" image="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800&auto=format&fit=crop" alt="Cumplimiento legal" icon={Scale} iconClass="bg-purple-500/20 group-hover:bg-purple-500" title="Asesoría legal IA">Generación de cláusulas CMR, LOTT y ROTT adaptadas a tus necesidades contractuales.</FeatureCard>
          <FeatureCard to="/consultant" image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" alt="Consultoría técnica" icon={BrainCircuit} iconClass="bg-emerald-500/20 group-hover:bg-emerald-500" title="Consultoría senior">Resuelve dudas sobre ADR, tacógrafos y tiempos de conducción con precisión experta.</FeatureCard>
        </div>
      </div>
    </section>
  </>
);

const ToolsPage = () => (
  <section id="ia-tools" className="container relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pt-24">
    <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"><span className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">Herramientas profesionales</span><h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-5xl">Asistente Logístico Inteligente</h2><p className="text-lg leading-relaxed text-slate-600">Utiliza Gemini para resolver tareas complejas de planificación y documentación legal.</p></div>
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2"><AIToolCard type={ToolType.ROUTE} /><AIToolCard type={ToolType.CONTRACT} /></div>
  </section>
);

const ProgramPage = () => (
  <>
    <UnitsSection /><ContentBlocks />
    <section id="competencias" className="bg-slate-900 py-20 text-white"><div className="container mx-auto px-5 text-center sm:px-8"><h2 className="mb-8 text-3xl font-bold">Competencias Profesionales</h2><div className="flex flex-wrap justify-center gap-3">{['Organización de rutas', 'Gestión de costes', 'Legislación vigente', 'Atención al cliente', 'Tecnología aplicada', 'Normativa ADR', 'Comercio Exterior'].map((skill) => <span key={skill} className="cursor-default rounded-full border border-slate-700 bg-slate-800/50 px-5 py-3 transition-colors hover:border-brand-500 hover:bg-brand-600">{skill}</span>)}</div></div></section>
  </>
);

function App() {
  return <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900"><ScrollToTop /><NavBar /><main id="contenido-principal" className="flex-1"><Routes><Route path="/" element={<HomePage />} /><Route path="/tools" element={<ToolsPage />} /><Route path="/consultant" element={<GeneralConsultant />} /><Route path="/program" element={<ProgramPage />} /><Route path="/dashboard" element={<Dashboard />} /></Routes></main><Footer /></div>;
}

export default App;
