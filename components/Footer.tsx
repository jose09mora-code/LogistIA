import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Truck } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="border-t border-slate-800 bg-[#071f32] py-12 text-slate-400">
    <div className="container mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-white"><span className="rounded-xl bg-brand-500 p-2 text-white"><Truck size={18} /></span><span className="text-lg font-bold tracking-tight">LogistIA</span></Link>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Herramientas claras para planificar, cumplir y mejorar cada entrega.</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Producto</p>
        <div className="mt-4 grid gap-3 text-sm"><Link className="transition hover:text-white" to="/tools">Herramientas IA</Link><Link className="transition hover:text-white" to="/dashboard">Dashboard KPI</Link><Link className="transition hover:text-white" to="/consultant">Consultor experto</Link></div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Proyecto</p>
        <a className="mt-4 inline-flex items-center gap-2 text-sm transition hover:text-white" href="https://github.com/jose09mora-code/LogistIA" target="_blank" rel="noreferrer">Ver código en GitHub<ArrowUpRight size={15} /></a>
        <p className="mt-8 text-xs text-slate-500">Logística inteligente · {new Date().getFullYear()}</p>
      </div>
    </div>
  </footer>
);
