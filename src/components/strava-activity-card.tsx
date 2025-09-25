// src/components/strava-activity-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { StravaActivity } from '@/types/strava';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Route, Calendar, Timer, Mountain, Footprints, Bike, PersonStanding } from 'lucide-react';

interface StravaActivityCardProps {
  activity: StravaActivity;
}

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
    <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <div className='flex flex-col sm:flex-row sm:items-baseline sm:gap-2'>
            <p className="font-semibold text-base text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
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
  const formattedDate = format(activityDate, "dd 'de' MMM, yyyy", { locale: ptBR });
  const formattedTime = format(activityDate, "HH:mm", { locale: ptBR });

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl w-full">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex w-full sm:w-auto items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                {getSportIcon(activity.sport_type)}
            </div>
            <div className="flex-1">
                <CardTitle className="text-base font-bold leading-tight">{activity.nome}</CardTitle>
                <CardDescription className="text-sm flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate} às {formattedTime}
                </CardDescription>
            </div>
        </div>

        <Separator orientation='vertical' className="h-12 hidden sm:block mx-4" />
        <Separator className="sm:hidden" />
        
        <div className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2 sm:pt-0">
            <StatItem icon={Route} value={`${activity.distancia_km.toFixed(2)}`} label="km" />
            <StatItem icon={Timer} value={`${Math.round(activity.tempo_min)}`} label="min" />
            <StatItem icon={Mountain} value={`${Math.round(activity.elevacao_ganho)}`} label="m" />
        </div>
      </CardContent>
    </Card>
  );
}
