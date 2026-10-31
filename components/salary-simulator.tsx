"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatEur, formatPct } from "@/lib/format";
import {
	type Cotisation,
	type ParametresSimulateur,
	type Poste,
	SALARY_RANGE,
	simuler,
} from "@/lib/simulateur";

export interface SimulateurData extends ParametresSimulateur {
	reperes: {
		pension_moyenne: string;
		remboursement_sante: string;
		duree_chomage: string;
	};
}

interface SalarySimulatorProps {
	salariales: Cotisation[];
	patronales: Cotisation[];
	simulateur: SimulateurData;
}

export function SalarySimulator({
	salariales,
	patronales,
	simulateur,
}: SalarySimulatorProps) {
	const [salaireBrutAnnuel, setSalaireBrutAnnuel] = useState(
		SALARY_RANGE.initial,
	);
	const s = simuler(salaireBrutAnnuel, salariales, patronales, simulateur);
	const poste = (p: Poste) => s.parPoste[p];
	const seuilAllegement =
		simulateur.rgdu.seuil_smic * simulateur.rgdu.smic_annuel_eur;

	const totalCotisationsSalariales = s.cotisationsSalariales;
	const totalCotisationsPatronales = s.cotisationsPatronales;
	const salaireNetAvantIR = s.netAvantIR;
	const irAnnuel = s.impot;
	const salaireNetApresIR = s.netApresIR;
	const coutEmployeur = s.coutEmployeur;

	const pctNetSurCout = (salaireNetApresIR / coutEmployeur) * 100;
	const pctCotisationsSurCout =
		((totalCotisationsSalariales + totalCotisationsPatronales) /
			coutEmployeur) *
		100;
	const pctIRSurCout = (irAnnuel / coutEmployeur) * 100;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Simulateur : Où va mon argent ?</CardTitle>
				<CardDescription>
					Décomposition d&apos;un salaire brut annuel (célibataire sans enfant,{" "}
					{simulateur.bareme_ir.description})
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Input */}
				<div className="space-y-2">
					<label htmlFor="salaire-brut-annuel" className="text-sm font-medium">
						Salaire brut annuel : {formatEur(salaireBrutAnnuel)}
					</label>
					<input
						id="salaire-brut-annuel"
						type="range"
						min={SALARY_RANGE.min}
						max={SALARY_RANGE.max}
						step={SALARY_RANGE.step}
						value={salaireBrutAnnuel}
						onChange={(e) => setSalaireBrutAnnuel(Number(e.target.value))}
						aria-valuetext={formatEur(salaireBrutAnnuel)}
						className="w-full accent-primary"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{formatEur(SALARY_RANGE.min)}</span>
						<span>{formatEur(SALARY_RANGE.max)}</span>
					</div>
				</div>

				{/* Résumé visuel */}
				<div className="space-y-2">
					<div className="text-sm font-medium">
						Répartition du coût employeur ({formatEur(coutEmployeur)})
					</div>
					<div className="flex h-8 w-full overflow-hidden rounded-lg">
						<div
							className="bg-[var(--chart-2)] flex items-center justify-center text-xs text-white font-medium"
							style={{ width: `${pctNetSurCout}%` }}
						>
							{pctNetSurCout > 15 && "Net"}
						</div>
						<div
							className="bg-[var(--chart-1)] flex items-center justify-center text-xs text-white font-medium"
							style={{ width: `${pctCotisationsSurCout}%` }}
						>
							{pctCotisationsSurCout > 15 && "Cotisations"}
						</div>
						<div
							className="bg-[var(--chart-4)] flex items-center justify-center text-xs text-white font-medium"
							style={{ width: `${pctIRSurCout}%` }}
						>
							{pctIRSurCout > 5 && "IR"}
						</div>
					</div>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" /> Net
							: {formatPct(pctNetSurCout)}
						</span>
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />{" "}
							Cotisations : {formatPct(pctCotisationsSurCout)}
						</span>
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-[var(--chart-4)]" /> IR :{" "}
							{formatPct(pctIRSurCout)}
						</span>
					</div>
				</div>

				{/* Détail */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-3">
						<h4 className="font-medium text-sm border-b pb-1">
							Du brut au net
						</h4>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Salaire brut</span>
								<span className="font-mono">
									{formatEur(salaireBrutAnnuel)}
								</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>- Cotisations salariales</span>
								<span className="font-mono">
									-{formatEur(totalCotisationsSalariales)}
								</span>
							</div>
							<div className="flex justify-between font-medium border-t pt-1">
								<span>= Salaire net (avant IR)</span>
								<span className="font-mono">
									{formatEur(salaireNetAvantIR)}
								</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>- Impôt sur le revenu</span>
								<span className="font-mono">-{formatEur(irAnnuel)}</span>
							</div>
							<div className="flex justify-between font-semibold text-[var(--chart-2)] border-t pt-1">
								<span>= Net après impôt</span>
								<span className="font-mono">
									{formatEur(salaireNetApresIR)}
								</span>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<h4 className="font-medium text-sm border-b pb-1">
							Coût employeur
						</h4>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Salaire brut</span>
								<span className="font-mono">
									{formatEur(salaireBrutAnnuel)}
								</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>+ Cotisations patronales</span>
								<span className="font-mono">
									+{formatEur(s.cotisationsPatronalesAvantAllegement)}
								</span>
							</div>
							<div className="flex justify-between text-muted-foreground">
								<span>- Allègement général</span>
								<span className="font-mono">
									{s.allegement > 0 && "-"}
									{formatEur(s.allegement)}
								</span>
							</div>
							<div className="flex justify-between font-semibold border-t pt-1">
								<span>= Coût total employeur</span>
								<span className="font-mono">{formatEur(coutEmployeur)}</span>
							</div>
						</div>
						<div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs space-y-1">
							<p>
								<strong>Mensuel :</strong> {formatEur(salaireNetApresIR / 12)}{" "}
								net/mois
							</p>
							<p>
								<strong>Ratio :</strong> vous touchez {formatPct(pctNetSurCout)}{" "}
								de ce que vous coûtez
							</p>
						</div>
					</div>
				</div>

				{/* Où vont les cotisations, version enrichie */}
				<div className="space-y-3">
					<h4 className="font-medium text-sm border-b pb-1">
						Où vont les cotisations (
						{formatEur(totalCotisationsSalariales + totalCotisationsPatronales)}
						) ?
					</h4>
					<div className="grid gap-3 sm:grid-cols-2 text-sm">
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Retraite</span>
								<span className="font-mono">
									{formatEur(poste("retraite"))}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Finance votre future pension. Pension moyenne actuelle :{" "}
								{simulateur.reperes.pension_moyenne}
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Santé</span>
								<span className="font-mono">{formatEur(poste("sante"))}</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Couvre vos consultations, hospitalisations et médicaments
								(remboursement {simulateur.reperes.remboursement_sante})
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>CSG-CRDS</span>
								<span className="font-mono">{formatEur(poste("csg"))}</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Finance la Sécu, la dépendance et la dette sociale (CADES)
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Chômage</span>
								<span className="font-mono">{formatEur(poste("chomage"))}</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Ouvre droit à {simulateur.reperes.duree_chomage}{" "}
								d&apos;indemnisation en cas de perte d&apos;emploi
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Famille</span>
								<span className="font-mono">{formatEur(poste("famille"))}</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Allocations familiales, APL, aides à la garde d&apos;enfants
							</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 space-y-1">
							<div className="flex justify-between font-medium">
								<span>Accidents du travail, logement, autonomie</span>
								<span className="font-mono">{formatEur(poste("autres"))}</span>
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
									{s.allegement > 0 && "-"}
									{formatEur(s.allegement)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Réduit les cotisations patronales des salaires jusqu&apos;à{" "}
								{simulateur.rgdu.seuil_smic}&nbsp;SMIC (
								{formatEur(seuilAllegement)} par an). Les montants ci-dessus
								sont avant cette réduction.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
