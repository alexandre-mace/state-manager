"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatMd, formatPct } from "@/lib/format";

type DebtDatum = {
	year: number;
	amountBillionEur: number;
	gdpPct: number;
	note?: string;
};

interface DebtEvolutionChartProps {
	data: DebtDatum[];
}

const chartConfig = {
	gdpPct: {
		label: "Dette publique",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig;

export function DebtEvolutionChart({ data }: DebtEvolutionChartProps) {
	return (
		<ChartContainer
			config={chartConfig}
			className="!aspect-auto h-[300px] w-full"
		>
			<AreaChart
				data={data}
				margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
				title="Dette publique en milliards d'euros et en pourcentage du PIB, par année"
			>
				<defs>
					<linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="5%"
							stopColor="var(--color-pib_pct)"
							stopOpacity={0.3}
						/>
						<stop
							offset="95%"
							stopColor="var(--color-pib_pct)"
							stopOpacity={0}
						/>
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
					tickFormatter={(value: number) => formatPct(value, 0)}
					tick={{ fontSize: 11 }}
					domain={[0, "auto"]}
					tickLine={false}
					axisLine={false}
				/>
				<ChartTooltip
					content={
						<ChartTooltipContent
							labelFormatter={(_, payload) => payload?.[0]?.payload?.year}
							formatter={(value, _name, item) => (
								<div className="flex justify-between gap-4">
									<span>{chartConfig.gdpPct.label}</span>
									<span className="font-mono">
										{`${formatPct(Number(value))} du PIB`}
										{item?.payload?.amountBillionEur != null
											? ` (${formatMd(item.payload.amountBillionEur, 0)})`
											: ""}
									</span>
								</div>
							)}
						/>
					}
				/>
				<Area
					type="monotone"
					dataKey="gdpPct"
					stroke="var(--color-pib_pct)"
					fill="url(#debtGradient)"
					strokeWidth={2}
				/>
			</AreaChart>
		</ChartContainer>
	);
}
