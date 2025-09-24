'use client';

import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const weeklyCaloriesData = [
  { day: 'Seg', calories: 2200, goal: 2000 },
  { day: 'Ter', calories: 1980, goal: 2000 },
  { day: 'Qua', calories: 2150, goal: 2000 },
  { day: 'Qui', calories: 2050, goal: 2000 },
  { day: 'Sex', calories: 2300, goal: 2000 },
  { day: 'Sáb', calories: 2500, goal: 2000 },
  { day: 'Dom', calories: 2100, goal: 2000 },
];

const caloriesChartConfig = {
  calories: {
    label: 'Calorias',
    color: 'hsl(var(--chart-1))',
  },
  goal: {
    label: 'Meta',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const macrosData = [
  { name: 'Proteínas', value: 120, fill: 'hsl(var(--chart-1))' },
  { name: 'Carboidratos', value: 250, fill: 'hsl(var(--chart-2))' },
  { name: 'Gorduras', value: 70, fill: 'hsl(var(--chart-3))' },
];

const macrosChartConfig = {
  value: {
    label: 'Gramas',
  },
  Proteínas: {
    label: 'Proteínas',
    color: 'hsl(var(--chart-1))',
  },
  Carboidratos: {
    label: 'Carboidratos',
    color: 'hsl(var(--chart-2))',
  },
  Gorduras: {
    label: 'Gorduras',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function DashboardCharts({ chartType }: { chartType: 'calories' | 'macros' }) {
  if (chartType === 'calories') {
    return (
      <ChartContainer config={caloriesChartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={weeklyCaloriesData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="calories" fill="var(--color-calories)" radius={4}>
              <LabelList dataKey="calories" position="top" offset={8} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  if (chartType === 'macros') {
    return (
      <ChartContainer config={macrosChartConfig} className="mx-auto aspect-square max-h-[350px]">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie
              data={macrosData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <LabelList
                dataKey="name"
                className="fill-background text-sm font-medium"
                stroke="none"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  return null;
}
