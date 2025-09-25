// src/components/hydration-charts.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface HydrationChartsProps {
  weeklyData: {
    day: string;
    intake: number;
    goal: number;
  }[];
}

const chartConfig = {
  intake: {
    label: 'Consumido (ml)',
    color: 'hsl(var(--chart-1))',
  },
  goal: {
    label: 'Meta (ml)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


export default function HydrationCharts({ weeklyData }: HydrationChartsProps) {
  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: '200ms'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Evolução da Hidratação
          </CardTitle>
          <CardDescription>Consumo de água nos últimos 7 dias.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} stroke="#888888" fontSize={12} unit="ml" />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Legend />
                <Bar dataKey="intake" name="Consumido" fill="var(--color-intake)" radius={[5, 5, 0, 0]}>
                  <LabelList dataKey="intake" position="top" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => value > 0 ? value : ''}/>
                </Bar>
                <Line type="monotone" dataKey="goal" name="Meta" stroke="var(--color-goal)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
  );
}
