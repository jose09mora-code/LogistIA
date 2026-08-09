
import React, { useState } from 'react';
/* Added Brain and Sparkles to imports */
import { Route, Calculator, Truck, Clock, FileSignature, Leaf, BookOpen, Target, Briefcase, ChevronRight, CheckCircle2, Award, Globe, Zap, BarChart3, ShieldCheck, List, Activity, ExternalLink, Library, MessageSquare, Send, Loader2, Info, Brain, Sparkles } from 'lucide-react';
import { Unit, ToolType } from '../types';
import { generateLogisticsResponse } from '../services/geminiService';

type TabType = 'modules' | 'competencies' | 'career' | 'resources';

interface UnitDetail {
  topics: string[];
  suggestions: string[];
}

const UNIT_DETAILS: Record<number, UnitDetail> = {
  1: {
    topics: ['Redes logísticas y nodos de distribución', 'Distribución Urbana de Mercancías (DUM)', 'Sistemas de transporte capilar', 'Localización de almacenes y puntos de entrega'],
    suggestions: ['¿Qué es la distribución capilar?', 'Explícame el concepto de última milla.', '¿Cómo influye la ubicación del almacén en el coste?']
  },
  2: {
    topics: ['Estructura de costes fijos y variables', 'Elaboración de presupuestos y escandallos', 'Cálculo del umbral de rentabilidad', 'Tarifas y márgenes comerciales'],
    suggestions: ['¿Diferencia entre coste fijo y variable?', '¿Cómo se calcula el coste por km?', 'Dime qué es un escandallo de costes.']
  },
  3: {
    topics: ['Clasificación técnica de vehículos', 'Pesos y dimensiones máximas', 'Normativa ADR (Mercancías Peligrosas)', 'Documentación técnica y autorizaciones'],
    suggestions: ['¿Qué es el ADR?', 'Diferencia entre MMA y carga útil.', '¿Qué distintivos ambientales existen para camiones?']
  },
  4: {
    topics: ['Reglamento 561/2006: Tiempos de conducción', 'Uso del tacógrafo digital y analógico', 'Diagramas de carga y estiba', 'Secuenciación de rutas de reparto'],
    suggestions: ['¿Cuánto tiempo puedo conducir al día?', '¿Qué es el descanso semanal reducido?', 'Explica cómo optimizar una ruta de 10 paradas.']
  },
  5: {
    topics: ['Ley del Contrato de Transporte Terrestre (LOTT)', 'Convenio CMR para transporte internacional', 'Seguros de mercancías y responsabilidad civil', 'Gestión de siniestros y reclamaciones'],
    suggestions: ['¿Qué es la Carta de Porte CMR?', 'Límites de responsabilidad del transportista.', '¿Cuándo prescribe una reclamación por daños?']
  },
  6: {
    topics: ['Logística inversa y gestión de devoluciones', 'Indicadores de calidad (KPIs)', 'Huella de carbono en el transporte', 'Atención al cliente y tratamiento de quejas'],
    suggestions: ['¿Qué es el OTIF?', 'Explica la logística inversa.', '¿Cómo reducir la huella de carbono en el reparto?']
  }
};

