// src/components/hydration-progress.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Flame, Target, Trophy } from 'lucide-react';

interface HydrationProgressProps {
  weeklyData: {
    date: Date;
    day: string;
    intake: number;
    goal: number;
  }[];
  averageIntake: number;
  goalMetPercentage: number;
  streak: number;
}

const chartConfig = {
  intake: {
    label: 'Consumido (L)',
    color: 'hsl(var(--chart-1))',
  },
  goal: {
    label: 'Meta (L)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold mb-1">{label}</p>
        <p>Consumido: <span className="font-semibold text-primary">{(data.intake / 1000).toFixed(2)}L</span></p>
        <p>Meta: <span className="font-semibold">{(data.goal / 1000).toFixed(2)}L</span></p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon: Icon, title, value, unit, color }: { icon: React.ElementType, title: string, value: string, unit: string, color: string }) => (
    <div className="flex items-center gap-4 rounded-xl border p-4 bg-secondary/30">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
                {value}
                <span className="text-base font-normal text-muted-foreground ml-1">{unit}</span>
            </p>
        </div>
    </div>
);

export default function HydrationProgress({ weeklyData, averageIntake, goalMetPercentage, streak }: HydrationProgressProps) {
  const chartData = weeklyData.map(d => ({ ...d, day: d.day.slice(0, 3) }));

  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in-down" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Seu Progresso Semanal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard
                icon={Flame}
                title="Média Diária"
                value={(averageIntake / 1000).toFixed(2)}
                unit="L"
                color="bg-sky-500"
            />
            <StatCard
                icon={Target}
                title="Consistência"
                value={goalMetPercentage.toFixed(0)}
                unit="%"
                color="bg-green-500"
            />
            <StatCard
                icon={Trophy}
                title="Sequência"
                value={streak.toString()}
                unit={streak === 1 ? 'dia' : 'dias'}
                color="bg-amber-500"
            />
        </div>

        {/* Chart Section */}
        <Tabs defaultValue="week">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month" disabled>Mês</TabsTrigger>
            <TabsTrigger value="year" disabled>Ano</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillIntake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    unit="L"
                    tickFormatter={(value) => (value / 1000).toString()}
                  />
                   <Tooltip content={<CustomTooltip />} />
                  <Area
                    dataKey="intake"
                    type="monotone"
                    fill="url(#fillIntake)"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                      fill: 'hsl(var(--background))'
                    }}
                  />
                </AreaChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
