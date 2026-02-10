"use client";

import {
  Area,
  CartesianGrid,
  Legend,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
  Bar,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type EvolutionDatum = {
  annee: number;
  recettes_milliards_eur: number;
  depenses_milliards_eur: number;
  deficit_milliards_eur: number;
  deficit_pib_pct: number;
  depenses_pib_pct: number;
  note?: string;
};

interface EvolutionChartProps {
  data: EvolutionDatum[];
}

const chartConfig = {
  recettes_milliards_eur: {
    label: "Recettes",
    color: "var(--chart-2)",
  },
  depenses_milliards_eur: {
    label: "Dépenses",
    color: "var(--chart-1)",
  },
  deficit_milliards_eur: {
    label: "Déficit",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="!aspect-auto h-[350px] w-full">
      <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="recettesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-recettes_milliards_eur)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-recettes_milliards_eur)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="depensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-depenses_milliards_eur)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-depenses_milliards_eur)" stopOpacity={0} />
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
          tickFormatter={(value) => `${value} Md€`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={[1000, 1800]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const label = name === "recettes_milliards_eur" ? "Recettes" :
                              name === "depenses_milliards_eur" ? "Dépenses" : "Déficit";
                return (
                  <div className="flex justify-between gap-4">
                    <span>{label}</span>
                    <span className="font-mono">{value} Md€</span>
                  </div>
                );
              }}
            />
          }
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => {
            if (value === "recettes_milliards_eur") return "Recettes";
            if (value === "depenses_milliards_eur") return "Dépenses";
            return value;
          }}
        />
        <ReferenceLine x={2020} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: "COVID", fontSize: 10, fill: "var(--muted-foreground)" }} />
        <Area
          type="monotone"
          dataKey="recettes_milliards_eur"
          stroke="var(--color-recettes_milliards_eur)"
          fill="url(#recettesGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="depenses_milliards_eur"
          stroke="var(--color-depenses_milliards_eur)"
          fill="url(#depensesGradient)"
          strokeWidth={2}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

export function DeficitChart({ data }: EvolutionChartProps) {
  const chartConfigDeficit = {
    deficit_pib_pct: {
      label: "Déficit (% PIB)",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfigDeficit} className="!aspect-auto h-[200px] w-full">
      <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="annee"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={[-10, 0]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine y={-3} stroke="var(--destructive)" strokeDasharray="5 5" label={{ value: "Limite UE (3%)", fontSize: 10, fill: "var(--destructive)" }} />
        <Bar
          dataKey="deficit_pib_pct"
          fill="var(--color-deficit_pib_pct)"
          radius={[4, 4, 0, 0]}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
