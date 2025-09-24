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
