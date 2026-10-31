"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatMd, formatNombre } from "@/lib/format";

type SpendingDatum = {
	categorie: string;
	depenses_milliards_eur: number;
	part_pct: number;
	description: string;
};

interface PublicSpendingChartProps {
	data: SpendingDatum[];
}

// Une couleur par catégorie, dans l'ordre du JSON : aucun libellé recopié ici, une catégorie
// renommée garde sa couleur
const sliceColor = (index: number) => `var(--chart-${index + 1})`;

export function PublicSpendingChart({ data }: PublicSpendingChartProps) {
	const chartConfig: ChartConfig = Object.fromEntries(
		// Clé sans espace ni accent : ChartContainer en fait une variable CSS
		data.map((d, index) => [
			`slice${index}`,
			{ label: d.categorie, color: sliceColor(index) },
		]),
	);
	const total = data.reduce(
		(sum, item) => sum + item.depenses_milliards_eur,
		0,
	);

	return (
		<ChartContainer
			config={chartConfig}
			className="mx-auto h-[320px] w-[320px]"
		>
			<PieChart title="Répartition des dépenses publiques entre administrations">
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							hideLabel
							formatter={(value, name) => (
								<div className="flex flex-col gap-1">
									<span className="font-medium">{name}</span>
									<span className="text-muted-foreground">
										{formatMd(Number(value))}
									</span>
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
					{data.map((entry, index) => (
						<Cell key={entry.categorie} fill={sliceColor(index)} />
					))}
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
											{formatNombre(total)}
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
