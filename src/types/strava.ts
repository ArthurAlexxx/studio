// src/types/strava.ts
export interface StravaActivity {
    id: number;
    nome: string;
    tipo: string;
    sport_type: string;
    distancia_km: number;
    tempo_min: number;
    elevacao_ganho: number;
    data_inicio_local: string;
  }
  