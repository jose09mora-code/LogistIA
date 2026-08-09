import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  Legend, 
  PieChart, 
  Pie,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  Fuel, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  Sliders, 
  Activity, 
  Compass, 
  ChevronRight,
  Info,
  Calendar,
  CloudSun,
  Truck
} from 'lucide-react';

// Generates simulation values dynamically based on selected configurations
const getSimulationData = (
  driverBehavior: 'eco' | 'regular' | 'aggressive',
  weather: 'sunny' | 'rainy' | 'windy',
  trafficLevel: 'bajo' | 'medio' | 'alto',
  fleetMix: 'furgonetas' | 'mixta' | 'camiones'
) => {
  // Let's establish baseline values and modify them using multiplier rules.
  let delayTimeMult = 1.0;
  let fuelMult = 1.0;
  let efficiencyMult = 1.0;

  // Driver Behavior influence
  if (driverBehavior === 'eco') {
    delayTimeMult += 0.05; // Slightly slower
    fuelMult -= 0.15;      // MUCH lower fuel use
    efficiencyMult += 0.02;
  } else if (driverBehavior === 'aggressive') {
    delayTimeMult -= 0.08; // Slightly faster but unpredictable
    fuelMult += 0.25;      // MUCH higher fuel use
    efficiencyMult -= 0.05;
  }

  // Weather influence
  if (weather === 'rainy') {
    delayTimeMult += 0.20; // Heavy rains slow down driving
    fuelMult += 0.08;      // Extra idle and rolling resistance
    efficiencyMult -= 0.04;
  } else if (weather === 'windy') {
    delayTimeMult += 0.05;
    fuelMult += 0.12;      // Aerodynamic drag increases fuel consumption
  }

  // Traffic influence
  if (trafficLevel === 'bajo') {
    delayTimeMult -= 0.25;
    fuelMult -= 0.10;
  } else if (trafficLevel === 'alto') {
    delayTimeMult += 0.45; // Huge bottleneck delays
    fuelMult += 0.30;      // Stalling & frequent restarts
  }

  // Fleet Mix occupancy / weights
  let capacityFactor = 82; // average %
  if (fleetMix === 'furgonetas') {
    capacityFactor = 88; // easier to pack tightly
    fuelMult -= 0.20;
  } else if (fleetMix === 'camiones') {
    capacityFactor = 74; // larger volume, harder to fully fill every route
    fuelMult += 0.45;
  }

  // Calculate dynamic KPIs
  const avgDeliveryTime = Math.round(22 * delayTimeMult * 10) / 10; // minutes
  const fuelConsumption = Math.round(11.4 * fuelMult * 10) / 10;  // L/100km
  const capacityEfficiency = Math.round(Math.min(99, capacityFactor * efficiencyMult)); // %
  const successRate = Math.round((99.5 - (trafficLevel === 'alto' ? 1.8 : 0) - (weather === 'rainy' ? 0.9 : 0)) * 10) / 10;

  // Hourly transit times
  const hourlyData = [
    { hour: '08:00', tiempo: Math.round(15 * delayTimeMult), optimo: 12, trafico: 'Bajo' },
    { hour: '10:00', tiempo: Math.round(26 * delayTimeMult), optimo: 15, trafico: 'Medio' },
    { hour: '12:00', tiempo: Math.round(34 * delayTimeMult), optimo: 18, trafico: 'Alto' },
    { hour: '14:00', tiempo: Math.round(20 * delayTimeMult), optimo: 14, trafico: 'Bajo' },
    { hour: '16:00', tiempo: Math.round(24 * delayTimeMult), optimo: 16, trafico: 'Medio' },
    { hour: '18:00', tiempo: Math.round(38 * delayTimeMult), optimo: 20, trafico: 'Alto' },
    { hour: '20:00', tiempo: Math.round(18 * delayTimeMult), optimo: 13, trafico: 'Bajo' },
  ];

  // Fuel consumption projections across 6 main logistics sectors/zones
  const fuelZones = [
    { zone: 'Norte (Residencial)', consumo: Math.round(fuelConsumption * 0.95 * 10) / 10, historico: 10.5 },
    { zone: 'Sur (Polígonos)', consumo: Math.round(fuelConsumption * 1.15 * 10) / 10, historico: 12.8 },
    { zone: 'Este (Comercial)', consumo: Math.round(fuelConsumption * 1.25 * 10) / 10, historico: 14.1 },
    { zone: 'Oeste (Industrial)', consumo: Math.round(fuelConsumption * 1.05 * 10) / 10, historico: 11.9 },
    { zone: 'Centro (Casco Histórico)', consumo: Math.round(fuelConsumption * 1.45 * 10) / 10, historico: 16.5 },
    { zone: 'Periurbana (Larga Dist.)', consumo: Math.round(fuelConsumption * 0.80 * 10) / 10, historico: 9.2 },
  ];

  // Vehicle class and loading efficiency indicators
  const vehicleEfficiency = [
    { name: 'Furgón Eléctrico', valor: Math.round(capacityEfficiency * 1.05) > 100 ? 98 : Math.round(capacityEfficiency * 1.05), fill: '#3b82f6' },
    { name: 'Camión Ligero', valor: capacityEfficiency, fill: '#8b5cf6' },
    { name: 'Moto Cargo', valor: Math.round(capacityEfficiency * 0.9) > 100 ? 95 : Math.round(capacityEfficiency * 0.9), fill: '#10b981' },
    { name: 'Vehículo Isotermo', valor: Math.round(capacityEfficiency * 0.85), fill: '#f59e0b' },
  ];

  return {
    avgDeliveryTime,
    fuelConsumption,
    capacityEfficiency,
    successRate,
    hourlyData,
    fuelZones,
    vehicleEfficiency
  };
};