export const UnitsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('modules');
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [unitQueries, setUnitQueries] = useState<Record<number, string>>({});
  const [unitResponses, setUnitResponses] = useState<Record<number, { text: string; loading: boolean }>>({});

  const units: Unit[] = [
    { id: 1, iconName: 'route', title: 'Reparto y Capilaridad', desc: 'Análisis estratégico de la última milla, diseño de redes y organización operativa por zonas geográficas.' },
    { id: 2, iconName: 'calculator', title: 'Gestión Operativa', desc: 'Cálculo avanzado de costes logísticos, escandallos y determinación de tarifas competitivas.' },
    { id: 3, iconName: 'truck', title: 'Vehículos y Normativa', desc: 'Clasificación técnica de flota, gestión de pesos y dimensiones, y documentación obligatoria.' },
    { id: 4, iconName: 'clock', title: 'Planificación de Cargas', desc: 'Optimización de rutas de reparto, gestión de tiempos de conducción (tacógrafo) y cronogramas.' },
    { id: 5, iconName: 'file-signature', title: 'Contratación Legal', desc: 'Marco jurídico del transporte, seguros de mercancías, responsabilidades y gestión de incidencias.' },
    { id: 6, iconName: 'leaf', title: 'Calidad y Sostenibilidad', desc: 'Logística inversa, gestión medioambiental, huella de carbono y atención al cliente.' }
  ];

  const getIcon = (name: string, size = 32) => {
    switch (name) {
      case 'route': return <Route size={size} />;
      case 'calculator': return <Calculator size={size} />;
      case 'truck': return <Truck size={size} />;
      case 'clock': return <Clock size={size} />;
      case 'file-signature': return <FileSignature size={size} />;
      case 'leaf': return <Leaf size={size} />;
      default: return <Truck size={size} />;
    }
  };

  const handleUnitQuestion = async (unitId: number, forcedQuestion?: string) => {
    const question = forcedQuestion || unitQueries[unitId];
    if (!question || question.trim().length < 5) return;

    const unitTitle = units.find(u => u.id === unitId)?.title;
    
    setUnitResponses(prev => ({ ...prev, [unitId]: { text: '', loading: true } }));
    
    try {
      const contextPrompt = `Soy un alumno estudiando la Unidad ${unitId}: ${unitTitle} del módulo MF1012. Por favor, responde a mi duda técnica basándote en el contenido de esta unidad específica:\n\nPregunta: ${question}`;
      const stream = generateLogisticsResponse(ToolType.CONSULTANT, contextPrompt);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setUnitResponses(prev => ({ 
          ...prev, 
          [unitId]: { text: fullText, loading: true } 
        }));
      }
      setUnitResponses(prev => ({ 
        ...prev, 
        [unitId]: { text: fullText, loading: false } 
      }));
    } catch (error: any) {
      setUnitResponses(prev => ({ 
        ...prev, 
        [unitId]: { text: "Error: " + error.message, loading: false } 
      }));
    }
  };

  return (
    <section id="unidades" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-50/50 rounded-full blur-[120px] -mr-20 -mt-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <BookOpen size={14} /> Guía de Aprendizaje MF1012
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 mb-6 tracking-tight">
                Programa Formativo <span className="text-brand-600">Interactivo</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
                Explora cada unidad y consulta tus dudas con el Tutor IA experto en logística capilar.
            </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12 p-1.5 bg-slate-100 rounded-3xl flex items-center shadow-inner overflow-x-auto scrollbar-hide">
          {[
            { id: 'modules', label: 'Unidades', icon: <List size={16} /> },
            { id: 'competencies', label: 'Competencias', icon: <Target size={16} /> },
            { id: 'career', label: 'Salidas', icon: <Briefcase size={16} /> },
            { id: 'resources', label: 'Recursos', icon: <Library size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-brand-600 shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {activeTab === 'modules' && (
          <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {units.map((unit) => {
              const isExpanded = expandedUnit === unit.id;
              const details = UNIT_DETAILS[unit.id];
              const response = unitResponses[unit.id];

              return (
                <div key={unit.id} className={`group bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-brand-300 shadow-2xl ring-1 ring-brand-100' : 'border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md'}`}>
                  {/* Unit Header */}
                  <div 
                    onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                    className={`p-6 md:p-8 cursor-pointer flex items-center gap-6 select-none transition-colors ${isExpanded ? 'bg-brand-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-brand-600 text-white scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600'}`}>
                      {getIcon(unit.iconName, 28)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Unidad {unit.id}</span>
                        {isExpanded && <span className="animate-pulse flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase"><Activity size={10} /> Tutor Activo</span>}
                      </div>
                      <h3 className={`font-black text-lg md:text-xl transition-colors ${isExpanded ? 'text-brand-600' : 'text-slate-900'}`}>{unit.title}</h3>
                      {!isExpanded && <p className="text-slate-500 text-sm leading-relaxed truncate max-w-xl">{unit.desc}</p>}
                    </div>
                    <div className={`p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-brand-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                      <ChevronRight size={20} />
                    </div>
                  </div>

                  {/* Unit Content Accordion */}
                  <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 invisible'}`}>
                    <div className="p-8 border-t border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/30">
                      <div className="grid lg:grid-cols-2 gap-12">
                        {/* Syllabus Column */}
                        <div className="space-y-8">
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 mb-6">
                              <List size={16} className="text-brand-600" /> Temario Detallado
                            </h4>
                            <div className="space-y-3">
                              {details.topics.map((topic, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100 group/item">
                                  <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold group-hover/item:bg-brand-600 group-hover/item:text-white transition-colors">{i+1}</div>
                                  <span className="text-sm text-slate-600 font-medium">{topic}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-6 bg-brand-900 rounded-3xl text-white relative overflow-hidden group/card">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:scale-110 transition-transform"><BookOpen size={80} /></div>
                            <h5 className="font-black text-sm mb-2 flex items-center gap-2"><Zap size={14} className="text-brand-400" /> Objetivo de Aprendizaje</h5>
                            <p className="text-xs text-brand-100 leading-relaxed opacity-80">{unit.desc}</p>
                          </div>
                        </div>

                        {/* AI Tutor Column */}
                        <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col h-full shadow-inner">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                              <MessageSquare size={16} className="text-brand-600" /> Tutoría Personalizada
                            </h4>
                            <div className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                              <Info size={10} /> Contexto Unidad {unit.id}
                            </div>
                          </div>

                          <div className="flex-1 min-h-[150px] mb-6 space-y-4">
                            {!response ? (
                              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-3xl">
                                <Brain size={32} className="text-slate-300 mb-4" />
                                <p className="text-xs text-slate-400 font-medium">Pregunta cualquier duda técnica sobre los temas anteriores.</p>
                              </div>
                            ) : (
                              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-6 h-6 bg-brand-600 rounded-lg flex items-center justify-center text-white"><Sparkles size={12} /></div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Respuesta del Tutor</span>
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                  {response.text}
                                  {response.loading && <span className="inline-block w-1.5 h-4 bg-brand-500 ml-1 animate-pulse"></span>}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {details.suggestions.map((s, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => handleUnitQuestion(unit.id, s)}
                                  className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-brand-400 hover:text-brand-600 transition-all active:scale-95"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            
                            <div className="relative">
                              <input 
                                type="text"
                                value={unitQueries[unit.id] || ''}
                                onChange={(e) => setUnitQueries(prev => ({ ...prev, [unit.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleUnitQuestion(unit.id)}
                                placeholder="Haz una pregunta al tutor..."
                                className="w-full pl-5 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none shadow-sm transition-all"
                              />
                              <button 
                                onClick={() => handleUnitQuestion(unit.id)}
                                disabled={response?.loading || !unitQueries[unit.id]}
                                className="absolute right-2 top-2 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 active:scale-90"
                              >
                                {response?.loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Competencies Tab */}
        {activeTab === 'competencies' && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
               <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Award className="text-brand-400" /> Perfil de Egreso</h3>
               <div className="space-y-6">
                  {['Dominio de Normativa ADR', 'Optimización de Costes', 'Gestión de Flotas', 'Planificación Última Milla'].map((skill, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400"><Activity size={16} /></div>
                      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{skill}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-brand-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-center">
               <h4 className="text-5xl font-black mb-2">98%</h4>
               <p className="text-brand-100 text-sm font-bold uppercase tracking-widest">Inserción Laboral</p>
               <p className="mt-6 text-sm opacity-80 leading-relaxed italic">"Certificación oficial de Nivel 3 reconocida en el Espacio Europeo de Educación."</p>
            </div>
          </div>
        )}

        {/* Career Tab */}
        {activeTab === 'career' && (
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {['Gestor de Tráfico', 'Técnico ADR', 'Jefe de Almacén', 'Consultor Senior'].map((role, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-brand-300 transition-all text-center">
                   <div className="w-12 h-12 rounded-xl mb-6 bg-brand-50 flex items-center justify-center text-brand-600 mx-auto"><Briefcase size={20} /></div>
                   <h4 className="font-black text-slate-900 mb-2">{role}</h4>
                   <p className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Mercado Logístico 4.0</p>
                </div>
             ))}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "MITMA", desc: "Observatorio de costes y normativa oficial de transporte.", url: "https://www.transportes.gob.es", icon: <Globe /> },
                { title: "Normativa LOTT", desc: "Ley de Ordenación de los Transportes Terrestres actualizada.", url: "#", icon: <FileSignature /> },
                { title: "Manual ADR", desc: "Guía completa de clasificación de mercancías peligrosas.", url: "#", icon: <ShieldCheck /> }
              ].map((res, i) => (
                <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-200 hover:bg-white hover:border-brand-500 hover:shadow-xl transition-all flex flex-col items-center text-center">
                  <div className="text-slate-400 group-hover:text-brand-600 group-hover:scale-110 transition-all mb-6">{res.icon}</div>
                  <h4 className="font-black text-slate-900 mb-2 tracking-tight uppercase text-sm">{res.title}</h4>
                  <p className="text-slate-500 text-xs mb-6 leading-relaxed">{res.desc}</p>
                  <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-brand-600">
                    Acceder <ExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-12 p-8 bg-brand-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 border border-brand-800">
              <div className="w-16 h-16 bg-brand-800 rounded-2xl flex items-center justify-center shrink-0"><Zap className="text-brand-400" /></div>
              <div>
                <h4 className="text-lg font-black mb-1">Ecosistema Senior</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Como experto senior, tu éxito depende de la velocidad de consulta a las fuentes legales. Hemos pre-configurado la IA para actuar como enlace directo con estas bases de datos.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
