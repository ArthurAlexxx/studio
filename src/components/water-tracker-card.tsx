// src/components/water-tracker-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Minus, Plus, GlassWater } from 'lucide-react';
import { Progress } from './ui/progress';

interface WaterTrackerCardProps {
  waterIntake: number;
  waterGoal: number;
  onWaterUpdate: (newIntake: number) => void;
}

const CUP_SIZE = 250; // Tamanho do copo em ml

export default function WaterTrackerCard({ waterIntake, waterGoal, onWaterUpdate }: WaterTrackerCardProps) {
  const progress = waterGoal > 0 ? Math.min((waterIntake / waterGoal) * 100, 100) : 0;

  const handleAddWater = () => {
    onWaterUpdate(waterIntake + CUP_SIZE);
  };

  const handleRemoveWater = () => {
    onWaterUpdate(waterIntake - CUP_SIZE);
  };

  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-xl">
          <GlassWater className="h-6 w-6 text-primary" />
          Hidratação Diária
        </CardTitle>
        <CardDescription>Acompanhe seu consumo de água ao longo do dia.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4 my-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleRemoveWater}
            disabled={waterIntake <= 0}
          >
            <Minus className="h-6 w-6" />
          </Button>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">
              {(waterIntake / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-2xl text-muted-foreground">L</span>
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
