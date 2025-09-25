// src/components/strava-activity-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { StravaActivity } from '@/types/strava';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Route, Calendar, TrendingUp, Timer, Mountain, Footprints, Bike, PersonStanding } from 'lucide-react';

interface StravaActivityCardProps {
  activity: StravaActivity;
}

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
    <div className="flex flex-col items-center text-center">
        <Icon className="h-6 w-6 text-primary mb-2" />
        <p className="font-bold text-lg text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
);

const getSportIcon = (sportType: string) => {
    switch (sportType) {
        case 'Run': return <Footprints className="h-6 w-6" />;
        case 'Ride': return <Bike className="h-6 w-6" />;
        case 'Walk': return <PersonStanding className="h-6 w-6" />;
        default: return <Activity className="h-6 w-6" />;
    }
}


export default function StravaActivityCard({ activity }: StravaActivityCardProps) {
  const activityDate = new Date(activity.data_inicio_local);
  const formattedDate = format(activityDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
  const formattedTime = format(activityDate, "HH:mm", { locale: ptBR });

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start gap-4'>
            <div className="flex-1">
                <p className="text-sm font-medium text-primary">{activity.tipo}</p>
                <CardTitle className="text-xl font-bold leading-tight mt-1">{activity.nome}</CardTitle>
                <CardDescription className="text-sm mt-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formattedDate} às {formattedTime}
                </CardDescription>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                {getSportIcon(activity.sport_type)}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <Separator className="mb-6 mt-2" />
        <div className="grid grid-cols-3 gap-4 text-center">
            <StatItem icon={Route} value={`${activity.distancia_km.toFixed(2)} km`} label="Distância" />
            <StatItem icon={Timer} value={`${Math.round(activity.tempo_min)} min`} label="Duração" />
            <StatItem icon={Mountain} value={`${Math.round(activity.elevacao_ganho)} m`} label="Elevação" />
        </div>
      </CardContent>
    </Card>
  );
}
