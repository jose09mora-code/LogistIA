
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, MapPin, FileText, Loader2, Copy, Check, Info, Clock, Save, History, Trash2, FolderOpen, AlertCircle, Search, X, ChevronRight, Zap, Filter, Activity, Calendar, Lightbulb, RefreshCw, CheckCircle2, Navigation, Map as MapIcon, Database, Cpu, Layers, Users } from 'lucide-react';
import { ToolType, GeneratedContentState, MapPoint, RouteResponse, SavedRoute, RouteSettings } from '../types';
import { generateLogisticsResponse } from '../services/geminiService';
import { LogisticsMap } from './LogisticsMap';
import { RouteDetailsConfig } from './RouteDetailsConfig';

interface AIToolCardProps {
  type: ToolType;
}

type LoadingStage = 'idle' | 'validating' | 'locating' | 'geocoding' | 'connecting' | 'thinking' | 'streaming' | 'parsing' | 'calculating' | 'finalizing';
type SortOption = 'date' | 'name';
type ViewMode = 'form' | 'library';

export const AIToolCard: React.FC<AIToolCardProps> = ({ type }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [input, setInput] = useState('');
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [settings, setSettings] = useState<RouteSettings>({
    maxCapacity: 1000,
    trafficLevel: 'medio',
    vehicleType: 'furgoneta'
  });
  const [externalCenter, setExternalCenter] = useState<[number, number] | undefined>(undefined);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [shake, setShake] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [state, setState] = useState<GeneratedContentState>({
    isLoading: false,
    content: null,
    error: null,
    routeData: undefined
  });
  
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInPoints, setSearchInPoints] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  const resetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSearchInPoints(true);
    setShowFilters(false);
  };

  const isRoute = type === ToolType.ROUTE;
  const hasMinPoints = points.length >= 2;
  const isInputEmpty = input.trim().length === 0;
  const isInputValid = isRoute ? (points.length >= 2 || !isInputEmpty) : !isInputEmpty;

  useEffect(() => {
    if (type === ToolType.ROUTE) {
      const stored = localStorage.getItem('logistics_saved_routes');
      if (stored) {
        try { setSavedRoutes(JSON.parse(stored)); } catch (e) { console.error(e); }
      }
    }
    return () => { isMounted.current = false; };
  }, [type]);

  const config = {
    title: isRoute ? 'Planificador de Rutas' : 'Generador Legal',
    icon: isRoute ? MapPin : FileText,
    bgColor: isRoute ? 'bg-brand-600' : 'bg-purple-600',
    lightBg: isRoute ? 'bg-brand-50' : 'bg-purple-50',
    borderColor: isRoute ? 'border-brand-200' : 'border-purple-200',
    buttonColor: isRoute ? 'bg-brand-600 hover:bg-brand-700' : 'bg-purple-600 hover:bg-purple-700',
    placeholder: isRoute ? 'O describe tu ruta: "Reparto zona norte, 5 paradas..."' : 'Ej: Contrato de transporte, cláusulas LOTT...',
    description: isRoute ? 'Optimiza secuencias de entrega usando mapa y IA.' : 'Redacta cláusulas y contratos basados en normativa.',
    tooltip: isRoute 
      ? "IA Generativa aplicada al TSP (Traveling Salesman Problem) con restricciones de carga y tiempos."
      : "Base de conocimiento LOTT/ROTT actualizada para la redacción de contratos CMR y pactos legales.",
    example: isRoute 
      ? "Optimiza esta ruta de 5 paradas en el área metropolitana de Madrid para entrega prioritaria en farmacias, minimizando tiempos de retorno y km en vacío." 
      : "Redacta una cláusula de limitación de responsabilidad según CMR para transporte de productos electrónicos con valor declarado de 50.000€."
  };

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 'locating': return { text: 'Accediendo a sensores GPS...', icon: <Navigation size={12} className="text-emerald-500" />, progress: 20 };
      case 'geocoding': return { text: 'Buscando coordenadas exactas...', icon: <Search size={12} className="text-blue-500" />, progress: 40 };
      case 'validating': return { text: 'Verificando parámetros y contexto...', icon: <Check size={12} className="text-brand-500" />, progress: 10 };
      case 'connecting': return { text: 'Conectando con Motor Logístico AI...', icon: <Database size={12} className="text-purple-500" />, progress: 25 };
      case 'thinking': return { text: 'La IA está razonando la solución...', icon: <Sparkles size={12} className="text-amber-500" />, progress: 45 };
      case 'streaming': return { text: 'Recibiendo informe estratégico...', icon: <Activity size={12} className="text-brand-600" />, progress: 70 };
      case 'parsing': return { text: 'Interpretando datos estructurados...', icon: <Layers size={12} className="text-indigo-500" />, progress: 85 };
      case 'calculating': return { text: 'Calculando eficiencia de ruta...', icon: <Cpu size={12} className="text-brand-500" />, progress: 90 };
      case 'finalizing': return { text: 'Dibujando trazado en el mapa...', icon: <MapIcon size={12} className="text-emerald-500" />, progress: 98 };
      default: return { text: 'Procesando...', icon: <Activity size={12} className="text-brand-600" />, progress: 50 };
    }
  };

  const handleExampleClick = () => {
    const text = config.example;
    setInput(text);
    setShowValidationErrors(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = () => {
    if (state.content) {
      navigator.clipboard.writeText(state.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const handleSaveCurrentRoute = () => {
    if (!state.routeData || points.length === 0) return;
    setIsSaving(true);
    const newRoute: SavedRoute = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Ruta Optimizada ${new Date().toLocaleDateString()} - ${points.length} paradas`,
      timestamp: Date.now(),
      points: [...points],
      routeData: [...state.routeData],
      explanation: state.content || ''
    };
    
    const updated = [newRoute, ...savedRoutes];
    setSavedRoutes(updated);
    localStorage.setItem('logistics_saved_routes', JSON.stringify(updated));
    
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
    }, 2000);
  };

  const handleAddCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: "Geolocalización no soportada por el navegador." }));
      return;
    }

    setLoadingStage('locating');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setExternalCenter([latitude, longitude]);
        
        setLoadingStage('geocoding');
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await resp.json();
          const label = data.display_name ? data.display_name.split(',')[0] : "Mi Ubicación";
          
          setPoints(prev => [...prev, {
            lat: latitude,
            lng: longitude,
            id: `loc-${Date.now()}`,
            label: label
          }]);
        } catch (e) {
          setPoints(prev => [...prev, {
            lat: latitude,
            lng: longitude,
            id: `loc-${Date.now()}`,
            label: "Mi Ubicación"
          }]);
        } finally {
          setLoadingStage('idle');
        }
      },
      (error) => {
        console.error(error);
        setState(prev => ({ ...prev, error: "Error al obtener la ubicación. Por favor, revisa los permisos del navegador." }));
        setLoadingStage('idle');
      }
    );
  };

  const deleteRoute = (id: string) => {
    const updated = savedRoutes.filter(r => r.id !== id);
    setSavedRoutes(updated);
    localStorage.setItem('logistics_saved_routes', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (isRoute && points.length < 2) {
      setShowValidationErrors(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!isInputValid) { 
      setShowValidationErrors(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      textareaRef.current?.focus(); 
      return; 
    }
    
    setShowValidationErrors(false);
    setState({ isLoading: true, content: '', error: null, routeData: undefined });
    setLoadingStage('validating');
    
    try {
      setLoadingStage('connecting');
      const stream = generateLogisticsResponse(type, input, points, isRoute ? settings : undefined);
      let fullJsonString = '';
      
      setLoadingStage('thinking');
      await new Promise(resolve => setTimeout(resolve, 800));

      setLoadingStage('streaming');
      for await (const chunk of stream) {
        if (!isMounted.current) break;
        if (isRoute) {
          fullJsonString += chunk;
          const match = fullJsonString.match(/"explanation":\s*"((?:[^"\\]|\\.)*)/);
          if (match && match[1]) {
            setState(prev => ({ ...prev, content: match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') }));
          }
        } else {
          setState(prev => ({ ...prev, content: (prev.content || '') + chunk }));
        }
      }

      if (isMounted.current && isRoute) {
        setLoadingStage('parsing');
        try {
          const finalData = JSON.parse(fullJsonString.trim()) as RouteResponse;
          setLoadingStage('calculating');
          await new Promise(resolve => setTimeout(resolve, 600));
          setLoadingStage('finalizing');
          setState({ isLoading: false, content: finalData.explanation, error: null, routeData: finalData.optimizedSequence });
        } catch (e) { 
          setState(prev => ({ ...prev, isLoading: false, error: "Error de formato." })); 
        }
      } else { 
        setState(prev => ({ ...prev, isLoading: false })); 
      }
      setLoadingStage('idle');
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) { 
      setState({ isLoading: false, content: null, error: err.message }); 
      setLoadingStage('idle'); 
    }
  };

  const processedRoutes = useMemo(() => {
    let filtered = savedRoutes.filter(r => {
      const query = searchQuery.toLowerCase();
      const matchesName = r.name.toLowerCase().includes(query);
      const matchesPoints = searchInPoints && r.points.some(p => p.label?.toLowerCase().includes(query));
      const matchesSearch = matchesName || matchesPoints;

      const routeDate = new Date(r.timestamp).setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      const matchesStart = start ? routeDate >= start : true;
      const matchesEnd = end ? routeDate <= end : true;
      
      return matchesSearch && matchesStart && matchesEnd;
    });
    return filtered.sort((a, b) => sortBy === 'date' ? b.timestamp - a.timestamp : a.name.localeCompare(b.name));
  }, [savedRoutes, searchQuery, searchInPoints, sortBy, startDate, endDate]);

  const Icon = config.icon;
  const loadingInfo = getLoadingMessage();

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl">
      <div className="p-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`${config.bgColor} text-white p-3 rounded-2xl shadow-lg relative`}>
              <Icon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 group relative">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{config.title}</h3>
                <div className="relative group/info">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all cursor-help">
                    <Info size={14} />
                  </div>
                  <div className="absolute left-0 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-50 transform translate-y-2 group-hover/info:translate-y-0">
                    <p className="font-medium">{config.tooltip}</p>
                    <div className="absolute top-full left-4 border-[6px] border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  <Sparkles size={10} className="text-amber-500" />
                  <span>AI Engine 3.0</span>
              </div>
            </div>
          </div>
          
          {isRoute && (
            <button 
              onClick={() => setViewMode(viewMode === 'form' ? 'library' : 'form')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all active:scale-95 ${viewMode === 'library' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-brand-600 border-brand-200 hover:bg-brand-50'}`}
            >
              <History size={16} />
              <span className="hidden sm:inline">{viewMode === 'form' ? `Biblioteca (${savedRoutes.length})` : 'Volver'}</span>
            </button>
          )}
        </div>
        
        {isRoute && viewMode === 'library' ? (
          <div key="library-view" className="flex-1 flex flex-col min-h-[500px] animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FolderOpen size={14} className="text-brand-500" /> Historial de Planes
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')} className="p-2 bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-brand-600 transition-colors">
                      <ChevronRight size={18} className={`transition-transform ${sortBy === 'name' ? 'rotate-90' : ''}`} />
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl transition-all ${showFilters || startDate || endDate || !searchInPoints ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:text-brand-600'}`}>
                      <Filter size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por ruta o cliente..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-brand-100" />
                  </div>

                  {(showFilters || startDate || endDate || !searchInPoints) && (
                    <div className="p-5 bg-white rounded-2xl border border-brand-100 shadow-xl animate-in slide-in-from-top-2 duration-300 relative">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Desde Fecha</label>
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Hasta Fecha</label>
                          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Buscar en clientes</span>
                          </div>
                          <button 
                            onClick={() => setSearchInPoints(!searchInPoints)}
                            className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${searchInPoints ? 'bg-brand-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${searchInPoints ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button onClick={resetFilters} className="flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase transition-all bg-slate-50 rounded-xl border border-slate-100">
                          <RefreshCw size={12} /> Limpiar
                        </button>
                        <button onClick={() => setShowFilters(false)} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-brand-500/20">Aplicar</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {processedRoutes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Search size={40} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">No se encontraron rutas.</p>
                    </div>
                  ) : (
                    processedRoutes.map((route) => (
                      <div key={route.id} className="group bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-brand-300 transition-all shadow-sm hover:shadow-md">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-bold text-slate-800 truncate">{route.name}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-slate-400 uppercase">
                            <Calendar size={10} className="text-brand-500" /> {new Date(route.timestamp).toLocaleDateString()}
                            <span className="text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">{route.points.length} paradas</span>
                          </div>
                          {searchQuery && route.points.some(p => p.label?.toLowerCase().includes(searchQuery.toLowerCase())) && (
                            <div className="mt-2 flex items-center gap-1.5 text-[8px] font-black text-brand-600 bg-brand-50 px-2 py-1 rounded-lg w-fit animate-in fade-in duration-300">
                              <Users size={10} /> COINCIDENCIA EN CLIENTES
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setPoints(route.points); setState(prev => ({ ...prev, routeData: route.routeData, content: route.explanation })); setViewMode('form'); }} 
                            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-brand-700 transition-all active:scale-95 shadow-md shadow-brand-500/10"
                          >
                            Ver
                          </button>
                          <button 
                            onClick={() => deleteRoute(route.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>
        ) : (
          <div key="form-view" className="animate-in fade-in slide-in-from-left-4 duration-300 flex-1 flex flex-col">
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">{config.description}</p>
            {isRoute && (
                <div className="space-y-4 mb-6">
                  <div className={`h-[300px] relative rounded-3xl overflow-hidden border-2 shadow-inner transition-colors duration-300 ${showValidationErrors && !hasMinPoints ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}>
                      <LogisticsMap 
                        points={points} 
                        onPointsChange={(newPoints) => {
                          setPoints(newPoints);
                        }} 
                        routeSequence={state.routeData} 
                        externalCenter={externalCenter} 
                        onAddCurrentLocation={handleAddCurrentLocation} 
                        isLocating={loadingStage === 'locating' || loadingStage === 'geocoding'}
                        onLoadingChange={(stage) => setLoadingStage(stage as any)}
                      />
                  </div>
                  
                  {showValidationErrors && points.length < 2 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
                      <AlertCircle size={16} className="text-amber-500 animate-pulse" />
                      <span>Para optimizar, marca al menos 2 paradas/destinos en el mapa.</span>
                    </div>
                  )}

                  <RouteDetailsConfig
                    settings={settings}
                    setSettings={setSettings}
                    points={points}
                    setPoints={setPoints}
                    isLoading={state.isLoading}
                  />
                </div>
            )}
            
            <div className="flex items-end justify-between mb-2 px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isRoute ? 'Instrucciones Adicionales (Opcional)' : 'Instrucciones AI'}
                </label>
                <div className="flex gap-3">
                  {input.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setInput('')}
                      className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Limpiar
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={handleExampleClick} 
                    disabled={state.isLoading} 
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:border-brand-300 hover:text-brand-600 active:scale-95 disabled:opacity-50"
                  >
                      <Sparkles size={12} className="text-amber-500 group-hover:animate-pulse" />
                      Ver Ejemplo
                  </button>
                </div>
            </div>
            
            <div className={`relative transition-transform ${shake ? 'animate-shake' : ''}`}>
              <textarea 
                ref={textareaRef} 
                value={input} 
                onChange={(e) => {
                  setInput(e.target.value);
                  if (showValidationErrors && e.target.value.trim().length > 0) setShowValidationErrors(false);
                }} 
                disabled={state.isLoading} 
                rows={isRoute ? 3 : 5} 
                className={`w-full p-5 border-2 rounded-2xl bg-slate-50 text-sm focus:ring-4 outline-none transition-all resize-none shadow-inner ${showValidationErrors && isInputEmpty && !isRoute ? 'border-red-500 bg-red-50/30 focus:ring-red-50' : 'border-slate-100 focus:ring-brand-100 focus:border-brand-500'}`} 
                placeholder={config.placeholder} 
              />
              {showValidationErrors && isInputEmpty && !isRoute && (
                <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={14} className="animate-pulse" />
                  Este campo es obligatorio
                </p>
              )}
            </div>

            {(state.isLoading || loadingStage !== 'idle') && (
              <div className="mt-6 animate-in fade-in duration-300 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <span className="animate-spin text-brand-600">{loadingInfo.icon}</span>
                     <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{loadingInfo.text}</span>
                   </div>
                   <span className="text-[10px] font-black text-brand-600">{loadingInfo.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-brand-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                     style={{ width: `${loadingInfo.progress}%` }}
                   ></div>
                </div>
                
                {/* Visual Step Indicator */}
                <div className="mt-4 flex justify-between gap-1">
                  {[1, 2, 3, 4].map((step) => {
                    const isActive = (loadingInfo.progress / 25) >= (step - 0.5);
                    return (
                      <div key={step} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${isActive ? 'bg-brand-500' : 'bg-slate-200'}`}></div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8">
              <button onClick={handleGenerate} disabled={state.isLoading || loadingStage !== 'idle'} className={`w-full ${config.buttonColor} text-white font-black uppercase tracking-[0.15em] py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]`}>
                {(state.isLoading || loadingStage !== 'idle') ? <Loader2 className="animate-spin" size={22} /> : <Zap size={22} />}
                <span>{(state.isLoading || loadingStage !== 'idle') ? 'Procesando...' : 'Optimizar con IA'}</span>
              </button>
            </div>
          </div>
        )}

        <div ref={resultRef} className={`scroll-mt-24 transition-all duration-500 ${viewMode === 'library' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          {state.content !== null && (
            <div className="mt-10 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
               <div className={`p-8 ${config.lightBg}`}>
                  <div className="flex items-center justify-between mb-6 border-b border-slate-200/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100"><Clock size={16} className="text-brand-500" /></div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Informe Estratégico AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRoute && !saveSuccess && (
                        <button 
                          onClick={handleSaveCurrentRoute}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          Guardar Ruta
                        </button>
                      )}
                      {saveSuccess && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95 duration-300">
                          <CheckCircle2 size={14} /> Guardada
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-sm prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-800 font-medium leading-relaxed text-sm bg-white/60 p-8 rounded-3xl border border-white shadow-inner">{state.content}</div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleCopy}
                      className={`flex items-center gap-3 text-[10px] font-black uppercase transition-all px-5 py-2.5 rounded-xl border-2 ${isCopied ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-lg shadow-emerald-500/10' : 'bg-white text-slate-500 border-slate-100 hover:text-brand-600 hover:border-brand-200 hover:shadow-md'}`}
                    >
                      {isCopied ? <Check size={14} className="animate-in zoom-in-50" /> : <Copy size={14} />}
                      {isCopied ? '¡Copiado!' : 'Copiar al Portapapeles'}
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
