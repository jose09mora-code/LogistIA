import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, Globe, Activity } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <header id="inicio" className="relative overflow-hidden bg-slate-900 pt-20 pb-16 sm:py-32">
        {/* Abstract Background Shapes - Reduced for mobile performance */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 sm:opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-brand-500 blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-purple-500 blur-3xl animate-pulse-slow delay-700"></div>
        </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/50 border border-brand-500/30 text-brand-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Logística 4.0 Pro
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Distribución Capilar <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
            Inteligente
          </span>
        </h1>
        
        <p className="text-sm sm:text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed px-4">
          Optimizando la última milla con Gemini AI. Gestión de rutas en tiempo real y cumplimiento legal garantizado.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
          <Link 
            to="/tools" 
            className="group flex items-center justify-center gap-3 bg-brand-600 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl shadow-xl hover:bg-brand-500 transition-all active:scale-95"
          >
            Panel de Control
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/program" 
            className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md text-white font-bold uppercase tracking-widest text-xs px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Programa
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 text-white/40 text-[9px] font-black uppercase tracking-[0.2em] max-w-2xl mx-auto border-t border-white/5 pt-8">
            <div className="flex flex-col items-center gap-2">
                <Box size={20} className="text-brand-500" />
                <span>Carga</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-x border-white/5">
                <Globe size={20} className="text-purple-500" />
                <span>Global</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Activity size={20} className="text-pink-500" />
                <span>Real-Time</span>
            </div>
        </div>
      </div>
    </header>
  );
};