"use client";

import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatMd, formatPct } from "@/lib/format";

type EvolutionDatum = {
	year: number;
	spendingGdpPct: number;
	revenueGdpPct?: number;
	balanceGdpPct: number;
	revenueBillionEur?: number;
	spendingBillionEur?: number;
	deficit_milliards_eur?: number;
	note?: string;
	// Événement à marquer d'une ligne verticale sur le graphique
	marker?: string;
};

interface EvolutionChartProps {
	data: EvolutionDatum[];
}

const chartConfig = {
	spendingGdpPct: {
		label: "Dépenses",
		color: "var(--chart-1)",
	},
	revenueGdpPct: {
		label: "Recettes",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

// Graduations à pas régulier : le domaine automatique de Recharts tombait sur 43, 51, 59 %
const regularTicks = (values: number[], step: number) => {
	const low = Math.floor(Math.min(...values) / step) * step;
	const high = Math.ceil(Math.max(...values) / step) * step;
	return Array.from(
		{ length: Math.round((high - low) / step) + 1 },
		(_, i) => low + i * step,
	);
};

export function EvolutionChart({
	data,
	lastSurplus,
}: EvolutionChartProps & { lastSurplus?: number }) {
	const ticks = regularTicks(
		data.flatMap((d) => [
			d.spendingGdpPct,
			d.revenueGdpPct ?? d.spendingGdpPct,
		]),
		5,
	);
	return (
		<ChartContainer
			config={chartConfig}
			className="!aspect-auto h-[350px] w-full"
		>
			<ComposedChart
				data={data}
				margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
				title="Dépenses et recettes publiques en pourcentage du PIB, par année"
			>
				<defs>
					<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="5%"
							stopColor="var(--color-recettes_pib_pct)"
							stopOpacity={0.3}
						/>
						<stop
							offset="95%"
							stopColor="var(--color-recettes_pib_pct)"
							stopOpacity={0}
						/>
					</linearGradient>
					<linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="5%"
							stopColor="var(--color-depenses_pib_pct)"
							stopOpacity={0.3}
						/>
						<stop
							offset="95%"
							stopColor="var(--color-depenses_pib_pct)"
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
							labelFormatter={(_, payload) => payload?.[0]?.payload?.year}
							formatter={(value, name, item) => {
								const label =
									name === "revenueGdpPct"
										? chartConfig.revenueGdpPct.label
										: chartConfig.spendingGdpPct.label;
								const milliards =
									name === "revenueGdpPct"
										? item?.payload?.revenueBillionEur
										: item?.payload?.spendingBillionEur;
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
						if (value === "revenueGdpPct") return "Recettes (% PIB)";
						if (value === "spendingGdpPct") return "Dépenses (% PIB)";
						return value;
					}}
				/>
				{lastSurplus != null && (
					<ReferenceLine
						x={lastSurplus}
						stroke="var(--muted-foreground)"
						strokeDasharray="3 3"
						label={{
							value: "Dernier excédent",
							fontSize: 10,
							fill: "var(--muted-foreground)",
						}}
					/>
				)}
				{data
					.filter((d) => d.marker)
					.map((d) => (
						<ReferenceLine
							key={d.year}
							x={d.year}
							stroke="var(--muted-foreground)"
							strokeDasharray="3 3"
							label={{
								value: d.marker,
								fontSize: 10,
								fill: "var(--muted-foreground)",
							}}
						/>
					))}
				<Area
					type="monotone"
					dataKey="spendingGdpPct"
					stroke="var(--color-depenses_pib_pct)"
					fill="url(#spendingGradient)"
					strokeWidth={2}
				/>
				<Area
					type="monotone"
					dataKey="revenueGdpPct"
					stroke="var(--color-recettes_pib_pct)"
					fill="url(#revenueGradient)"
					strokeWidth={2}
				/>
			</ComposedChart>
		</ChartContainer>
	);
}

export function DeficitChart({
	data,
	limitPct,
}: EvolutionChartProps & { limitPct: number }) {
	const deficitChartConfig = {
		balanceGdpPct: {
			label: "Solde public (% PIB)",
			color: "var(--chart-4)",
		},
	} satisfies ChartConfig;
	// 0 et la limite inclus pour que les deux lignes de référence restent dans le cadre
	const ticks = regularTicks(
		[...data.map((d) => d.balanceGdpPct), 0, -limitPct],
		2,
	);
	const limitLabel = formatPct(limitPct);

	return (
		<ChartContainer
			config={deficitChartConfig}
			className="!aspect-auto h-[200px] w-full"
		>
			<ComposedChart
				data={data}
				margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
				title={`Solde public en pourcentage du PIB, par année, avec la limite européenne de ${limitLabel}`}
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
				<ChartTooltip
					content={
						<ChartTooltipContent
							labelFormatter={(_, payload) => payload?.[0]?.payload?.year}
							formatter={(value) => (
								<div className="flex justify-between gap-4">
									<span>{deficitChartConfig.balanceGdpPct.label}</span>
									<span className="font-mono">{formatPct(Number(value))}</span>
								</div>
							)}
						/>
					}
				/>
				<ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
				<ReferenceLine
					y={-limitPct}
					stroke="var(--destructive)"
					strokeDasharray="5 5"
					label={{
						value: `Limite UE (${limitLabel})`,
						fontSize: 10,
						fill: "var(--destructive)",
					}}
				/>
				<Bar dataKey="balanceGdpPct" fill="var(--color-deficit_pib_pct)" />
			</ComposedChart>
		</ChartContainer>
	);
}
