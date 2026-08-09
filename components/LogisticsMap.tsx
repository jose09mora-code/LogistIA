
import React, { useEffect, useState, useMemo, useId } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPoint } from '../types';
import { Trash2, Search, Navigation, Loader2, Maximize2, Minimize2, Check, Edit2, X } from 'lucide-react';

// Fix for default marker icons - run once
let iconsInitialized = false;
const initIcons = () => {
  if (iconsInitialized) return;
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  iconsInitialized = true;
};

interface LogisticsMapProps {
  points: MapPoint[];
  onPointsChange: (points: MapPoint[]) => void;
  routeSequence?: number[];
  externalCenter?: [number, number];
  onAddCurrentLocation?: () => void;
  isLocating?: boolean;
  onLoadingChange?: (stage: string) => void;
}

const createNumberedIcon = (number: number, isStart: boolean, isEnd: boolean, isSpecial: boolean = false, isHovered: boolean = false) => {
  let bgClass = 'bg-brand-600 ring-4 ring-brand-100';
  if (isStart) bgClass = 'bg-emerald-500 ring-4 ring-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
  else if (isEnd) bgClass = 'bg-red-500 ring-4 ring-red-100 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
  
  if (isSpecial) bgClass = 'bg-emerald-600 ring-[6px] ring-emerald-500/30 animate-pulse';

  const glowClass = isHovered ? 'marker-glow-active scale-110 shadow-[0_0_25px_rgba(37,99,235,0.6)]' : '';

  return L.divIcon({
    html: `<div class="relative flex items-center justify-center group z-50">
        <div class="absolute w-10 h-10 ${bgClass} ${glowClass} rounded-full border-2 border-white shadow-2xl transition-all duration-300"></div>
        <span class="relative text-white font-black text-[13px] drop-shadow-md transition-transform duration-300 ${isHovered ? 'scale-110' : ''}">${number}</span>
      </div>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10]
  });
};

const createInactiveIcon = (label: string) => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center opacity-40 grayscale group">
        <div class="absolute w-8 h-8 bg-slate-400 rounded-full border-2 border-white"></div>
        <span class="relative text-white font-bold text-[10px]">${label}</span>
      </div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapController = ({ 
  centerOn, 
  routePath, 
  onAdd,
  searchQuery,
  isFullScreen
}: { 
  centerOn?: [number, number], 
  routePath?: [number, number][],
  onAdd: (lat: number, lng: number, label?: string) => void,
  searchQuery: string,
  isFullScreen: boolean
}) => {
  const map = useMap();
  
  // Ensure map adjusts size when entering/exiting full screen
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450); // Slightly more than the 300-500ms transition
    return () => clearTimeout(timer);
  }, [isFullScreen, map]);

  useEffect(() => {
    if (centerOn) {
      map.flyTo(centerOn, 16, { animate: true, duration: 1.5 });
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [centerOn, map]);

  useEffect(() => {
    if (routePath && routePath.length > 1) {
      const bounds = L.latLngBounds(routePath);
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16, animate: true });
    }
  }, [routePath, map]);

  useMapEvents({
    click(e) {
      if (!searchQuery.trim()) {
        return;
      }
      onAdd(e.latlng.lat, e.latlng.lng, searchQuery);
    },
  });

  return null;
};

export const LogisticsMap: React.FC<LogisticsMapProps> = ({ points, onPointsChange, routeSequence, externalCenter, onAddCurrentLocation, isLocating, onLoadingChange }) => {
  const mapId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [centerOn, setCenterOn] = useState<[number, number] | undefined>(undefined);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  
  // Edit State
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');

  // Initialize icons once
  useEffect(() => {
    initIcons();
  }, []);

  const toggleFullScreen = () => {
    const newState = !isFullScreen;
    setIsFullScreen(newState);
    if (newState) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('no-scroll');
      // Aggressive cleanup for Leaflet ID to prevent "Map container is already initialized"
      const container = document.getElementById(mapId);
      if (container) {
        // @ts-ignore
        delete container._leaflet_id;
      }
    };
  }, [mapId]);

  useEffect(() => {
    if (externalCenter) {
      setCenterOn([...externalCenter]);
    }
  }, [externalCenter]);

  const handleAddPoint = async (lat: number, lng: number, label?: string) => {
    const finalLabel = label || `Punto ${points.length + 1}`;
    onPointsChange([...points, { lat, lng, id: Math.random().toString(36).substr(2, 9), label: finalLabel }]);
    if (label) setSearchQuery('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    onLoadingChange?.('geocoding');
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await resp.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setCenterOn(newCenter);
        handleAddPoint(newCenter[0], newCenter[1], display_name.split(',')[0]);
        setSearchQuery('');
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsSearching(false); 
      onLoadingChange?.('idle');
    }
  };

  const startEditing = (point: MapPoint) => {
    setEditingPointId(point.id);
    setTempLabel(point.label || '');
  };

  const saveEdit = (id: string) => {
    if (!tempLabel.trim()) return;
    onPointsChange(points.map(p => p.id === id ? { ...p, label: tempLabel.trim() } : p));
    setEditingPointId(null);
  };

  const cancelEdit = () => {
    setEditingPointId(null);
    setTempLabel('');
  };

  const routePath = useMemo(() => {
    if (routeSequence && routeSequence.length > 0) {
      return routeSequence
        .filter(idx => points[idx] !== undefined)
        .map(idx => [points[idx].lat, points[idx].lng] as [number, number]);
    }
    return [];
  }, [routeSequence, points]);

  const hasActiveRoute = routeSequence && routeSequence.length > 0;

  return (
    <div className={`flex flex-col gap-4 transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-[60] bg-slate-900 p-0 sm:p-4' : 'relative'}`}>
      {!isFullScreen && (
        <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                      type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar dirección o cliente..."
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                  />
              </div>
              <button type="submit" disabled={isSearching} className="bg-brand-600 text-white px-6 rounded-xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Añadir'}
              </button>
            </form>
            <button 
              onClick={(e) => { e.preventDefault(); onAddCurrentLocation?.(); }} 
              disabled={isLocating} 
              className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 shadow-sm ${isLocating ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
            >
                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={18} />}
                <span className="text-xs">GPS Actual</span>
            </button>
        </div>
      )}

      <div className={`relative transition-all duration-500 overflow-hidden border border-slate-200 shadow-2xl ${isFullScreen ? 'h-full w-full rounded-none' : 'h-[450px] w-full rounded-3xl'}`}>
        <MapContainer 
          id={mapId}
          key={`${mapId}-${isFullScreen}`} 
          center={[40.4168, -3.7038]} 
          zoom={13} 
          zoomControl={false} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController 
            centerOn={centerOn} 
            routePath={routePath} 
            onAdd={handleAddPoint} 
            searchQuery={searchQuery} 
            isFullScreen={isFullScreen} 
          />
          
          {points.map((point, index) => {
            const isGPS = point.id.startsWith('loc-');
            const routePos = routeSequence?.indexOf(index);
            const isInRoute = routePos !== undefined && routePos !== -1;
            const isHovered = hoveredPointId === point.id;
            
            const markerIcon = isInRoute 
              ? createNumberedIcon(routePos! + 1, routePos === 0, routePos === (routeSequence!.length - 1), isGPS, isHovered)
              : hasActiveRoute ? createInactiveIcon((index + 1).toString()) : createNumberedIcon(index + 1, false, false, isGPS, isHovered);
            
            const isEditing = editingPointId === point.id;

            return (
              <React.Fragment key={point.id}>
                {isGPS && <Circle center={[point.lat, point.lng]} radius={30} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }} />}
                <Marker 
                  position={[point.lat, point.lng]} 
                  icon={markerIcon}
                  eventHandlers={{
                    mouseover: () => setHoveredPointId(point.id),
                    mouseout: () => setHoveredPointId(null),
                  }}
                >
                  <Popup 
                    closeButton={false} 
                    minWidth={180}
                    className={isHovered ? 'popup-glow-active' : ''}
                  >
                    <div className="p-2 bg-white rounded-lg min-w-[160px]">
                      {isEditing ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Nombre Entrega</p>
                          <input 
                            autoFocus
                            type="text"
                            value={tempLabel}
                            onChange={(e) => setTempLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(point.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="w-full px-2 py-1.5 border border-brand-300 rounded text-xs outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(point.id)} className="flex-1 bg-brand-600 text-white py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1"><Check size={12} /> OK</button>
                            <button onClick={cancelEdit} className="px-2 bg-slate-100 text-slate-500 py-1 rounded text-[10px] font-bold"><X size={12} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                            <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-[10px] text-white font-black">{isInRoute ? routePos! + 1 : index + 1}</div>
                            <p className="font-bold text-xs text-slate-900 truncate flex-1">{point.label}</p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button 
                              onClick={() => startEditing(point)} 
                              className="w-full text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 py-1.5 rounded flex items-center justify-center gap-1.5 hover:bg-brand-100 transition-colors"
                            >
                              <Edit2 size={12} /> Renombrar
                            </button>
                            <button 
                              onClick={() => onPointsChange(points.filter(p => p.id !== point.id))} 
                              className="w-full text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 py-1.5 rounded flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {routePath.length > 1 && (
            <>
              {/* Outer stroke for contrast */}
              <Polyline positions={routePath} pathOptions={{ color: '#fff', weight: 10, opacity: 0.8 }} />
              {/* Main path */}
              <Polyline positions={routePath} pathOptions={{ color: '#3b82f6', weight: 6, opacity: 1, lineJoin: 'round', dashArray: '1, 12' }} />
              {/* Animated effect (optional visual clue) */}
              <Polyline positions={routePath} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.6, lineJoin: 'round' }} />
            </>
          )}
        </MapContainer>
        
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); onAddCurrentLocation?.(); }} 
              disabled={isLocating} 
              className="bg-white p-3 rounded-full shadow-xl border border-slate-200 text-slate-700 hover:text-emerald-600 hover:scale-110 active:scale-90 transition-all group"
              title="Centrar en mi ubicación"
            >
                {isLocating ? <Loader2 size={24} className="animate-spin text-emerald-500" /> : <Navigation size={24} />}
            </button>
            <button 
              onClick={toggleFullScreen} 
              className={`p-3 rounded-full shadow-xl border transition-all hover:scale-110 active:scale-90 ${isFullScreen ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-700 border-slate-200'}`}
              title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
                {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
        </div>

        {hasActiveRoute && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 text-white px-5 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-2xl border border-white/10 animate-in slide-in-from-bottom-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Ruta Optimizada Activa</span>
          </div>
        )}

        {isLocating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-slate-900/80 text-white px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-2xl animate-in zoom-in-90 duration-200">
            <Loader2 size={20} className="animate-spin text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest">Buscando Posición...</span>
          </div>
        )}
      </div>

      <style>{`
        .custom-div-icon { background: none; border: none; }
        .no-scroll { overflow: hidden !important; position: fixed; width: 100%; height: 100%; }
        .leaflet-popup-content-wrapper { 
          border-radius: 16px; 
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); 
          border: 1px solid #f1f5f9; 
          transition: all 0.3s ease;
        }
        .popup-glow-active .leaflet-popup-content-wrapper {
          border-color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        .marker-glow-active {
          animation: marker-glow-pulse 1.5s infinite alternate;
        }
        @keyframes marker-glow-pulse {
          from { box-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }
          to { box-shadow: 0 0 30px rgba(37, 99, 235, 0.8); }
        }
        .leaflet-popup-tip { display: none; }
      `}</style>
    </div>
  );
};
