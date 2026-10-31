import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatMd } from "@/lib/format";

type FlowItem = {
	label: string;
	amount: number;
	color: string;
};

function FlowArrow() {
	return (
		<div className="flex items-center justify-center py-1">
			<svg
				aria-hidden="true"
				className="h-6 w-4 text-muted-foreground"
				viewBox="0 0 16 24"
			>
				<path
					d="M8 0 L8 16 M4 12 L8 20 L12 12"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
			</svg>
		</div>
	);
}

function FlowBox({
	label,
	amount,
	color,
	small = false,
}: FlowItem & { small?: boolean }) {
	return (
		<div
			className={`min-w-0 rounded-lg border-2 p-2 text-center hyphens-auto break-words sm:p-3 ${small ? "text-xs" : "text-xs sm:text-sm"}`}
			style={{ borderColor: color, backgroundColor: `${color}15` }}
		>
			<div className="font-medium">{label}</div>
			<div className="font-mono font-semibold" style={{ color }}>
				{formatMd(amount, 0)}
			</div>
		</div>
	);
}

export interface FlowDiagramData {
	prelevements: { impots: number; cotisations: number; csgCrds: number };
	etat: { total: number; depenses: { label: string; amount: number }[] };
	secu: {
		total: number;
		branchesTotal: number;
		depenses: { label: string; amount: number }[];
	};
	collectivites: {
		total: number;
		depenses: { label: string; amount: number }[];
	};
	autresOrganismes: { total: number; description: string };
	transferts: { etatCollectivites: number; taxesAffecteesSecu: number };
	deficit: number;
	year: number;
}

export function FlowDiagram({ data }: { data: FlowDiagramData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Circuit des finances publiques</CardTitle>
				<CardDescription>
					Comment l&apos;argent circule entre contribuables, administrations et
					services publics
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Niveau 1: Sources */}
				<div className="text-center">
					<div className="inline-block rounded-lg bg-muted px-4 py-2 text-sm font-medium">
						Contribuables (ménages + entreprises)
					</div>
				</div>

				<FlowArrow />

				{/* Niveau 2: Types de prélèvements */}
				<div className="grid grid-cols-3 gap-2 sm:gap-3">
					<FlowBox
						label="Impôts et taxes"
						amount={data.prelevements.impots}
						color="var(--chart-1)"
					/>
					<FlowBox
						label="Cotisations sociales"
						amount={data.prelevements.cotisations}
						color="var(--chart-2)"
					/>
					<FlowBox
						label="CSG-CRDS"
						amount={data.prelevements.csgCrds}
						color="var(--chart-3)"
					/>
				</div>

				<FlowArrow />

				{/* Niveau 3: Administrations */}
				<div className="grid grid-cols-3 gap-2 sm:gap-3">
					<div className="space-y-2">
						<FlowBox
							label="État"
							amount={data.etat.total}
							color="var(--chart-1)"
						/>
						<div className="text-xs text-muted-foreground text-center">
							<p>Reçoit : IR, IS, TVA, TICPE...</p>
						</div>
					</div>
					<div className="space-y-2">
						<FlowBox
							label="Sécurité Sociale"
							amount={data.secu.total}
							color="var(--chart-2)"
						/>
						<div className="text-xs text-muted-foreground text-center">
							<p>Reçoit : Cotisations, CSG</p>
						</div>
					</div>
					<div className="space-y-2">
						<FlowBox
							label="Collectivités"
							amount={data.collectivites.total}
							color="var(--chart-3)"
						/>
						<div className="text-xs text-muted-foreground text-center">
							<p>Reçoit : Taxes locales, dotations</p>
						</div>
					</div>
				</div>

				{/* Autres organismes */}
				<div className="rounded-lg border border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
					+ <strong>Autres organismes publics</strong> (universités, hôpitaux,
					agences) :{" "}
					<span className="font-mono">
						{formatMd(data.autresOrganismes.total, 0)}
					</span>
					<span>, financés par les trois administrations ci-dessus</span>
				</div>

				{/* Transferts */}
				<div className="rounded-lg border border-dashed p-3 text-center text-sm">
					<div className="font-medium mb-2">
						Transferts entre administrations
					</div>
					<div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
						<div className="flex flex-wrap items-center justify-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
							État → Collectivités :{" "}
							<span className="font-mono">
								{formatMd(data.transferts.etatCollectivites, 0)}
							</span>{" "}
							(dotations)
						</div>
						<div className="flex flex-wrap items-center justify-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" />
							Taxes affectées → Sécu :{" "}
							<span className="font-mono">
								{formatMd(data.transferts.taxesAffecteesSecu, 0)}
							</span>{" "}
							(tabac, alcool...)
						</div>
					</div>
				</div>

				<FlowArrow />

				{/* Niveau 4: Dépenses */}
				<div className="grid grid-cols-3 gap-1.5 sm:gap-2">
					<div className="space-y-1">
						<div
							className="text-xs font-medium text-center mb-2"
							style={{ color: "var(--chart-1)" }}
						>
							Dépenses État
							<div className="font-normal text-muted-foreground">
								hors retraites des agents
							</div>
						</div>
						{data.etat.depenses.map((d) => (
							<FlowBox
								key={d.label}
								label={d.label}
								amount={d.amount}
								color="var(--chart-1)"
								small
							/>
						))}
					</div>
					<div className="space-y-1">
						<div
							className="text-xs font-medium text-center mb-2"
							style={{ color: "var(--chart-2)" }}
						>
							Dépenses Sécu
							<div className="font-normal text-muted-foreground">
								par branche
							</div>
						</div>
						{data.secu.depenses.map((d) => (
							<FlowBox
								key={d.label}
								label={d.label}
								amount={d.amount}
								color="var(--chart-2)"
								small
							/>
						))}
					</div>
					<div className="space-y-1">
						<div
							className="text-xs font-medium text-center mb-2"
							style={{ color: "var(--chart-3)" }}
						>
							Dépenses Collectivités
						</div>
						{data.collectivites.depenses.map((d) => (
							<FlowBox
								key={d.label}
								label={d.label}
								amount={d.amount}
								color="var(--chart-3)"
								small
							/>
						))}
					</div>
				</div>

				<FlowArrow />

				{/* Niveau 5: Bénéficiaires */}
				<div className="text-center">
					<div className="inline-block rounded-lg bg-muted px-4 py-2 text-sm font-medium">
						Services publics, prestations, infrastructures → Citoyens
					</div>
				</div>

				{/* Périmètres : les sous-boîtes ne bouclent pas toutes avec leur parent */}
				<p className="text-xs text-muted-foreground">
					Les boîtes État, Sécurité sociale, Collectivités et autres organismes
					suivent la comptabilité nationale et s&apos;additionnent. Dessous, les
					missions de l&apos;État sont celles de son budget, hors retraites des
					agents ; les branches de la Sécurité sociale sont prises chacune sur
					son propre périmètre (loi de financement) et totalisent{" "}
					<span className="font-mono">
						{formatMd(data.secu.branchesTotal, 0)}
					</span>
					, à ne pas comparer aux{" "}
					<span className="font-mono">{formatMd(data.secu.total, 0)}</span> de
					la boîte.
				</p>

				{/* Légende déficit */}
				<div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
					<div className="flex items-center gap-2">
						<span className="font-medium text-destructive">
							Déficit {data.year} :
						</span>
						<span className="font-mono">~{formatMd(data.deficit, 0)}</span>
						<span className="text-muted-foreground">
							(dépenses &gt; recettes → emprunt → dette)
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
