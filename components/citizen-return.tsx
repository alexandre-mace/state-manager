import {
	Briefcase,
	Clock,
	GraduationCap,
	Heart,
	Map as MapIcon,
	Scale,
	Shield,
	Users,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { lookupOrThrow } from "@/lib/guards";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	Clock,
	Heart,
	GraduationCap,
	Map: MapIcon,
	Shield,
	Scale,
	Users,
	Briefcase,
};

interface Service {
	service: string;
	value: string;
	detail: string;
	icon: string;
}

interface CitizenReturnProps {
	services: Service[];
}

export function CitizenReturn({ services }: CitizenReturnProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h2>Ce que financent les dépenses publiques</h2>
				</CardTitle>
				<CardDescription>
					Les services et prestations concrets dont bénéficient les citoyens
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{services.map((s) => {
						const Icon = lookupOrThrow(ICONS, s.icon, s.service);
						return (
							<div
								key={s.service}
								className="rounded-lg border border-border p-4 space-y-2"
							>
								<div className="flex items-center gap-2">
									<Icon className="h-5 w-5 text-primary" />
									<span className="font-medium text-sm">{s.service}</span>
								</div>
								<p className="font-mono text-lg font-semibold">{s.value}</p>
								<p className="text-xs text-muted-foreground">{s.detail}</p>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
