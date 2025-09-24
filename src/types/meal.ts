// src/types/meal.ts
export interface Food {
  nome: string;
  porcao: number;
  unidade: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
}

export interface Totals {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
}

export interface MealData {
  alimentos: Food[];
  totais: Totals;
}

export interface MealEntry {
  id: number;
  user_id: string;
  date: string;
  meal_type: string;
  meal_data: MealData;
  created_at: string;
}
