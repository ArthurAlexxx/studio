'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const caloriesChartConfig = {
  calories: {
    label: 'Calorias',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

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

interface DashboardChartsProps {
    chartType: 'calories' | 'macros';
    data: any[];
}

export function DashboardCharts({ chartType, data }: DashboardChartsProps) {
  if (chartType === 'calories') {
    return (
      <ChartContainer config={caloriesChartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3"/>
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} stroke="#888888" />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
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
     const totalValue = React.useMemo(() => {
      return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);
    
    return (
      <ChartContainer
        config={macrosChartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              paddingAngle={5}
            >
               {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
               <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue.toFixed(1)}g
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
             <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-mt-4"
             />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  return null;
}
