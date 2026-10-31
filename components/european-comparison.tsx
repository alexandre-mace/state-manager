import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { barWidthPct } from "@/lib/finances";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Country = { code: string; label: string; pct: number };

interface EuropeanComparisonProps {
	description: string;
	countries: Country[];
	note: string;
	// Couleur de la barre de la France, celle de la section
	highlightClassName: string;
}

// Code ISO de la France, mise en avant dans chaque comparaison
const HIGHLIGHTED = "FR";

export function EuropeanComparison({
	description,
	countries,
	note,
	highlightClassName,
}: EuropeanComparisonProps) {
	const values = countries.map((c) => c.pct);
	const sorted = [...countries].sort((a, b) => b.pct - a.pct);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h3>Comparaison européenne</h3>
				</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{sorted.map((country) => {
					const isHighlighted = country.code === HIGHLIGHTED;
					return (
						<div
							key={country.code}
							className="flex items-center justify-between gap-4"
						>
							<span
								className={
									isHighlighted ? "font-semibold" : "text-muted-foreground"
								}
							>
								{country.label}
							</span>
							<div className="flex items-center gap-2">
								<div className="w-24" aria-hidden="true">
									<div
										className={cn(
											"h-2 rounded",
											isHighlighted
												? highlightClassName
												: "bg-muted-foreground/30",
										)}
										style={{ width: `${barWidthPct(country.pct, values)}%` }}
									/>
								</div>
								<span
									className={cn(
										"w-16 text-right font-mono text-sm",
										isHighlighted && "font-semibold",
									)}
								>
									{formatPct(country.pct)}
								</span>
							</div>
						</div>
					);
				})}
				<p className="pt-2 text-xs text-muted-foreground">{note}</p>
			</CardContent>
		</Card>
	);
}
