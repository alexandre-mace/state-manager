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
import { formatMd, formatPct } from "@/lib/format";

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

// Graduations à pas régulier : le domaine automatique de Recharts tombait sur 43, 51, 59 %
const regularTicks = (values: number[], step: number) => {
  const low = Math.floor(Math.min(...values) / step) * step;
  const high = Math.ceil(Math.max(...values) / step) * step;
  return Array.from({ length: Math.round((high - low) / step) + 1 }, (_, i) => low + i * step);
};

export function EvolutionChart({ data, dernierExcedent }: EvolutionChartProps & { dernierExcedent?: number }) {
  const ticks = regularTicks(
    data.flatMap((d) => [d.depenses_pib_pct, d.recettes_pib_pct ?? d.depenses_pib_pct]),
    5,
  );
  return (
    <ChartContainer config={chartConfig} className="!aspect-auto h-[350px] w-full">
      <ComposedChart
        data={data}
        margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
        title="Dépenses et recettes publiques en pourcentage du PIB, par année"
      >
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
          tickFormatter={(value: number) => formatPct(value)}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          ticks={ticks}
          domain={[ticks[0], ticks[ticks.length - 1]]}
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
                      {milliards != null ? ` (${formatMd(milliards, 0)})` : ""}
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
        {dernierExcedent != null && <ReferenceLine x={dernierExcedent} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: "Dernier excédent", fontSize: 10, fill: "var(--muted-foreground)" }} />}
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
  // 0 et -3 inclus pour que les deux lignes de référence restent dans le cadre
  const ticks = regularTicks([...data.map((d) => d.deficit_pib_pct), 0, -3], 2);

  return (
    <ChartContainer config={chartConfigDeficit} className="!aspect-auto h-[200px] w-full">
      <ComposedChart
        data={data}
        margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
        title="Solde public en pourcentage du PIB, par année, avec la limite européenne de 3 %"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="annee"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(value: number) => formatPct(value)}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          ticks={ticks}
          domain={[ticks[0], ticks[ticks.length - 1]]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
        <ReferenceLine y={-3} stroke="var(--destructive)" strokeDasharray="5 5" label={{ value: "Limite UE (3\u00a0%)", fontSize: 10, fill: "var(--destructive)" }} />
        <Bar
          dataKey="deficit_pib_pct"
          fill="var(--color-deficit_pib_pct)"
        />
      </ComposedChart>
    </ChartContainer>
  );
}
