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
  Map,
  Shield,
  Scale,
  Users,
  Briefcase,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Heart,
  GraduationCap,
  Map,
  Shield,
  Scale,
  Users,
  Briefcase,
};

interface Service {
  service: string;
  valeur: string;
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
        <CardTitle>Ce que financent les dépenses publiques</CardTitle>
        <CardDescription>
          Les services et prestations concrets dont bénéficient les citoyens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <div
                key={s.service}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
                  <span className="font-medium text-sm">{s.service}</span>
                </div>
                <p className="font-mono text-lg font-semibold">{s.valeur}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
