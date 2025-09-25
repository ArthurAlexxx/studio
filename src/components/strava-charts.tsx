// src/components/strava-charts.tsx
'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

interface StravaChartsProps {
  weeklyData: { name: string; distance: number }[];
}

const chartConfig = {
  distance: {
    label: 'Distância (km)',
    color: 'hsl(var(--chart-1))',
  },
};

export default function StravaCharts({ weeklyData }: StravaChartsProps) {
  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: '100ms'}}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distância por Semana
        </CardTitle>
        <CardDescription>Volume de distância percorrida nas últimas 4 semanas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={weeklyData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              unit="km"
              className="text-xs"
            />
             <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="distance" fill="var(--color-distance)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