export const Dashboard: React.FC = () => {
  // Simulator configurations
  const [driverBehavior, setDriverBehavior] = useState<'eco' | 'regular' | 'aggressive'>('regular');
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'windy'>('sunny');
  const [trafficLevel, setTrafficLevel] = useState<'bajo' | 'medio' | 'alto'>('medio');
  const [fleetMix, setFleetMix] = useState<'furgonetas' | 'mixta' | 'camiones'>('mixta');

  // Trigger simulated refresh indicators
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize simulated data calculations for perfect performance
  const data = useMemo(() => {
    return getSimulationData(driverBehavior, weather, trafficLevel, fleetMix);
  }, [driverBehavior, weather, trafficLevel, fleetMix]);

  const handleRandomize = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const drivers: ('eco' | 'regular' | 'aggressive')[] = ['eco', 'regular', 'aggressive'];
      const weathers: ('sunny' | 'rainy' | 'windy')[] = ['sunny', 'rainy', 'windy'];
      const traffics: ('bajo' | 'medio' | 'alto')[] = ['bajo', 'medio', 'alto'];
      const fleets: ('furgonetas' | 'mixta' | 'camiones')[] = ['furgonetas', 'mixta', 'camiones'];

      setDriverBehavior(drivers[Math.floor(Math.random() * drivers.length)]);
      setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
      setTrafficLevel(traffics[Math.floor(Math.random() * traffics.length)]);
      setFleetMix(fleets[Math.floor(Math.random() * fleets.length)]);
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        
        {/* Dashboard Title & Introduction */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                Sección Analítica
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Recharts v2
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              Cuadro de Mando Logístico AI
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Indicadores clave de eficiencia, tiempos y consumo energético para la distribución de última milla.
            </p>
          </div>
          
          {/* Quick Stats Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRandomize}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Simular Escenario
            </button>
          </div>
        </div>

        {/* Dynamic Simulation Controls (Fully Mobile Responsive Grid) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Style Selector 1: Conducción */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Comportamiento Chofer
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['eco', 'regular', 'aggressive'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setDriverBehavior(b)}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                      driverBehavior === b 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {b === 'eco' ? '🌱 Eco' : b === 'regular' ? '⚖️ Regular' : '⚡ Rápido'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector 2: Clima */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Condiciones de Clima
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['sunny', 'rainy', 'windy'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                      weather === w 
                        ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' 
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {w === 'sunny' ? '☀️ Sol' : w === 'rainy' ? '🌧️ Lluvia' : '💨 Viento'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector 3: Tráfico */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Intensidad Tráfico
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['bajo', 'medio', 'alto'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrafficLevel(t)}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                      trafficLevel === t 
                        ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' 
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {t === 'bajo' ? '🟢 Fluvial' : t === 'medio' ? '🟡 Medio' : '🔴 Denso'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector 4: Mix de Flota */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Configuración Flota
              </label>
              <div className="grid grid-cols-3 gap-1 grid-flow-row">
                {(['furgonetas', 'mixta', 'camiones'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFleetMix(f)}
                    className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all truncate ${
                      fleetMix === f 
                        ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm' 
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {f === 'furgonetas' ? '🚚 Vans' : f === 'mixta' ? '🚛 Mixta' : '🚛 Rígidos'}
                  </button>
                ))}
              </div>
            </div>

          </div>
          
          {/* Active Preset Notification */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100">
            <span className="flex items-center gap-2">
              <Sliders size={15} className="text-brand-600 shrink-0" />
              <span>
                Simulación activa: comportamiento <b>{driverBehavior.toUpperCase()}</b> en un día <b>{weather === 'sunny' ? 'SOLEADO' : weather === 'rainy' ? 'LLUVIOSO' : 'CON VIENTO'}</b> y tráfico urbano de nivel <b>{trafficLevel.toUpperCase()}</b>.
              </span>
            </span>
            <div className="shrink-0 flex items-center gap-1.5 font-bold text-slate-800 bg-white shadow-xs py-1 px-3 rounded-lg border border-slate-200">
              <Compass size={14} className="text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
              Coherente con MF1013
            </div>
          </div>
        </div>

        {/* METRICS ROW (4 dynamic cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Tiempo Promedio de Entrega */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">T. Promedio Entrega</span>
              <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                <Clock size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.avgDeliveryTime}</span>
                <span className="text-xs font-bold text-slate-500">min/parada</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {trafficLevel === 'alto' ? '⚠️ Retraso por cuello de botella' : '✅ Flujo óptimo de tránsito'}
              </p>
            </div>
            {/* Tiny absolute background design */}
            <div className="absolute right-0 bottom-0 w-16 h-16 bg-brand-50 rounded-tl-full opacity-30 -z-0 group-hover:scale-125 transition-all"></div>
          </div>

          {/* Card 2: Consumo de Combustible Proyectado */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo Proyectado</span>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Fuel size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.fuelConsumption}</span>
                <span className="text-xs font-bold text-slate-500">L/100km</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {driverBehavior === 'eco' ? '🌱 Estilo Eco-reparto activo' : '⚠️ Alta huella ambiental programada'}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-16 h-16 bg-amber-50 rounded-tl-full opacity-30 -z-0 group-hover:scale-125 transition-all"></div>
          </div>

          {/* Card 3: Eficiencia de Carga de Vehículos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eficiencia de Estiba</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.capacityEfficiency}%</span>
                <span className="text-xs font-bold text-slate-500">de ocupación</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {fleetMix === 'camiones' ? '📦 Complicado completar volumen' : '✅ Excelente cubicaje urbano'}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-16 h-16 bg-emerald-50 rounded-tl-full opacity-30 -z-0 group-hover:scale-125 transition-all"></div>
          </div>

          {/* Card 4: Tasa de Éxito en Ventana Horaria */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumplimiento Ventanas</span>
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.successRate}%</span>
                <span className="text-xs font-bold text-slate-500">exitosas</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {weather === 'rainy' ? '🌧️ Retraso climatológico' : '✅ Puntualidad en ruta óptima'}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-16 h-16 bg-purple-50 rounded-tl-full opacity-30 -z-0 group-hover:scale-125 transition-all"></div>
          </div>

        </div>

        {/* MAIN CHARTS GRID (Fully Mobile Responsive and Elegant) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Tiempo promedio de entrega por franja horaria */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Tiempos de Entrega frente a Tráfico por Franja</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Estimaciones de entrega en tiempo real de última milla</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-black">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"></span> Simulada
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span> Optimulada (Base)
                </span>
              </div>
            </div>

            {/* Container for recharts */}
            <div className="h-[280px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.hourlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                    unit="m"
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                    labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
                  />
                  <Bar dataKey="tiempo" name="Tiempo Real (min)" radius={[4, 4, 0, 0]}>
                    {data.hourlyData.map((entry, idx) => {
                      const color = entry.trafico === 'Alto' ? '#ef4444' : entry.trafico === 'Medio' ? '#f59e0b' : '#3b82f6';
                      return <Cell key={`cell-${idx}`} fill={color} />;
                    })}
                  </Bar>
                  <Bar dataKey="optimo" name="Tiempo Ideal (min)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Quick Context Tip */}
            <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-2.5 text-[11px] text-slate-500 leading-relaxed">
              <Info size={14} className="text-brand-600 shrink-0" />
              <span>
                Las franjas de <b>12:00</b> y <b>18:00</b> registran una mayor saturación por congestión de tráfico y reparto comercial, elevando el tiempo promedio de entrega por parada de forma notable.
              </span>
            </div>
          </div>

          {/* Chart 2: Eficiencia de Volumen / Capacidad de los vehículos de reparto */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Capacidad según Tipo de Vehículo</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Disponibilidad de metros cúbicos y carga (Estiba)</p>
            </div>

            <div className="h-[230px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="30%" 
                  outerRadius="100%" 
                  barSize={12} 
                  data={data.vehicleEfficiency}
                >
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 'bold' }}
                    background
                    dataKey="valor"
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0' }} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Custon Legend list for Radial chart */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
              {data.vehicleEfficiency.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }}></span>
                  <span className="text-slate-600 truncate">{item.name}:</span>
                  <span className="text-slate-900 font-black">{item.valor}%</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              <span>Máximo Óptimo: 95%</span>
              <span className="text-emerald-600">Estiba Óptima</span>
            </div>
          </div>

        </div>

        {/* SECULAR ZONE PREDICTION CHART */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Proyección de Consumo de Combustible por Zona Geográfica (Última Milla)</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">En base al comportamiento del conductor y la resistencia aerodinámica</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-wide">
              <Zap size={10} />
              Proyecciones según MF1012
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-[280px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.fuelZones}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorHistorico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="zone" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                  unit="L"
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', background: '#white', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="consumo" 
                  name="Reparto Estimado (L/100km)" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorConsumo)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="historico" 
                  name="Referencia Histórica (L/100km)" 
                  stroke="#64748b" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorHistorico)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Informational Bottom Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            <div className="space-y-1">
              <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider block">🚗 Zona Centro</span>
              <p>El stop-and-go continuo, pendientes urbanas y maniobras lentas disparan el consumo acumulado general de los motores.</p>
            </div>
            <div className="space-y-1">
              <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider block">🛣️ Periurbano</span>
              <p>Las velocidades de autovía estables reducen la inyección, favoreciendo el estilo de conducción Eco por inercia física.</p>
            </div>
            <div className="space-y-1">
              <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider block">🔄 Curvas y Pendiente</span>
              <p>Días de temporal de viento exigen mayor empuje del propulsor, con una desviación de hasta el 12% sobre el histórico ordinario.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
