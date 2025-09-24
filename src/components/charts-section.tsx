// src/components/charts-section.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard-charts';
import { BarChart } from 'lucide-react';

interface ChartsSectionProps {
  macrosData: any[];
  weeklyCaloriesData: any[];
}

/**
 * @fileoverview Componente que exibe a seção de gráficos no dashboard.
 * Contém o gráfico de distribuição de macronutrientes e o de evolução semanal.
 */
export default function ChartsSection({ macrosData, weeklyCaloriesData }: ChartsSectionProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Distribuição de Macronutrientes
          </CardTitle>
          <CardDescription>Proporção dos macronutrientes consumidos hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts chartType="macros" data={macrosData} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Evolução Semanal
          </CardTitle>
          <CardDescription>Consumo de calorias nos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts chartType="calories" data={weeklyCaloriesData} />
        </CardContent>
      </Card>
    </div>
  );
}
