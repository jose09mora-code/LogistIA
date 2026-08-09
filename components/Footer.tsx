import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-6">
            <span className="text-2xl font-bold text-white tracking-tight">MF1012</span>
            <span className="text-brand-500 text-2xl font-bold">.AI</span>
        </div>
        <p className="text-sm mb-4">
          Distribución Capilar + Integración Gemini 2.5 Flash & 3.0 Pro
        </p>
        <p className="text-xs mt-8 uppercase tracking-widest opacity-30 font-semibold">
          Logística de Futuro &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};