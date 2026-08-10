import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, CheckCircle2, Globe, Sparkles, TrendingUp } from 'lucide-react';

export const Hero: React.FC = () => (
  <header id="inicio" className="relative isolate overflow-hidden bg-[#063b5c]">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(24,160,251,0.34),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(125,211,252,0.18),transparent_28%),linear-gradient(135deg,#063b5c_0%,#082f49_55%,#071f32_100%)]" />
    <div className="absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl sm:h-96 sm:w-96" />
    <div className="container mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-28">
      <div className="text-left">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur sm:text-xs"><span className="h-2 w-2 rounded-full bg-cyan-300" />Logística 4.0 · IA aplicada</div>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">Decide mejor.<span className="block bg-gradient-to-r from-cyan-200 via-brand-300 to-white bg-clip-text text-transparent">Reparte mejor.</span></h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">Planifica rutas, resuelve documentación y entiende el rendimiento de tu distribución desde un solo lugar.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/tools" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-brand-500 px-6 text-sm font-bold text-white shadow-[0_16px_35px_rgba(24,160,251,0.28)] transition hover:-translate-y-0.5 hover:bg-brand-400 sm:px-7">Explorar herramientas<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link>
          <Link to="/dashboard" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 sm:px-7">Ver rendimiento <TrendingUp size={18} /></Link>
        </div>
        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-300">{['Diseñado para última milla', 'Flujos claros', 'Datos accionables'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-300" />{item}</span>)}</div>
      </div>
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="absolute -inset-5 rounded-[2rem] bg-cyan-300/10 blur-2xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 px-2 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Centro de control</p><p className="mt-1 text-sm font-semibold text-white">Operación de hoy</p></div><div className="rounded-xl bg-emerald-400/15 p-2.5 text-emerald-200"><Sparkles size={18} /></div></div>
          <div className="grid grid-cols-2 gap-3 py-4"><div className="rounded-2xl bg-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Entregas</p><p className="mt-2 text-3xl font-bold tracking-tight text-white">94%</p><p className="mt-1 text-xs text-emerald-200">+8,4% esta semana</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Rutas</p><p className="mt-2 text-3xl font-bold tracking-tight text-white">28</p><p className="mt-1 text-xs text-cyan-200">listas para salir</p></div></div>
          <div className="rounded-2xl border border-white/10 bg-[#052b44]/80 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-white">Estado de la red</span><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Estable</span></div><div className="mt-4 flex items-end gap-1.5">{[35,55,43,68,52,76,62,84,72,92].map((height, index) => <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-brand-500/40 to-cyan-200" style={{ height: height + 'px' }} />)}</div><div className="mt-3 flex items-center justify-between text-[10px] text-slate-400"><span>08:00</span><span>Ahora</span></div></div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-xs text-slate-300"><div className="rounded-xl bg-white/10 p-2 text-cyan-200"><Box size={16} /></div>Visibilidad operativa en tiempo real<Globe size={15} className="ml-auto text-slate-400" /></div>
        </div>
      </div>
    </div>
  </header>
);
