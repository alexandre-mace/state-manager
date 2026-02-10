"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formatMd = (n: number) => `${n} Md€`;

type FlowItem = {
  label: string;
  amount: number;
  color: string;
};

function FlowArrow({ direction = "down" }: { direction?: "down" | "right" }) {
  if (direction === "right") {
    return (
      <div className="flex items-center justify-center px-2">
        <svg className="h-4 w-8 text-muted-foreground" viewBox="0 0 32 16">
          <path d="M0 8 L24 8 M20 4 L28 8 L20 12" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-1">
      <svg className="h-6 w-4 text-muted-foreground" viewBox="0 0 16 24">
        <path d="M8 0 L8 16 M4 12 L8 20 L12 12" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

function FlowBox({ label, amount, color, small = false }: FlowItem & { small?: boolean }) {
  return (
    <div
      className={`rounded-lg border-2 p-3 text-center ${small ? "text-xs" : "text-sm"}`}
      style={{ borderColor: color, backgroundColor: `${color}15` }}
    >
      <div className="font-medium">{label}</div>
      <div className="font-mono font-semibold" style={{ color }}>{formatMd(amount)}</div>
    </div>
  );
}

export function FlowDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Circuit des finances publiques</CardTitle>
        <CardDescription>
          Comment l&apos;argent circule entre contribuables, administrations et services publics
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
        <div className="grid grid-cols-3 gap-3">
          <FlowBox label="Impôts" amount={540} color="var(--chart-1)" />
          <FlowBox label="Cotisations sociales" amount={420} color="var(--chart-2)" />
          <FlowBox label="CSG + Taxes affectées" amount={270} color="var(--chart-3)" />
        </div>

        <FlowArrow />

        {/* Niveau 3: Administrations */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <FlowBox label="État" amount={585} color="var(--chart-1)" />
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Reçoit: IR, IS, TVA, TICPE...</p>
            </div>
          </div>
          <div className="space-y-2">
            <FlowBox label="Sécurité Sociale" amount={677} color="var(--chart-2)" />
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Reçoit: Cotisations, CSG</p>
            </div>
          </div>
          <div className="space-y-2">
            <FlowBox label="Collectivités" amount={298} color="var(--chart-3)" />
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Reçoit: Taxes locales, DGF</p>
            </div>
          </div>
        </div>

        {/* Transferts */}
        <div className="rounded-lg border border-dashed p-3 text-center text-sm">
          <div className="font-medium mb-2">Transferts entre administrations</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
              État → Collectivités : <span className="font-mono">55 Md€</span> (DGF)
            </div>
            <div className="flex items-center justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
              État → Sécu : <span className="font-mono">75 Md€</span> (compensation exonérations)
            </div>
          </div>
        </div>

        <FlowArrow />

        {/* Niveau 4: Dépenses */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-center mb-2" style={{ color: "var(--chart-1)" }}>
              Dépenses État
            </div>
            <FlowBox label="Éducation" amount={89} color="var(--chart-1)" small />
            <FlowBox label="Défense" amount={64} color="var(--chart-1)" small />
            <FlowBox label="Intérêts dette" amount={55} color="var(--chart-1)" small />
            <FlowBox label="Sécurité" amount={26} color="var(--chart-1)" small />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-center mb-2" style={{ color: "var(--chart-2)" }}>
              Dépenses Sécu
            </div>
            <FlowBox label="Retraites" amount={285} color="var(--chart-2)" small />
            <FlowBox label="Santé" amount={274} color="var(--chart-2)" small />
            <FlowBox label="Famille" amount={55} color="var(--chart-2)" small />
            <FlowBox label="Autonomie" amount={40} color="var(--chart-2)" small />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-center mb-2" style={{ color: "var(--chart-3)" }}>
              Dépenses Collectivités
            </div>
            <FlowBox label="Communes" amount={105} color="var(--chart-3)" small />
            <FlowBox label="Départements" amount={85} color="var(--chart-3)" small />
            <FlowBox label="Interco" amount={65} color="var(--chart-3)" small />
            <FlowBox label="Régions" amount={43} color="var(--chart-3)" small />
          </div>
        </div>

        <FlowArrow />

        {/* Niveau 5: Bénéficiaires */}
        <div className="text-center">
          <div className="inline-block rounded-lg bg-muted px-4 py-2 text-sm font-medium">
            Services publics, prestations, infrastructures → Citoyens
          </div>
        </div>

        {/* Légende déficit */}
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-destructive">Déficit 2026 :</span>
            <span className="font-mono">~140 Md€</span>
            <span className="text-muted-foreground">(dépenses &gt; recettes → emprunt → dette)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
