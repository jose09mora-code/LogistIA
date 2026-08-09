
import React, { useState } from 'react';
import { Biohazard, Ship, Truck, ChevronDown, MessageSquare, Send, Loader2, Sparkles, Brain, Info, Zap, AlertCircle } from 'lucide-react';
import { ToolType } from '../types';
import { generateLogisticsResponse } from '../services/geminiService';

interface ContentSection {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: React.ReactNode;
  themeColor: string;
  borderColor: string;
  bgColor: string;
  accentBg: string;
  suggestions: string[];
  context: string;
  content: React.ReactNode;
}

export const ContentBlocks: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, { text: string; loading: boolean }>>({});

  const toggle = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const handleTutorQuestion = async (sectionId: string, forcedQuestion?: string) => {
    const question = forcedQuestion || queries[sectionId];
    if (!question || question.trim().length < 5) return;

    const section = sections.find(s => s.id === sectionId);
    setResponses(prev => ({ ...prev, [sectionId]: { text: '', loading: true } }));
    
    try {
      const contextPrompt = `Actúa como un Tutor Senior experto en ${section?.title}. Mi duda es sobre el contenido de este bloque especializado: ${section?.context}. Responde con precisión técnica:\n\nPregunta: ${question}`;
      const stream = generateLogisticsResponse(ToolType.CONSULTANT, contextPrompt);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setResponses(prev => ({ 
          ...prev, 
          [sectionId]: { text: fullText, loading: true } 
        }));
      }
      setResponses(prev => ({ 
        ...prev, 
        [sectionId]: { text: fullText, loading: false } 
      }));
    } catch (error: any) {
      setResponses(prev => ({ 
        ...prev, 
        [sectionId]: { text: "Error: " + error.message, loading: false } 
      }));
    }
  };

  const sections: ContentSection[] = [
    {
      id: 'adr',
      title: 'Mercancías Peligrosas (ADR)',
      subtitle: 'Clasificación, etiquetado y seguridad preventiva.',
      tag: 'Normativa Especial',
      icon: <Biohazard size={24} />,
      themeColor: 'orange',
      borderColor: 'border-l-orange-500',
      bgColor: 'bg-orange-600',
      accentBg: 'bg-orange-50',
      context: 'Clasificación de las 9 clases de riesgo, paneles naranja, número ONU, equipamiento de seguridad y exenciones por cantidad limitada.',
      suggestions: ['¿Qué significa el código 33 1203?', 'Explica la Clase 7.', '¿Qué equipo debe llevar el conductor?'],
      content: (
        <div className="grid md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-orange-800 uppercase tracking-widest text-xs">Clasificación de Riesgos</h4>
            <ul className="space-y-2 text-slate-600 list-none">
              <li className="flex gap-2"><span className="font-bold text-slate-900">Clase 1:</span> Explosivos (Materia y objetos).</li>
              <li className="flex gap-2"><span className="font-bold text-slate-900">Clase 2:</span> Gases (Inflamables, no inflamables, tóxicos).</li>
              <li className="flex gap-2"><span className="font-bold text-slate-900">Clase 3:</span> Líquidos inflamables (Gasolinas, alcoholes).</li>
              <li className="flex gap-2"><span className="font-bold text-slate-900">Clases 4-6:</span> Sólidos, Tóxicas e Infecciosas.</li>
              <li className="flex gap-2"><span className="font-bold text-slate-900">Clases 7-9:</span> Radioactivas, Corrosivas y Misceláneas.</li>
            </ul>
          </div>
          <div className="space-y-4 bg-orange-50 p-6 rounded-2xl h-fit border border-orange-100 shadow-inner">
            <h4 className="font-bold text-orange-800 uppercase tracking-widest text-xs">Señalización</h4>
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-14 h-10 bg-orange-500 rounded border-2 border-black flex flex-col items-center justify-center font-bold text-[10px] text-black leading-tight shadow-sm">
                <span>33</span>
                <div className="w-full h-px bg-black/20"></div>
                <span>1203</span>
              </div>
              <p className="text-[11px] text-orange-900 pt-1"><strong>Panel Naranja:</strong> Peligro (arriba) y ONU (abajo).</p>
            </div>
            <p className="text-xs leading-relaxed text-orange-800"><strong>Equipamiento:</strong> Extintores, calzos, señales, lavaojos y linternas seguras.</p>
          </div>
        </div>
      )
    },
    {
      id: 'intl',
      title: 'Transporte Internacional',
      subtitle: 'Incoterms 2020, Convenio CMR y tránsitos aduaneros.',
      tag: 'MF1013_3',
      icon: <Ship size={24} />,
      themeColor: 'emerald',
      borderColor: 'border-l-emerald-500',
      bgColor: 'bg-emerald-600',
      accentBg: 'bg-emerald-50',
      context: 'Reglas Incoterms 2020 (EXW, FOB, CIF, DDP), Convenio CMR de transporte por carretera, Licencias comunitarias y tránsitos aduaneros.',
      suggestions: ['Diferencia entre FOB y CIF.', '¿Qué es el Cuaderno TIR?', 'Límites de responsabilidad CMR.'],
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-inner">
              <h4 className="font-bold text-emerald-900 mb-2">Incoterms 2020</h4>
              <ul className="text-[11px] space-y-2 text-emerald-800">
                <li className="flex items-start gap-1"><span className="font-bold">EXW:</span> Mínima obligación.</li>
                <li className="flex items-start gap-1"><span className="font-bold">FOB/CIF:</span> Marítimos.</li>
                <li className="flex items-start gap-1"><span className="font-bold">DDP:</span> Máxima obligación.</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-inner">
              <h4 className="font-bold text-blue-900 mb-2">Convenio CMR</h4>
              <p className="text-[11px] text-blue-800 leading-relaxed">Carta de Porte CMR, 4 ejemplares. Regula el transporte internacional terrestre.</p>
            </div>
            <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 shadow-inner">
              <h4 className="font-bold text-slate-900 mb-2">Autorizaciones</h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">Licencia Comunitaria, Bilaterales y Cuaderno TIR para tránsito.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cap',
      title: 'Distribución Capilar',
      subtitle: 'Última milla, optimización de costes y calidad de servicio.',
      tag: 'MF1012_3',
      icon: <Truck size={24} />,
      themeColor: 'blue',
      borderColor: 'border-l-blue-600',
      bgColor: 'bg-blue-700',
      accentBg: 'bg-blue-50',
      context: 'Gestión de la última milla, costes directos e indirectos del transporte, indicadores de calidad KPI y optimización de redes urbanas.',
      suggestions: ['¿Cómo mejorar el OTIF?', 'Explica los costes variables.', 'KPIs esenciales en última milla.'],
      content: (
        <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-600">
          <div>
            <h4 className="font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Costes de Explotación</h4>
            <ul className="list-disc ml-4 space-y-1">
              <li><strong>Fijos:</strong> Amortización, personal, dietas.</li>
              <li><strong>Variables:</strong> Gasóleo, neumáticos.</li>
              <li><strong>Indirectos:</strong> Estructura administrativa.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Última Milla</h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-1"><span>Entregas a tiempo (OTIF)</span><span className="font-bold text-brand-600">%</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1"><span>Tasa de devoluciones</span><span className="font-bold text-brand-600">%</span></div>
              <div className="flex justify-between"><span>Kilometraje en vacío</span><span className="font-bold text-brand-600">Km</span></div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 container mx-auto px-4 max-w-5xl" id="contenidos-especializados">
      <div className="flex items-center gap-4 mb-10 border-b border-slate-200 pb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Bloques de Contenido Especializado
        </h2>
        <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
      </div>
      
      <div className="space-y-6">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const response = responses[section.id];
          
          const tagColors: Record<string, string> = {
            orange: 'bg-orange-100 text-orange-700',
            emerald: 'bg-emerald-100 text-emerald-700',
            blue: 'bg-blue-100 text-blue-700'
          };

          return (
            <div 
              key={section.id} 
              className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden border-l-[6px] transition-all duration-300 hover:shadow-md ${section.borderColor} ${isActive ? 'ring-2 ring-slate-100 scale-[1.005] shadow-lg' : 'scale-100'}`}
            >
              <div 
                className={`p-6 cursor-pointer flex items-center justify-between select-none transition-colors ${isActive ? section.accentBg + '/40' : 'hover:bg-slate-50'}`} 
                onClick={() => toggle(section.id)}
                role="button"
                aria-expanded={isActive}
              >
                <div className="flex items-center space-x-6">
                  <div className={`${section.bgColor} text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 transition-transform duration-500 ${isActive ? 'rotate-6 scale-110 shadow-inner' : ''}`}>
                    {section.icon}
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${tagColors[section.themeColor]} border border-current opacity-70`}>
                      {section.tag}
                    </span>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl mt-2 tracking-tight">{section.title}</h3>
                    <p className={`text-xs text-slate-500 font-medium transition-all duration-300 ${isActive ? 'opacity-0 h-0 overflow-hidden' : 'opacity-80 mt-1 h-auto'}`}>
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <div className={`p-2.5 rounded-full transition-all duration-500 ${isActive ? section.bgColor + ' text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                  <ChevronDown 
                    className={`transition-transform duration-700 ease-in-out ${isActive ? 'rotate-180' : ''}`} 
                    size={20}
                  />
                </div>
              </div>
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 invisible'}`}
              >
                <div className="p-8 border-t border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/50">
                  {section.content}

                  {/* IA Tutor Integration for specialized blocks */}
                  <div className="mt-12 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-inner flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white ${section.bgColor}`}><Brain size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Tutor de {section.id.toUpperCase()}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">Pregunta cualquier duda técnica sobre este bloque. La IA te responderá basándose en la normativa vigente.</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {section.suggestions.map((s, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleTutorQuestion(section.id, s)}
                            className={`text-[9px] font-black uppercase px-3 py-2 rounded-full border transition-all active:scale-90 bg-white border-slate-200 text-slate-400 hover:border-${section.themeColor}-400 hover:text-${section.themeColor}-600`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex-1 min-h-[120px]">
                        {!response ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                            <MessageSquare size={24} className="text-slate-200 mb-2" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Esperando consulta...</span>
                          </div>
                        ) : (
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                             <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Respuesta Técnica</span>
                             </div>
                             <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {response.text}
                                {response.loading && <span className="inline-block w-1.5 h-3 bg-brand-500 ml-1 animate-pulse"></span>}
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <input 
                          type="text"
                          value={queries[section.id] || ''}
                          onChange={(e) => setQueries(prev => ({ ...prev, [section.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleTutorQuestion(section.id)}
                          placeholder="Consulta al experto..."
                          className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition-all shadow-inner"
                        />
                        <button 
                          onClick={() => handleTutorQuestion(section.id)}
                          disabled={response?.loading || !queries[section.id]}
                          className={`absolute right-1.5 top-1.5 p-2 text-white rounded-xl transition-all active:scale-90 disabled:opacity-50 ${section.bgColor} shadow-lg shadow-${section.themeColor}-500/20`}
                        >
                          {response?.loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
