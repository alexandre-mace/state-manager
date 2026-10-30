"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEur, formatPct } from "@/lib/format";

type Tranche = { limite_eur: number | null; taux_pct: number };

export interface SimulateurData {
  base_csg_pct: number;
  abattement_frais_pro_pct: number;
  bareme_ir: { description: string; tranches: Tranche[] };
  reperes: { pension_moyenne: string; remboursement_sante: string; duree_chomage: string };
}

function calculerIR(revenuImposable: number, tranches: Tranche[]): number {
  let impot = 0;
  let reste = revenuImposable;
  let precedent = 0;

  for (const tranche of tranches) {
    const limite = tranche.limite_eur ?? Infinity;
    const montantTranche = Math.min(reste, limite - precedent);
    if (montantTranche <= 0) break;
    impot += montantTranche * (tranche.taux_pct / 100);
    reste -= montantTranche;
    precedent = limite;
  }

  return impot;
}

const SALAIRE_MIN = 15000;
const SALAIRE_MAX = 150000;

interface SalarySimulatorProps {
  // Taux en fraction du brut, par clé de cotisation (tauxCotisations du JSON)
  taux: Record<string, number>;
  simulateur: SimulateurData;
}

export function SalarySimulator({ taux, simulateur }: SalarySimulatorProps) {
  const [salaireBrutAnnuel, setSalaireBrutAnnuel] = useState(35000);
  const t = (cle: string) => {
    const valeur = taux[cle];
    if (valeur === undefined) throw new Error(`Taux de cotisation absent du JSON : ${cle}`);
    return valeur;
  };

  const baseCSG = salaireBrutAnnuel * (simulateur.base_csg_pct / 100);

  // Cotisations salariales
  const cotisationsSalariales = {
    vieillesse: salaireBrutAnnuel * (t("vieillesse_plafonnee_sal") + t("vieillesse_deplafonnee_sal")),
    retraiteComplementaire: salaireBrutAnnuel * t("retraite_complementaire_sal"),
    csgDeductible: baseCSG * t("csg_deductible"),
    csgCrdsNonDeductible: baseCSG * t("csg_non_deductible_crds"),
  };

  const totalCotisationsSalariales = Object.values(cotisationsSalariales).reduce((a, b) => a + b, 0);

  // Cotisations patronales
  const cotisationsPatronales = {
    maladie: salaireBrutAnnuel * t("maladie_pat"),
    vieillesse: salaireBrutAnnuel * (t("vieillesse_plafonnee_pat") + t("vieillesse_deplafonnee_pat")),
    famille: salaireBrutAnnuel * t("famille_pat"),
    accidentTravail: salaireBrutAnnuel * t("accident_travail_pat"),
    chomage: salaireBrutAnnuel * t("chomage_pat"),
    retraiteComplementaire: salaireBrutAnnuel * t("retraite_complementaire_pat"),
    fnalAutonomie: salaireBrutAnnuel * t("fnal_autonomie_pat"),
  };

  const totalCotisationsPatronales = Object.values(cotisationsPatronales).reduce((a, b) => a + b, 0);

  // Salaire net avant IR
  const salaireNetAvantIR = salaireBrutAnnuel - totalCotisationsSalariales;

  // Revenu imposable : net imposable (brut - cotisations déductibles) avec abattement pour frais professionnels
  const cotisationsDeductibles = cotisationsSalariales.vieillesse + cotisationsSalariales.retraiteComplementaire + cotisationsSalariales.csgDeductible;
  const revenuImposable = (salaireBrutAnnuel - cotisationsDeductibles) * (1 - simulateur.abattement_frais_pro_pct / 100);

  // IR estimé (célibataire sans enfant)
  const irAnnuel = calculerIR(revenuImposable, simulateur.bareme_ir.tranches);

  // Salaire net après IR
  const salaireNetApresIR = salaireNetAvantIR - irAnnuel;

  // Coût total employeur
  const coutEmployeur = salaireBrutAnnuel + totalCotisationsPatronales;

  // Pourcentages
  const pctNetSurCout = (salaireNetApresIR / coutEmployeur) * 100;
  const pctCotisationsSurCout = ((totalCotisationsSalariales + totalCotisationsPatronales) / coutEmployeur) * 100;
  const pctIRSurCout = (irAnnuel / coutEmployeur) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulateur : Où va mon argent ?</CardTitle>
        <CardDescription>
          Décomposition d&apos;un salaire brut annuel (célibataire sans enfant, {simulateur.bareme_ir.description})
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
            min={SALAIRE_MIN}
            max={SALAIRE_MAX}
            step={1000}
            value={salaireBrutAnnuel}
            onChange={(e) => setSalaireBrutAnnuel(Number(e.target.value))}
            aria-valuetext={formatEur(salaireBrutAnnuel)}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatEur(SALAIRE_MIN)}</span>
            <span>{formatEur(SALAIRE_MAX)}</span>
          </div>
        </div>

        {/* Résumé visuel */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Répartition du coût employeur ({formatEur(coutEmployeur)})</div>
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
              <span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" /> Net : {formatPct(pctNetSurCout)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" /> Cotisations : {formatPct(pctCotisationsSurCout)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--chart-4)]" /> IR : {formatPct(pctIRSurCout)}
            </span>
          </div>
        </div>

        {/* Détail */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-medium text-sm border-b pb-1">Du brut au net</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Salaire brut</span>
                <span className="font-mono">{formatEur(salaireBrutAnnuel)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>- Cotisations salariales</span>
                <span className="font-mono">-{formatEur(totalCotisationsSalariales)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>= Salaire net (avant IR)</span>
                <span className="font-mono">{formatEur(salaireNetAvantIR)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>- Impôt sur le revenu</span>
                <span className="font-mono">-{formatEur(irAnnuel)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--chart-2)] border-t pt-1">
                <span>= Net après impôt</span>
                <span className="font-mono">{formatEur(salaireNetApresIR)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm border-b pb-1">Coût employeur</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Salaire brut</span>
                <span className="font-mono">{formatEur(salaireBrutAnnuel)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>+ Cotisations patronales</span>
                <span className="font-mono">+{formatEur(totalCotisationsPatronales)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>= Coût total employeur</span>
                <span className="font-mono">{formatEur(coutEmployeur)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs space-y-1">
              <p><strong>Mensuel :</strong> {formatEur(salaireNetApresIR / 12)} net/mois</p>
              <p><strong>Ratio :</strong> vous touchez {formatPct(pctNetSurCout)} de ce que vous coûtez</p>
            </div>
          </div>
        </div>

        {/* Où vont les cotisations, version enrichie */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm border-b pb-1">Où vont les cotisations ({formatEur(totalCotisationsSalariales + totalCotisationsPatronales)}) ?</h4>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Retraite</span>
                <span className="font-mono">{formatEur(cotisationsSalariales.vieillesse + cotisationsSalariales.retraiteComplementaire + cotisationsPatronales.vieillesse + cotisationsPatronales.retraiteComplementaire)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Finance votre future pension. Pension moyenne actuelle : {simulateur.reperes.pension_moyenne}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Santé</span>
                <span className="font-mono">{formatEur(cotisationsPatronales.maladie)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Couvre vos consultations, hospitalisations et médicaments (remboursement {simulateur.reperes.remboursement_sante})</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>CSG-CRDS</span>
                <span className="font-mono">{formatEur(cotisationsSalariales.csgDeductible + cotisationsSalariales.csgCrdsNonDeductible)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Finance la Sécu, la dépendance et la dette sociale (CADES)</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Chômage</span>
                <span className="font-mono">{formatEur(cotisationsPatronales.chomage)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Ouvre droit à {simulateur.reperes.duree_chomage} d&apos;indemnisation en cas de perte d&apos;emploi</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Famille</span>
                <span className="font-mono">{formatEur(cotisationsPatronales.famille)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Allocations familiales, APL, aides à la garde d&apos;enfants</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>AT + autonomie</span>
                <span className="font-mono">{formatEur(cotisationsPatronales.accidentTravail + cotisationsPatronales.fnalAutonomie)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Couverture en cas d&apos;accident du travail ou maladie professionnelle</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
