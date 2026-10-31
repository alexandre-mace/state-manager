import {
	Baby,
	Briefcase,
	Building2,
	Clock,
	GraduationCap,
	HandHelping,
	Heart,
	Home,
	Leaf,
	Palette,
	Scale,
	Shield,
	TrendingDown,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatEur, formatMd } from "@/lib/format";
import { lookupOrThrow } from "@/lib/guards";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	Clock,
	Heart,
	GraduationCap,
	Building2,
	Shield,
	TrendingDown,
	Scale,
	Briefcase,
	HandHelping,
	Baby,
	Home,
	Palette,
	Leaf,
};

interface SpendingItem {
	label: string;
	amountEur: number;
	icon: string;
}

interface ThousandEuroBreakdownProps {
	description: string;
	items: SpendingItem[];
	baseBillionEur: number;
	source: string;
}

export function ThousandEuroBreakdown({
	description,
	items,
	baseBillionEur,
	source,
}: ThousandEuroBreakdownProps) {
	const sorted = [...items].sort((a, b) => b.amountEur - a.amountEur);
	const total = sorted.reduce((sum, p) => sum + p.amountEur, 0) || 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h2>Pour 1&#8239;000&nbsp;€ de dépenses publiques</h2>
				</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{sorted.map((item) => {
					const Icon = lookupOrThrow(ICONS, item.icon, item.label);
					const pct = (item.amountEur / total) * 100;
					return (
						<div key={item.label} className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-2">
									<Icon className="h-4 w-4 text-muted-foreground" />
									<span>{item.label}</span>
								</div>
								<span className="font-mono font-medium">
									{formatEur(item.amountEur)}
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-muted">
								<div
									className="h-2 rounded-full bg-primary"
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>
					);
				})}
				<p className="pt-2 text-xs text-muted-foreground">
					Total : {formatEur(sorted.reduce((sum, p) => sum + p.amountEur, 0))},
					calculé à partir des dépenses totales de {formatMd(baseBillionEur)}
				</p>
				<p className="text-xs text-muted-foreground">Source : {source}</p>
			</CardContent>
		</Card>
	);
}
