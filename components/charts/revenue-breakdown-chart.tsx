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

type RevenueBreakdownDatum = {
  type: string;
  amount_eur: number;
};

interface RevenueBreakdownChartProps {
  data: RevenueBreakdownDatum[];
}

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const billionsFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

export function RevenueBreakdownChart({ data }: RevenueBreakdownChartProps) {
  return (
    <Card className="h-full">
      <CardContent className="h-[360px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="type"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.replace("Prélèvements", "Prélèv.")}
              interval={0}
              angle={-12}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tickFormatter={(value) => `${billionsFormatter.format(value / 1_000_000_000)} Md€`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
              }}
              formatter={(value: number) => [currencyFormatter.format(value), "Montant"]}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="amount_eur" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
