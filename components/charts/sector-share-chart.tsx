"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";

interface SectorShareDatum {
  year: number;
  [key: string]: number;
}

interface SectorShareChartProps {
  data: SectorShareDatum[];
  sectors: string[];
}

const percentFormatter = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const wholePercentFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const lineColors = [
  "var(--chart-1, #2563eb)",
  "var(--chart-2, #16a34a)",
  "var(--chart-3, #f59e0b)",
];

const withSpaces = (value: string) => value.replace(/\u00A0/g, " ");
const formatPercent = (value: number) => withSpaces(percentFormatter.format(value));

export function SectorShareChart({ data, sectors }: SectorShareChartProps) {
  return (
    <Card className="h-full">
      <CardContent className="h-[400px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickMargin={8} />
            <YAxis
              tickFormatter={(value) => `${withSpaces(wholePercentFormatter.format(value))} %`}
              tick={{ fontSize: 12 }}
              domain={[0, 80]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
              }}
              formatter={(value: number, key: string) => [
                formatPercent((value ?? 0) / 100),
                key,
              ]}
              labelFormatter={(label) => `Année ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {sectors.map((sector, index) => (
              <Line
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={lineColors[index % lineColors.length]}
                strokeWidth={2.5}
                strokeOpacity={0.9}
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
