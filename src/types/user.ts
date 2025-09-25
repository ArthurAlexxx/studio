// src/types/user.ts

export interface UserProfile {
    fullName: string;
    email: string;
    currentStreak: number;
    hydrationStreak: number; // Sequência de dias que atingiu a meta de hidratação
    lastLoginDate: string | null;
    calorieGoal: number;
    proteinGoal: number;
    waterGoal: number; // Meta diária de água em ml
    waterIntake: number; // Consumo atual de água em ml
}
