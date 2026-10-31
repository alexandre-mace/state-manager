"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatMd } from "@/lib/format";

type BranchDatum = {
	branch: string;
	spendingBillionEur: number;
	description: string;
};

interface SocialSecurityBranchesChartProps {
	data: BranchDatum[];
}

const chartConfig = {
	spendingBillionEur: {
		label: "Dépenses",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function SocialSecurityBranchesChart({
	data,
}: SocialSecurityBranchesChartProps) {
	return (
		<ChartContainer
			config={chartConfig}
			className="!aspect-auto h-[320px] w-full"
		>
			<BarChart
				title="Dépenses de la Sécurité sociale par branche, en milliards d'euros"
				data={data}
				layout="vertical"
				margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
			>
				<CartesianGrid strokeDasharray="3 3" horizontal={false} />
				<XAxis
					type="number"
					tickFormatter={(value: number) => formatMd(value, 0)}
					tick={{ fontSize: 12 }}
				/>
				<YAxis
					type="category"
					dataKey="branch"
					tick={{ fontSize: 12 }}
					width={95}
					tickLine={false}
					axisLine={false}
				/>
				<ChartTooltip
					cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
					content={
						<ChartTooltipContent
							formatter={(value) => (
								<div className="flex justify-between gap-4">
									<span>{chartConfig.spendingBillionEur.label}</span>
									<span className="font-mono">{formatMd(Number(value))}</span>
								</div>
							)}
						/>
					}
				/>
				<Bar
					dataKey="spendingBillionEur"
					fill="var(--color-spendingBillionEur)"
					radius={[0, 6, 6, 0]}
				/>
			</BarChart>
		</ChartContainer>
	);
}
