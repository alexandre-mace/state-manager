"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatMd } from "@/lib/format";

type LevyDatum = {
	type: string;
	amountBillionEur: number;
	shareOfTotalPct: number;
	description: string;
};

interface LeviesChartProps {
	data: LevyDatum[];
}

const chartConfig = {
	amountBillionEur: {
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

export function LeviesChart({ data }: LeviesChartProps) {
	return (
		<ChartContainer
			config={chartConfig}
			className="!aspect-auto h-[380px] w-full"
		>
			<BarChart
				title="Prélèvements obligatoires par type, en milliards d'euros"
				data={data}
				layout="vertical"
				margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
			>
				<CartesianGrid strokeDasharray="3 3" horizontal={false} />
				<XAxis
					type="number"
					tickFormatter={(value: number) => formatMd(value, 0)}
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
					cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
					content={
						<ChartTooltipContent
							formatter={(value) => (
								<div className="flex justify-between gap-4">
									<span>{chartConfig.amountBillionEur.label}</span>
									<span className="font-mono">{formatMd(Number(value))}</span>
								</div>
							)}
						/>
					}
				/>
				<Bar dataKey="amountBillionEur" radius={[0, 6, 6, 0]}>
					{data.map((entry, index) => (
						<Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
