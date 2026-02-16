import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
} from "lucide-react";

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

interface Poste {
  label: string;
  montant_eur: number;
  icon: string;
}

interface ThousandEuroBreakdownProps {
  postes: Poste[];
  baseMiliardsEur?: number;
}

export function ThousandEuroBreakdown({ postes, baseMiliardsEur }: ThousandEuroBreakdownProps) {
  const sorted = [...postes].sort((a, b) => b.montant_eur - a.montant_eur);
  const total = sorted.reduce((sum, p) => sum + p.montant_eur, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pour 1 000 € de dépenses publiques</CardTitle>
        <CardDescription>
          Ventilation fonctionnelle (classification COFOG) de chaque tranche de 1 000 € dépensés par les administrations publiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((poste) => {
          const Icon = ICONS[poste.icon];
          const pct = (poste.montant_eur / total) * 100;
          return (
            <div key={poste.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span>{poste.label}</span>
                </div>
                <span className="font-mono font-medium">{poste.montant_eur} €</span>
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
          Total : {sorted.reduce((sum, p) => sum + p.montant_eur, 0)} €{baseMiliardsEur ? ` — calculé à partir des dépenses totales de ${baseMiliardsEur.toLocaleString("fr-FR")} Md€` : ""}
        </p>
      </CardContent>
    </Card>
  );
}
