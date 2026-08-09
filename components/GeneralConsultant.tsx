
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Radiation, Ship, FileText, Gauge, Loader2, Send, AlertCircle, Sparkles, Clock, Copy, Check, Lightbulb, Zap } from 'lucide-react';
import { generateLogisticsResponse } from '../services/geminiService';
import { ToolType, GeneratedContentState } from '../types';

const LOGISTICS_EXAMPLES = [
  "¿Cuáles son los requisitos específicos de señalización ADR para un vehículo que transporta Baterías de Litio (UN 3480)?",
  "Explica la diferencia de responsabilidades entre los Incoterms FOB y CIF según las reglas de 2020.",
  "¿Cómo se calculan los tiempos de conducción y descanso semanales según el Reglamento (CE) nº 561/2006?",
  "Redacta los puntos clave de una Carta de Porte CMR legalmente válida en un transporte internacional.",
  "Calcula el coste por kilómetro de un vehículo articulado de 40t basándote en el Observatorio del MITMA."
];

export const GeneralConsultant: React.FC = () => {
  const [input, setInput] = useState('');
  const [showError, setShowError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [state, setState] = useState<GeneratedContentState>({
    isLoading: false,
    content: null,
    error: null,
  });
  
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const isValid = input.trim().length >= 10;

  const handleExampleClick = () => {
    const text = LOGISTICS_EXAMPLES[exampleIndex];
    setInput('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setInput(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    setExampleIndex((prev) => (prev + 1) % LOGISTICS_EXAMPLES.length);
    setShowError(false);
  };

  const handleCopy = () => {
    if (state.content) {
      navigator.clipboard.writeText(state.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConsult = async () => {
    if (!isValid) { setShowError(true); textareaRef.current?.focus(); return; }
    setState({ isLoading: true, content: '', error: null });
    try {
      const stream = generateLogisticsResponse(ToolType.CONSULTANT, input);
      let fullContent = '';
      for await (const chunk of stream) {
        if (!isMounted.current) break;
        fullContent += chunk;
        setState(prev => ({ ...prev, content: fullContent }));
      }
      if (isMounted.current) setState(prev => ({ ...prev, isLoading: false }));
    } catch (err: any) {
      if (isMounted.current) setState({ isLoading: false, content: null, error: err.message });
    }
  };

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200" id="consultor">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking widest mb-4 border border-blue-100">
                <Zap size={12} className="fill-blue-700" /> Knowledge Base Expert
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Consultor Logístico Integral</h2>
            <p className="text-slate-600 text-lg">Resuelve dudas técnicas sobre MF1012, MF1013 y ADR en tiempo real.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col h-full relative overflow-hidden group/card">
                <div className="relative flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-slate-900 flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Brain size={24} /></div>
                      <span>Consulta Técnica</span>
                  </h3>
                  <button onClick={handleExampleClick} disabled={state.isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 group">
                      <Lightbulb size={14} className="group-hover:text-amber-500 transition-colors" />
                      <span>Ver Ejemplo</span>
                  </button>
                </div>
                
                <textarea 
                    ref={textareaRef} value={input}
                    onChange={(e) => { setInput(e.target.value); if (e.target.value.trim().length >= 10) setShowError(false); }}
                    disabled={state.isLoading}
                    className={`w-full p-5 border-2 rounded-2xl bg-slate-50 text-sm min-h-[160px] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none shadow-inner ${showError ? 'border-red-400' : 'border-slate-100'}`} 
                    placeholder="Describe tu consulta técnica aquí..."
                />
                
                <button onClick={handleConsult} disabled={state.isLoading} className="w-full mt-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all active:scale-[0.98]">
                    {state.isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                    <span>{state.isLoading ? 'Analizando...' : 'Enviar Consulta'}</span>
                </button>

                <div ref={resultRef} className="scroll-mt-24 mt-8">
                  {state.content !== null && (
                      <div className="rounded-2xl border border-blue-100 text-slate-800 shadow-sm bg-slate-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                           <div className="bg-white/60 px-5 py-3 border-b border-inherit flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA Insights</span>
                              <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 text-[9px] font-black uppercase transition-all px-2.5 py-1 rounded-lg border ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-slate-400 border-slate-200 hover:text-blue-600 hover:bg-white hover:border-blue-200 shadow-sm'}`}
                              >
                                {copied ? <Check size={12} className="animate-in zoom-in-50" /> : <Copy size={12} />}
                                {copied ? 'Copiado' : 'Copiar'}
                              </button>
                           </div>
                           <div className="p-6 prose prose-sm prose-slate max-w-none">
                              <div className="whitespace-pre-wrap font-medium leading-relaxed text-slate-800 text-sm md:text-base">{state.content}</div>
                           </div>
                      </div>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Radiation size={32} />, label: "ADR Clases", value: "9", color: "orange" },
                  { icon: <Ship size={32} />, label: "Incoterms", value: "11", color: "emerald" },
                  { icon: <FileText size={32} />, label: "CMR", value: "INT", color: "blue" },
                  { icon: <Gauge size={32} />, label: "Tacógrafo", value: "DIG", color: "purple" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="text-slate-600 mb-4">{stat.icon}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-3xl font-black text-slate-900 mt-1">{stat.value}</span>
                  </div>
                ))}
                <div className="col-span-2 bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Brain size={100} /></div>
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2">Asistente Activo</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">IA entrenada con los últimos manuales MF1012 para transporte capilar.</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
