// src/types/user.ts

export interface UserProfile {
    fullName: string;
    email: string;
    currentStreak: number;
    lastLoginDate: string | null;
    calorieGoal: number;
    proteinGoal: number;
}
