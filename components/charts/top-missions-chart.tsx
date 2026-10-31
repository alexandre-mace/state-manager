import { Card, CardContent } from "@/components/ui/card";
import { formatMd } from "@/lib/format";

interface MissionDatum {
	mission: string;
	description: string;
	amountBillionEur: number;
	pensionsBillionEur: number;
}

interface TopMissionsChartProps {
	data: MissionDatum[];
}

// Liste en HTML plutôt qu'un graphique : les libellés longs restent lisibles sur mobile
// et les montants s'affichent sans survol.
export function TopMissionsChart({ data }: TopMissionsChartProps) {
	const max = Math.max(...data.map((d) => d.amountBillionEur));

	return (
		<Card className="h-full">
			<CardContent className="space-y-4">
				<div
					className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
					aria-hidden="true"
				>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm bg-chart-2" />
						Crédits de la mission
					</span>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm bg-chart-2/35" />
						dont retraites des agents
					</span>
				</div>
				<ul className="space-y-4">
					{data.map((d) => {
						const excludingPensions = d.amountBillionEur - d.pensionsBillionEur;
						return (
							<li key={d.mission} className="space-y-1.5">
								<div className="flex items-baseline justify-between gap-3">
									<span className="text-sm font-medium">{d.mission}</span>
									<span className="shrink-0 font-mono text-sm">
										{formatMd(d.amountBillionEur, 1, 1)}
									</span>
								</div>
								<div
									className="flex h-2.5 overflow-hidden rounded-full bg-muted"
									aria-hidden="true"
								>
									<div
										className="bg-chart-2"
										style={{ width: `${(excludingPensions / max) * 100}%` }}
									/>
									<div
										className="bg-chart-2/35"
										style={{
											width: `${(d.pensionsBillionEur / max) * 100}%`,
										}}
									/>
								</div>
								<p className="text-xs text-muted-foreground">
									{d.description}.
									{d.pensionsBillionEur > 0 && (
										<>
											{" "}
											Dont {formatMd(d.pensionsBillionEur, 1, 1)} de retraites
											des agents, soit {formatMd(excludingPensions, 1, 1)} hors
											retraites.
										</>
									)}
								</p>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}
