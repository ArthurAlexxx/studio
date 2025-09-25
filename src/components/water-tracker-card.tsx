// src/components/water-tracker-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Minus, Plus, GlassWater } from 'lucide-react';
import { Progress } from './ui/progress';
import { useState, useEffect, useCallback } from 'react';

interface WaterTrackerCardProps {
  waterIntake: number;
  waterGoal: number;
  onWaterUpdate: (newIntake: number) => Promise<void>;
}

const CUP_SIZE = 250; // Tamanho do copo em ml

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export default function WaterTrackerCard({ waterIntake, waterGoal, onWaterUpdate }: WaterTrackerCardProps) {
  const [localIntake, setLocalIntake] = useState(waterIntake);

  useEffect(() => {
    setLocalIntake(waterIntake);
  }, [waterIntake]);

  const debouncedUpdate = useCallback(debounce(onWaterUpdate, 500), [onWaterUpdate]);

  const handleIntakeChange = (newIntake: number) => {
    const clampedIntake = Math.max(0, newIntake);
    setLocalIntake(clampedIntake);
    debouncedUpdate(clampedIntake);
  };

  const handleAddWater = () => {
    handleIntakeChange(localIntake + CUP_SIZE);
  };

  const handleRemoveWater = () => {
    handleIntakeChange(localIntake - CUP_SIZE);
  };

  const progress = waterGoal > 0 ? Math.min((localIntake / waterGoal) * 100, 100) : 0;

  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-xl">
          <GlassWater className="h-6 w-6 text-primary" />
          Hidratação Diária
        </CardTitle>
        <CardDescription>Clique para adicionar ou remover copos de 250ml.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="flex items-center justify-center gap-4 my-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleRemoveWater}
            disabled={localIntake <= 0}
          >
            <Minus className="h-6 w-6" />
          </Button>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">
              {(localIntake / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-2xl text-muted-foreground"> L</span>
            </p>
            <p className="text-sm text-muted-foreground">Meta: {(waterGoal / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}L</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleAddWater}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        <div className="mt-4">
            <Progress value={progress} className="h-3" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>{Math.round(progress)}%</span>
                <span>100%</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
