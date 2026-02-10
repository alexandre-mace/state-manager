"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type DebtDatum = {
  annee: number;
  montant_milliards_eur: number;
  pib_pct: number;
  note?: string;
};

interface DebtEvolutionChartProps {
  data: DebtDatum[];
}

const chartConfig = {
  montant_milliards_eur: {
    label: "Dette publique",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

export function DebtEvolutionChart({ data }: DebtEvolutionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="!aspect-auto h-[300px] w-full">
      <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-montant_milliards_eur)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-montant_milliards_eur)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="annee"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => `${currencyFormatter.format(value)} Md€`}
          tick={{ fontSize: 11 }}
          domain={[2000, "auto"]}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
        />
        <Area
          type="monotone"
          dataKey="montant_milliards_eur"
          stroke="var(--color-montant_milliards_eur)"
          fill="url(#debtGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
