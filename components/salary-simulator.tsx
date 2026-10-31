"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { PublicFinances2026 } from "@/lib/data/public-finances-2026";
import { formatEur, formatPct } from "@/lib/format";
import {
	type Cotisation,
	type Destination,
	SALARY_RANGE,
	type SimulatorParameters,
	simulate,
} from "@/lib/simulator";

export type SimulatorData = SimulatorParameters &
	Pick<PublicFinances2026["simulator"], "benchmarks">;

interface SalarySimulatorProps {
	employee: Cotisation[];
	employer: Cotisation[];
	simulator: SimulatorData;
}

export function SalarySimulator({
	employee,
	employer,
	simulator,
}: SalarySimulatorProps) {
	const [annualGross, setAnnualGross] = useState(SALARY_RANGE.initial);
	const s = simulate(annualGross, employee, employer, simulator);
	const destination = (d: Destination) => s.byDestination[d];
	const reliefThreshold =
		simulator.rgdu.smicThreshold * simulator.rgdu.annualSmicEur;

	const totalEmployeeCotisations = s.employeeCotisations;
	const totalEmployerCotisations = s.employerCotisations;
	const netBeforeTax = s.netBeforeIncomeTax;
	const annualIncomeTax = s.incomeTax;
	const netAfterTax = s.netAfterIncomeTax;
	const employerCost = s.employerCost;

	const netShareOfCostPct = (netAfterTax / employerCost) * 100;
	const cotisationsShareOfCostPct =
		((totalEmployeeCotisations + totalEmployerCotisations) / employerCost) *
		100;
	const incomeTaxShareOfCostPct = (annualIncomeTax / employerCost) * 100;

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h2>Simulateur : où va mon argent ?</h2>
				</CardTitle>
				<CardDescription>
					Décomposition d&apos;un salaire brut annuel (célibataire sans enfant,{" "}
					{simulator.incomeTaxScale.description})
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Curseur */}
				<div className="space-y-2">
					<div id="annual-gross-salary" className="text-sm font-medium">
						Salaire brut annuel : {formatEur(annualGross)}
					</div>
					{/* Valeur en tableau : le Slider du kit dessine une poignée par valeur */}
					<Slider
						aria-labelledby="annual-gross-salary"
						min={SALARY_RANGE.min}
						max={SALARY_RANGE.max}
						step={SALARY_RANGE.step}
						value={[annualGross]}
						onValueChange={(value) =>
							setAnnualGross(Array.isArray(value) ? value[0] : value)
						}
						locale="fr-FR"
						format={{
							style: "currency",
							currency: "EUR",
							maximumFractionDigits: 0,
						}}
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{formatEur(SALARY_RANGE.min)}</span>
						<span>{formatEur(SALARY_RANGE.max)}</span>
					</div>
				</div>

				{/* Résumé visuel */}
				<div className="space-y-2">
					<div className="text-sm font-medium">
						Répartition du coût employeur ({formatEur(employerCost)})
					</div>
					<div className="flex h-8 w-full overflow-hidden rounded-lg">
						<div
							className="bg-[var(--chart-3)] flex items-center justify-center text-xs text-white font-medium"
							style={{ width: `${netShareOfCostPct}%` }}
						>
							{netShareOfCostPct > 15 && "Net"}
						</div>
						<div
							className="bg-[var(--chart-1)] flex items-center justify-center text-xs text-white font-medium"
							style={{ width: `${cotisationsShareOfCostPct}%` }}
						>
							{cotisationsShareOfCostPct > 15 && "Cotisations"}
						</div>
						<div
							className="bg-[var(--chart-4)] flex items-center justify-center text-xs text-white font-medium"
							style={{ width: `${incomeTaxShareOfCostPct}%` }}
						>
							{incomeTaxShareOfCostPct > 5 && "IR"}
						</div>
					</div>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-3)]" /> Net
							: {formatPct(netShareOfCostPct)}
						</span>
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />{" "}
							Cotisations : {formatPct(cotisationsShareOfCostPct)}
						</span>
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-4)]" /> IR :{" "}
							{formatPct(incomeTaxShareOfCostPct)}
						</span>
					</div>
				</div>

				{/* Détail */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-3">
						<h3 className="font-medium text-sm border-b pb-1">
							Du brut au net
						</h3>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Salaire brut</span>
								<span className="font-mono">{formatEur(annualGross)}</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>- Cotisations salariales</span>
								<span className="font-mono">
									-{formatEur(totalEmployeeCotisations)}
								</span>
							</div>
							<div className="flex justify-between font-medium border-t pt-1">
								<span>= Salaire net (avant IR)</span>
								<span className="font-mono">{formatEur(netBeforeTax)}</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>- Impôt sur le revenu</span>
								<span className="font-mono">-{formatEur(annualIncomeTax)}</span>
							</div>
							<div className="flex justify-between font-semibold text-[var(--chart-3)] border-t pt-1">
								<span>= Net après impôt</span>
								<span className="font-mono">{formatEur(netAfterTax)}</span>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium text-sm border-b pb-1">
							Coût employeur
						</h3>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Salaire brut</span>
								<span className="font-mono">{formatEur(annualGross)}</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>+ Cotisations patronales</span>
								<span className="font-mono">
									+{formatEur(s.employerCotisationsBeforeRelief)}
								</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>- Allègement général</span>
								<span className="font-mono">
									{s.relief > 0 && "-"}
									{formatEur(s.relief)}
								</span>
							</div>
							<div className="flex justify-between font-semibold border-t pt-1">
								<span>= Coût total employeur</span>
								<span className="font-mono">{formatEur(employerCost)}</span>
							</div>
						</div>
						<div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs space-y-1">
							<p>
								<strong>Mensuel :</strong> {formatEur(netAfterTax / 12)}{" "}
								net/mois
							</p>
							<p>
								<strong>Ratio :</strong> vous touchez{" "}
								{formatPct(netShareOfCostPct)} de ce que vous coûtez
							</p>
						</div>
					</div>
				</div>

				{/* Où vont les cotisations, version enrichie */}
				<div className="space-y-3">
					<h3 className="font-medium text-sm border-b pb-1">
						Où vont les cotisations (
						{formatEur(totalEmployeeCotisations + totalEmployerCotisations)}) ?
					</h3>
					<div className="grid gap-3 sm:grid-cols-2 text-sm">
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Retraite</span>
								<span className="font-mono">
									{formatEur(destination("pension"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Paie les pensions des retraités d&apos;aujourd&apos;hui (régime
								par répartition) et vous ouvre des droits pour la vôtre. Pension
								moyenne actuelle : {simulator.benchmarks.averagePension}
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Santé</span>
								<span className="font-mono">
									{formatEur(destination("health"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Couvre vos consultations, hospitalisations et médicaments
								(remboursement {simulator.benchmarks.healthReimbursement})
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>CSG-CRDS</span>
								<span className="font-mono">
									{formatEur(destination("csg"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Finance la Sécu, la dépendance et la dette sociale (CADES)
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Chômage</span>
								<span className="font-mono">
									{formatEur(destination("unemployment"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Ouvre droit à {simulator.benchmarks.unemploymentDuration}{" "}
								d&apos;indemnisation en cas de perte d&apos;emploi
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Famille</span>
								<span className="font-mono">
									{formatEur(destination("family"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Allocations familiales et aides à la garde d&apos;enfants
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Accidents du travail, logement, autonomie</span>
								<span className="font-mono">
									{formatEur(destination("other"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Accidents du travail et maladies professionnelles, aide au
								logement (FNAL), dépendance (CSA)
							</p>
						</div>
						<div className="rounded-lg border border-dashed p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Allègement général</span>
								<span className="font-mono">
									{s.relief > 0 && "-"}
									{formatEur(s.relief)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Réduit les cotisations patronales des salaires jusqu&apos;à{" "}
								{simulator.rgdu.smicThreshold}&nbsp;SMIC (
								{formatEur(reliefThreshold)} par an). Les montants ci-dessus
								sont avant cette réduction.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
