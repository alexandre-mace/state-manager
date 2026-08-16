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
  depenses_pib_pct: number;
  recettes_pib_pct?: number;
  deficit_pib_pct: number;
  recettes_milliards_eur?: number;
  depenses_milliards_eur?: number;
  deficit_milliards_eur?: number;
  note?: string;
};

interface EvolutionChartProps {
  data: EvolutionDatum[];
}

const chartConfig = {
  depenses_pib_pct: {
    label: "Dépenses",
    color: "var(--chart-1)",
  },
  recettes_pib_pct: {
    label: "Recettes",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const formatPct = (value: number) =>
  `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="!aspect-auto h-[350px] w-full">
      <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="recettesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-recettes_pib_pct)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-recettes_pib_pct)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="depensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-depenses_pib_pct)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-depenses_pib_pct)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="annee"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(value) => `${value} %`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => {
                const label = name === "recettes_pib_pct" ? "Recettes" : "Dépenses";
                const milliards =
                  name === "recettes_pib_pct"
                    ? item?.payload?.recettes_milliards_eur
                    : item?.payload?.depenses_milliards_eur;
                return (
                  <div className="flex justify-between gap-4">
                    <span>{label}</span>
                    <span className="font-mono">
                      {formatPct(Number(value))}
                      {milliards != null ? ` (${milliards} Md€)` : ""}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => {
            if (value === "recettes_pib_pct") return "Recettes (% PIB)";
            if (value === "depenses_pib_pct") return "Dépenses (% PIB)";
            return value;
          }}
        />
        <ReferenceLine x={1974} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: "Dernier excédent", fontSize: 10, fill: "var(--muted-foreground)" }} />
        <ReferenceLine x={2020} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: "COVID", fontSize: 10, fill: "var(--muted-foreground)" }} />
        <Area
          type="monotone"
          dataKey="depenses_pib_pct"
          stroke="var(--color-depenses_pib_pct)"
          fill="url(#depensesGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="recettes_pib_pct"
          stroke="var(--color-recettes_pib_pct)"
          fill="url(#recettesGradient)"
          strokeWidth={2}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

export function DeficitChart({ data }: EvolutionChartProps) {
  const chartConfigDeficit = {
    deficit_pib_pct: {
      label: "Solde public (% PIB)",
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
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 1", "dataMax + 1"]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
        <ReferenceLine y={-3} stroke="var(--destructive)" strokeDasharray="5 5" label={{ value: "Limite UE (3%)", fontSize: 10, fill: "var(--destructive)" }} />
        <Bar
          dataKey="deficit_pib_pct"
          fill="var(--color-deficit_pib_pct)"
        />
      </ComposedChart>
    </ChartContainer>
  );
}
