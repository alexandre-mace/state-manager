"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type SpendingDatum = {
  categorie: string;
  depenses_milliards_eur: number;
  part_pct: number;
  description: string;
};

interface PublicSpendingChartProps {
  data: SpendingDatum[];
}

const chartConfig = {
  secu: {
    label: "Sécurité Sociale",
    color: "var(--chart-1)",
  },
  etat: {
    label: "État",
    color: "var(--chart-2)",
  },
  collectivites: {
    label: "Collectivités locales",
    color: "var(--chart-3)",
  },
  odac: {
    label: "Autres organismes publics",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const categoryToKey: Record<string, keyof typeof chartConfig> = {
  "Sécurité Sociale": "secu",
  "État": "etat",
  "Collectivités locales": "collectivites",
  "Autres organismes publics": "odac",
};

export function PublicSpendingChart({ data }: PublicSpendingChartProps) {
  const total = data.reduce((sum, item) => sum + item.depenses_milliards_eur, 0);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto h-[320px] w-[320px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">{value} Md€</span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={data}
          dataKey="depenses_milliards_eur"
          nameKey="categorie"
          innerRadius={70}
          outerRadius={110}
          strokeWidth={2}
          stroke="var(--background)"
        >
          {data.map((entry, index) => {
            const key = categoryToKey[entry.categorie];
            return (
              <Cell
                key={`cell-${index}`}
                fill={key ? `var(--color-${key})` : `var(--chart-${index + 1})`}
              />
            );
          })}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                      className="fill-foreground text-2xl font-bold"
                    >
                      {total.toLocaleString("fr-FR")}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground text-sm"
                    >
                      Md€
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
