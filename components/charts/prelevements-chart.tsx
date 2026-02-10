"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PrelevementDatum = {
  type: string;
  montant_milliards_eur: number;
  pct_total: number;
  description: string;
};

interface PrelevementsChartProps {
  data: PrelevementDatum[];
}

const chartConfig = {
  montant_milliards_eur: {
    label: "Montant",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
];

export function PrelevementsChart({ data }: PrelevementsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="!aspect-auto h-[380px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 12, right: 16, left: 120, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => `${value} Md€`}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="type"
          tick={{ fontSize: 11 }}
          width={115}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="montant_milliards_eur" radius={[0, 6, 6, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
