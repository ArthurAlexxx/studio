// src/components/charts-section.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard-charts';
import { BarChart3, TrendingUp, GlassWater } from 'lucide-react';

interface ChartsSectionProps {
  macrosData: any[];
  weeklyCaloriesData: any[];
  weeklyHydrationData: any[];
}

export default function ChartsSection({ macrosData, weeklyCaloriesData, weeklyHydrationData }: ChartsSectionProps) {
  return (
    <section className="mt-8">
       <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Análise Semanal</h2>
        <p className="text-muted-foreground">Seu progresso e tendências ao longo da semana.</p>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: '100ms'}}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Macros de Hoje
                    </CardTitle>
                    <CardDescription>Distribuição de macronutrientes do dia.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DashboardCharts chartType="macros" data={macrosData} />
                </CardContent>
            </Card>
             <Card className="lg:col-span-1 shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: '200ms'}}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                        <GlassWater className="h-5 w-5 text-primary" />
                        Hidratação Semanal
                    </CardTitle>
                    <CardDescription>Seu consumo de água nos últimos 7 dias.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DashboardCharts chartType="hydration" data={weeklyHydrationData} />
                </CardContent>
            </Card>
            <Card className="lg:col-span-1 shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: '300ms'}}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Calorias da Semana
                    </CardTitle>
                    <CardDescription>Consumo de calorias nos últimos 7 dias.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DashboardCharts chartType="calories" data={weeklyCaloriesData} />
                </CardContent>
            </Card>
        </div>
    </section>
  );
}
