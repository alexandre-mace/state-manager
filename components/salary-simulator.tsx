"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Taux 2026 simplifiés
const TAUX = {
  // Cotisations salariales
  vieillesse_plafonnee_sal: 0.069,
  vieillesse_deplafonnee_sal: 0.004,
  retraite_complementaire_sal: 0.0315,
  csg_deductible: 0.068,
  csg_non_deductible_crds: 0.029,
  // Cotisations patronales
  maladie_pat: 0.07,
  vieillesse_plafonnee_pat: 0.0855,
  vieillesse_deplafonnee_pat: 0.019,
  famille_pat: 0.0345,
  accident_travail_pat: 0.022,
  chomage_pat: 0.0405,
  retraite_complementaire_pat: 0.0472,
  fnal_autonomie_pat: 0.006,
};

// Barème IR 2026 (revenus 2025)
const TRANCHES_IR = [
  { limite: 11294, taux: 0 },
  { limite: 28797, taux: 0.11 },
  { limite: 82341, taux: 0.30 },
  { limite: 177106, taux: 0.41 },
  { limite: Infinity, taux: 0.45 },
];

function calculerIR(revenuImposable: number): number {
  let impot = 0;
  let reste = revenuImposable;
  let precedent = 0;

  for (const tranche of TRANCHES_IR) {
    const montantTranche = Math.min(reste, tranche.limite - precedent);
    if (montantTranche <= 0) break;
    impot += montantTranche * tranche.taux;
    reste -= montantTranche;
    precedent = tranche.limite;
  }

  return impot;
}

export function SalarySimulator() {
  const [salaireBrutAnnuel, setSalaireBrutAnnuel] = useState(35000);

  // Base CSG/CRDS = 98.25% du brut
  const baseCSG = salaireBrutAnnuel * 0.9825;

  // Cotisations salariales
  const cotisationsSalariales = {
    vieillesse: salaireBrutAnnuel * (TAUX.vieillesse_plafonnee_sal + TAUX.vieillesse_deplafonnee_sal),
    retraiteComplementaire: salaireBrutAnnuel * TAUX.retraite_complementaire_sal,
    csgDeductible: baseCSG * TAUX.csg_deductible,
    csgCrdsNonDeductible: baseCSG * TAUX.csg_non_deductible_crds,
  };

  const totalCotisationsSalariales = Object.values(cotisationsSalariales).reduce((a, b) => a + b, 0);

  // Cotisations patronales
  const cotisationsPatronales = {
    maladie: salaireBrutAnnuel * TAUX.maladie_pat,
    vieillesse: salaireBrutAnnuel * (TAUX.vieillesse_plafonnee_pat + TAUX.vieillesse_deplafonnee_pat),
    famille: salaireBrutAnnuel * TAUX.famille_pat,
    accidentTravail: salaireBrutAnnuel * TAUX.accident_travail_pat,
    chomage: salaireBrutAnnuel * TAUX.chomage_pat,
    retraiteComplementaire: salaireBrutAnnuel * TAUX.retraite_complementaire_pat,
    fnalAutonomie: salaireBrutAnnuel * TAUX.fnal_autonomie_pat,
  };

  const totalCotisationsPatronales = Object.values(cotisationsPatronales).reduce((a, b) => a + b, 0);

  // Salaire net avant IR
  const salaireNetAvantIR = salaireBrutAnnuel - totalCotisationsSalariales;

  // Revenu imposable : net imposable (brut - cotisations déductibles) avec abattement 10%
  const cotisationsDeductibles = cotisationsSalariales.vieillesse + cotisationsSalariales.retraiteComplementaire + cotisationsSalariales.csgDeductible;
  const revenuImposable = (salaireBrutAnnuel - cotisationsDeductibles) * 0.9;

  // IR estimé (célibataire sans enfant)
  const irAnnuel = calculerIR(revenuImposable);

  // Salaire net après IR
  const salaireNetApresIR = salaireNetAvantIR - irAnnuel;

  // Coût total employeur
  const coutEmployeur = salaireBrutAnnuel + totalCotisationsPatronales;

  // Pourcentages
  const pctNetSurCout = (salaireNetApresIR / coutEmployeur) * 100;
  const pctCotisationsSurCout = ((totalCotisationsSalariales + totalCotisationsPatronales) / coutEmployeur) * 100;
  const pctIRSurCout = (irAnnuel / coutEmployeur) * 100;

  const formatEur = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  const formatPct = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "%";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulateur : Où va mon argent ?</CardTitle>
        <CardDescription>
          Décomposition d&apos;un salaire brut annuel (célibataire sans enfant, taux 2026)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Salaire brut annuel : {formatEur(salaireBrutAnnuel)}
          </label>
          <input
            type="range"
            min={15000}
            max={150000}
            step={1000}
            value={salaireBrutAnnuel}
            onChange={(e) => setSalaireBrutAnnuel(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>15 000 €</span>
            <span>150 000 €</span>
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

        {/* Où vont les cotisations — version enrichie */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm border-b pb-1">Où vont les cotisations ({formatEur(totalCotisationsSalariales + totalCotisationsPatronales)}) ?</h4>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Retraite</span>
                <span className="font-mono">{formatEur(cotisationsSalariales.vieillesse + cotisationsSalariales.retraiteComplementaire + cotisationsPatronales.vieillesse + cotisationsPatronales.retraiteComplementaire)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Finance votre future pension. Pension moyenne actuelle : ~1 550 €/mois net</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Santé</span>
                <span className="font-mono">{formatEur(cotisationsPatronales.maladie)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Couvre vos consultations, hospitalisations et médicaments (remboursement ~77%)</p>
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
              <p className="text-xs text-muted-foreground">Ouvre droit à ~24 mois d&apos;indemnisation en cas de perte d&apos;emploi</p>
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
