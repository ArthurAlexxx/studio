// src/components/strava-stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, Timer, Mountain, BarChartHorizontal } from 'lucide-react';

interface StravaStatsCardsProps {
  totalDistance: number;
  totalTime: number;
  totalElevation: number;
  totalActivities: number;
}

const StatCard = ({ title, value, unit, icon: Icon }: { title: string; value: string; unit?: string, icon: React.ElementType }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
        <div className="text-2xl font-bold">
            {value}
            {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
        </div>
        </CardContent>
    </Card>
);

export default function StravaStatsCards({ totalDistance, totalTime, totalElevation, totalActivities }: StravaStatsCardsProps) {
  const hours = Math.floor(totalTime / 60);
  const minutes = Math.round(totalTime % 60);
  const formattedTime = `${hours}h ${minutes}m`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <StatCard title="Total de Atividades" value={String(totalActivities)} icon={BarChartHorizontal} />
        <StatCard title="Distância Total" value={totalDistance.toFixed(1)} unit="km" icon={Route} />
        <StatCard title="Tempo Total" value={formattedTime} icon={Timer} />
        <StatCard title="Elevação Total" value={String(Math.round(totalElevation))} unit="m" icon={Mountain} />
    </div>
  );
}
