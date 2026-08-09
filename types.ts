import { LucideIcon } from 'lucide-react';

export interface Unit {
  id: number;
  title: string;
  desc: string;
  iconName: string; 
}

export enum ToolType {
  ROUTE = 'ROUTE',
  CONTRACT = 'CONTRACT',
  CONSULTANT = 'CONSULTANT'
}

export interface MapPoint {
  lat: number;
  lng: number;
  id: string;
  label?: string;
  timeWindow?: string;   // e.g., "09:00 - 11:00"
  weight?: number;       // e.g., 120 (in kg)
  priority?: 'alta' | 'media' | 'baja';
  notes?: string;
}

export interface RouteSettings {
  maxCapacity: number;     // e.g., 1000 kg
  trafficLevel: 'bajo' | 'medio' | 'alto' | 'critico';
  vehicleType: 'furgoneta' | 'camion' | 'motocicleta';
}

export interface GeneratedContentState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
  routeData?: number[]; // Order of point indices
}

export interface RouteResponse {
  explanation: string;
  optimizedSequence: number[]; // Indices of input points
}

export interface SavedRoute {
  id: string;
  name: string;
  timestamp: number;
  points: MapPoint[];
  routeData: number[];
  explanation: string;
  totalDistance?: number; // En kilómetros
}