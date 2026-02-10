"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";

interface TaxDatum {
  label: string;
  amount_eur: number;
}

interface TopTaxesChartProps {
  data: TaxDatum[];
}

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const billionsFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

export function TopTaxesChart({ data }: TopTaxesChartProps) {
  return (
    <Card className="h-full">
      <CardContent className="h-[420px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 12, right: 24, left: 0, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
            <XAxis
              type="number"
              tickFormatter={(value) => `${billionsFormatter.format(value / 1_000_000_000)} Md€`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={220}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
              }}
              formatter={(value: number) => [currencyFormatter.format(value), "Recette"]}
            />
            <Bar dataKey="amount_eur" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
