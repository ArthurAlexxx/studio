// src/components/strava-activity-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { StravaActivity } from '@/types/strava';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Route, Calendar, TrendingUp } from 'lucide-react';

interface StravaActivityCardProps {
  activity: StravaActivity;
}

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
    <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <div>
            <p className="font-bold text-base text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);

const getSportIcon = (sportType: string) => {
    switch (sportType) {
        case 'Run': return <Activity className="h-6 w-6" />;
        case 'Ride': return <Activity className="h-6 w-6" />;
        case 'Walk': return <Activity className="h-6 w-6" />;
        default: return <Activity className="h-6 w-6" />;
    }
}


export default function StravaActivityCard({ activity }: StravaActivityCardProps) {
  const activityDate = new Date(activity.data_inicio_local);
  const formattedDate = format(activityDate, "dd 'de' MMMM, yyyy", { locale: ptBR });

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl">
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
                <CardTitle className="text-lg font-bold leading-tight">{activity.nome}</CardTitle>
                <CardDescription className="text-sm mt-1">{activity.tipo}</CardDescription>
            </div>
            <div className="text-primary">
                {getSportIcon(activity.sport_type)}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
            <StatItem icon={Route} value={`${activity.distancia_km.toFixed(2)} km`} label="Distância" />
            <StatItem icon={Calendar} value={`${Math.round(activity.tempo_min)} min`} label="Duração" />
            <StatItem icon={TrendingUp} value={`${Math.round(activity.elevacao_ganho)} m`} label="Elevação" />
            <StatItem icon={Calendar} value={formattedDate} label="Data" />
        </div>
      </CardContent>
    </Card>
  );
}
