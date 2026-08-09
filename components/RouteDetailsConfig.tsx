import React from 'react';
import { RouteSettings, MapPoint } from '../types';
import { 
  Truck, 
  Gauge, 
  Users, 
  Clock, 
  Calendar, 
  Trash2, 
  AlertCircle, 
  Layers, 
  Eye, 
  Activity, 
  Info, 
  Plus, 
  Wrench,
  Sparkles,
  PackageCheck
} from 'lucide-react';

interface RouteDetailsConfigProps {
  settings: RouteSettings;
  setSettings: (settings: RouteSettings) => void;
  points: MapPoint[];
  setPoints: (points: MapPoint[]) => void;
  isLoading: boolean;
}

export const RouteDetailsConfig: React.FC<RouteDetailsConfigProps> = ({
  settings,
  setSettings,
  points,
  setPoints,
  isLoading
}) => {
  const updatePoint = (id: string, updates: Partial<MapPoint>) => {
    setPoints(points.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
  };

  const totalPayload = points.reduce((acc, p) => acc + (p.weight || 0), 0);
  const payloadPercentage = Math.min((totalPayload / settings.maxCapacity) * 100, 100);

  return (
    <div className="space-y-6">
      {/* 1. Global Settings Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-xl text-white">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Parámetros de Flota y Entorno
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                MF1012 Gestión de Última Milla
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-lg text-[9px] font-black text-brand-600 uppercase">
            <Activity size={10} className="animate-pulse" />
            <span>En tiempo real</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black leading-none text-slate-500 uppercase tracking-widest">
              Tipo de Vehículo
            </label>
            <select
              value={settings.vehicleType}
              onChange={(e) => setSettings({ ...settings, vehicleType: e.target.value as any })}
              disabled={isLoading}
              className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-200 transition-all cursor-pointer"
            >
              <option value="furgoneta">🚚 Furgoneta (Ligero)</option>
              <option value="camion">🚛 Camión de Reparto (Medio)</option>
              <option value="motocicleta">🛵 Motocicleta / Cargo-Bike</option>
            </select>
          </div>

          {/* Load Capacity */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black leading-none text-slate-500 uppercase tracking-widest">
              Capacidad Máx. Carga (Kg)
            </label>
            <input
              type="number"
              value={settings.maxCapacity}
              onChange={(e) => setSettings({ ...settings, maxCapacity: Math.max(1, parseInt(e.target.value) || 0) })}
              disabled={isLoading}
              min="1"
              className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-200 transition-all"
            />
          </div>

          {/* Traffic Predictor */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black leading-none text-slate-500 uppercase tracking-widest">
              Nivel de Tráfico
            </label>
            <select
              value={settings.trafficLevel}
              onChange={(e) => setSettings({ ...settings, trafficLevel: e.target.value as any })}
              disabled={isLoading}
              className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-200 transition-all cursor-pointer"
            >
              <option value="bajo">🟢 Bajo (Fluido)</option>
              <option value="medio">🟡 Moderado (Habitual)</option>
              <option value="alto">🔴 Pesado / Atascado</option>
              <option value="critico">🔥 Crítico (Cortes de Vía)</option>
            </select>
          </div>
        </div>

        {/* Payload capacity usage progress bar */}
        {points.length > 0 && (
          <div className="pt-3 border-t border-slate-200/50 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
              <span className="flex items-center gap-1.5"><PackageCheck size={13} className="text-brand-600" /> Carga Total Programada</span>
              <span className={totalPayload > settings.maxCapacity ? 'text-red-500 font-black animate-pulse' : 'text-slate-700'}>
                {totalPayload} kg / {settings.maxCapacity} kg ({payloadPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${totalPayload > settings.maxCapacity ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-brand-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'}`}
                style={{ width: `${payloadPercentage}%` }}
              />
            </div>
            {totalPayload > settings.maxCapacity && (
              <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span>Sobrecarga detectada. El algoritmo sugerirá repartir la carga o priorizar paradas críticas.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Detailed Stops/Points Customizer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Puntos de Entrega y Paradas ({points.length})
          </h4>
          <span className="text-[9px] font-bold text-slate-500">Haz clic en el mapa para añadir paradas</span>
        </div>

        {points.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-white">
            <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-sm font-semibold text-slate-600">No hay paradas añadidas al mapa</p>
            <p className="text-[11px] text-slate-400 mt-1">Busca direcciones arriba o marca ubicaciones directamente sobre el mapa.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {points.map((point, index) => {
              const weightVal = point.weight || 0;
              const hasWeightLimitError = (totalPayload > settings.maxCapacity) && weightVal > 0;

              return (
                <div 
                  key={point.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition-all shadow-sm hover:shadow-md space-y-3 flex flex-col relative"
                >
                  {/* Stop Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-[11px] text-white font-black shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={point.label || ''}
                          onChange={(e) => updatePoint(point.id, { label: e.target.value })}
                          disabled={isLoading}
                          className="font-bold text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-500 focus:bg-slate-50 px-1 py-0.5 rounded outline-none w-full"
                          placeholder="Nombre o Zona"
                        />
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5 ml-1">
                          lat: {point.lat.toFixed(5)}, lng: {point.lng.toFixed(5)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePoint(point.id)}
                      disabled={isLoading}
                      className="p-1 px-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar parada"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Operational Settings for individual Stop */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Delivery Window */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-1 leading-none">
                        Ventana de Entrega
                      </label>
                      <select
                        value={point.timeWindow || ""}
                        onChange={(e) => updatePoint(point.id, { timeWindow: e.target.value })}
                        disabled={isLoading}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-200 transition-all cursor-pointer"
                      >
                        <option value="">🕒 Libre / Sin Restricción</option>
                        <option value="08:00 - 10:00">🌅 Mañana Primera (08:00 - 10:00)</option>
                        <option value="10:00 - 12:00">🌤️ Mañana Media (10:00 - 12:00)</option>
                        <option value="12:00 - 14:00">☀️ Almuerzo (12:00 - 14:00)</option>
                        <option value="14:00 - 16:00">🌤️ Mediodía (14:00 - 16:00)</option>
                        <option value="16:00 - 18:00">🌇 Tarde Primera (16:00 - 18:00)</option>
                        <option value="18:00 - 20:00">🌌 Tarde Última (18:00 - 20:00)</option>
                      </select>
                    </div>

                    {/* Weight Cargo */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-1 leading-none">
                        Carga Asignada (Kg)
                      </label>
                      <input
                        type="number"
                        value={point.weight === undefined ? 0 : point.weight}
                        onChange={(e) => updatePoint(point.id, { weight: Math.max(0, parseInt(e.target.value) || 0) })}
                        disabled={isLoading}
                        min="0"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                        placeholder="Ej: 50"
                      />
                    </div>

                    {/* Priority Selector */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-1 leading-none">
                        Prioridad
                      </label>
                      <div className="flex gap-1">
                        {(['baja', 'media', 'alta'] as const).map((prio) => {
                          const labelMap = { baja: '🟢', media: '🟡', alta: '🔴' };
                          const isSelected = (point.priority || 'media') === prio;
                          return (
                            <button
                              key={prio}
                              type="button"
                              onClick={() => updatePoint(point.id, { priority: prio })}
                              disabled={isLoading}
                              className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1.5 rounded-lg border transition-all ${
                                isSelected 
                                  ? prio === 'alta' 
                                    ? 'bg-red-50 text-red-600 border-red-200 font-bold shadow-sm'
                                    : prio === 'media'
                                      ? 'bg-amber-50 text-amber-600 border-amber-200 font-bold shadow-sm'
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold shadow-sm'
                                  : 'bg-slate-50 text-slate-400 border-slate-150 hover:bg-slate-100 hover:text-slate-600'
                              }`}
                            >
                              {labelMap[prio]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Custom Notes / Delivery Info */}
                  <div className="relative">
                    <input
                      type="text"
                      value={point.notes || ""}
                      onChange={(e) => updatePoint(point.id, { notes: e.target.value })}
                      disabled={isLoading}
                      className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                      placeholder="Notas del destinatario: e.g. timbre de aviso, callejón estrecho..."
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">📝</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
