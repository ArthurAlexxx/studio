'use client';

import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const weeklyCaloriesData = [
  { day: 'Seg', calories: 0 },
  { day: 'Ter', calories: 0 },
  { day: 'Qua', calories: 0 },
  { day: 'Qui', calories: 0 },
  { day: 'Sex', calories: 0 },
  { day: 'Sáb', calories: 0 },
  { day: 'Dom', calories: 0 },
];

const caloriesChartConfig = {
  calories: {
    label: 'Calorias',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const macrosData = [
  { name: 'Proteínas', value: 40, fill: 'hsl(var(--chart-1))' },
  { name: 'Carboidratos', value: 40, fill: 'hsl(var(--chart-2))' },
  { name: 'Gorduras', value: 20, fill: 'hsl(var(--chart-3))' },
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyCaloriesData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3"/>
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} stroke="#888888" />
            <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                labelStyle={{ color: 'black' }}
                itemStyle={{ color: 'black' }}
                cursor={{fill: 'rgba(206, 206, 206, 0.2)'}}
            />
            <Bar dataKey="calories" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="calories" position="top" offset={8} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  if (chartType === 'macros') {
    return (
      <ChartContainer config={macrosChartConfig} className="mx-auto aspect-square max-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie
              data={macrosData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              paddingAngle={5}
            >
               {macrosData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="name"
                className="fill-foreground text-sm font-medium"
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
