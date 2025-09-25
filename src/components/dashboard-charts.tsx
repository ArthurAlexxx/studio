'use client';

import * as React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Cell, LineChart, Line } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const caloriesChartConfig = {
  calories: {
    label: 'Calorias',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const hydrationChartConfig = {
  intake: {
    label: 'Consumo (ml)',
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
    chartType: 'calories' | 'macros' | 'hydration';
    data: any[];
}

export function DashboardCharts({ chartType, data }: DashboardChartsProps) {
  if (chartType === 'calories') {
    return (
       <ChartContainer
        config={caloriesChartConfig}
        className="min-h-[250px] w-full"
      >
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
             className='text-xs'
          />
           <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className='text-xs'
           />
          <ChartTooltip
            cursor={true}
            content={
              <ChartTooltipContent
                indicator="dot"
              />
            }
          />
          <Line
            dataKey="calories"
            type="monotone"
            stroke="var(--color-calories)"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: 'var(--color-calories)',
              strokeWidth: 2,
              stroke: 'hsl(var(--background))',
            }}
            activeDot={{
                r: 6,
                strokeWidth: 2,
            }}
          />
        </LineChart>
      </ChartContainer>
    );
  }
  
  if (chartType === 'hydration') {
    return (
      <ChartContainer config={hydrationChartConfig} className="min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3"/>
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} stroke="#888888" fontSize={12} unit="ml"/>
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="intake" fill="hsl(var(--chart-2))" radius={[5, 5, 0, 0]}>
              <LabelList dataKey="intake" position="top" offset={8} className="fill-foreground" fontSize={12} />
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
