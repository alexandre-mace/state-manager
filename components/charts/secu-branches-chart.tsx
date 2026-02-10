"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type SecuBranchDatum = {
  branche: string;
  depenses_milliards_eur: number;
  description: string;
};

interface SecuBranchesChartProps {
  data: SecuBranchDatum[];
}

const chartConfig = {
  depenses_milliards_eur: {
    label: "Dépenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function SecuBranchesChart({ data }: SecuBranchesChartProps) {
  return (
    <ChartContainer config={chartConfig} className="!aspect-auto h-[320px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 12, right: 16, left: 100, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => `${value} Md€`}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="branche"
          tick={{ fontSize: 12 }}
          width={95}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="depenses_milliards_eur"
          fill="var(--color-depenses_milliards_eur)"
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
