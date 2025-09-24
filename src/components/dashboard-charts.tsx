'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const caloriesChartConfig = {
  calories: {
    label: 'Calorias',
    color: 'hsl(var(--chart-2))',
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
    color: 'hsl(var(--chart-3))',
  },
  Gorduras: {
    label: 'Gorduras',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface DashboardChartsProps {
    chartType: 'calories' | 'macros';
    data: any[];
}

export function DashboardCharts({ chartType, data }: DashboardChartsProps) {
  if (chartType === 'calories') {
    return (
      <ChartContainer config={caloriesChartConfig} className="min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3"/>
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} stroke="#888888" fontSize={12} />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="calories" fill="hsl(var(--chart-1))" radius={[5, 5, 0, 0]}>
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
        className="mx-auto aspect-square max-h-[250px]"
      >
        <ResponsiveContainer width="100%" height={250}>
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
              innerRadius={65}
              outerRadius={90}
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
                          {totalValue.toFixed(0)}g
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
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
