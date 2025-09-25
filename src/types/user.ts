// src/types/user.ts

export interface UserProfile {
    fullName: string;
    email: string;
    currentStreak: number;
    // hydrationStreak: number; // Será calculado dinamicamente
    lastLoginDate: string | null;
    calorieGoal: number;
    proteinGoal: number;
    waterGoal: number; // Meta diária de água em ml
    // waterIntake: number; // Removido, agora é gerenciado em hydration_entries
}
