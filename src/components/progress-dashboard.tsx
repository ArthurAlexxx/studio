import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from './dashboard-charts';

export function ProgressDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Consumo Calórico Semanal</CardTitle>
          <CardDescription>
            Acompanhe a ingestão de calorias ao longo da semana.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <DashboardCharts chartType="calories" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Distribuição de Macros</CardTitle>
          <CardDescription>
            Análise diária de proteínas, carboidratos e gorduras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts chartType="macros" />
        </CardContent>
      </Card>
    </div>
  );
}
