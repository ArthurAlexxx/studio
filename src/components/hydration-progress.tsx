// src/components/hydration-progress.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface HydrationProgressProps {
  weeklyData: {
    date: Date;
    day: string;
    intake: number;
    goal: number;
  }[];
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
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              {(payload[0].value / 1000).toFixed(2)}L
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function HydrationProgress({ weeklyData }: HydrationProgressProps) {
  const chartData = weeklyData.map(d => ({ ...d, day: d.day.slice(0, 3) }));

  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in-down" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Circles Progress */}
        <div className="flex justify-around">
          {weeklyData.map((dayData, index) => {
            const goalMet = dayData.intake >= dayData.goal;
            return (
              <div key={index} className="flex flex-col items-center gap-2 text-center">
                {goalMet && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                {!goalMet && <div className="h-2 w-2 rounded-full bg-transparent"></div>}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold",
                    goalMet ? "border-blue-500 bg-blue-500/10 text-blue-600" : "border-border text-muted-foreground"
                  )}
                >
                  {format(dayData.date, 'dd')}
                </div>
                <p className="text-xs font-medium text-muted-foreground">{format(dayData.date, 'E')}</p>
              </div>
            );
          })}
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
