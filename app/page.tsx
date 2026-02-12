import financeData from "@/data/finances-publiques-2026.json";
import evolutionData from "@/data/evolution-finances.json";
import { PublicSpendingChart } from "@/components/charts/public-spending-chart";
import { SecuBranchesChart } from "@/components/charts/secu-branches-chart";
import { DebtEvolutionChart } from "@/components/charts/debt-evolution-chart";
import { PrelevementsChart } from "@/components/charts/prelevements-chart";
import { EvolutionChart, DeficitChart } from "@/components/charts/evolution-chart";
import { TopMissionsChart } from "@/components/charts/top-missions-chart";
import { SalarySimulator } from "@/components/salary-simulator";
import { FlowDiagram } from "@/components/flow-diagram";
import { ThousandEuroBreakdown } from "@/components/thousand-euro-breakdown";
import { CitizenReturn } from "@/components/citizen-return";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COUNTRY_LABELS: Record<string, string> = {
  danemark: "Danemark",
  france: "France",
  allemagne: "Allemagne",
  italie: "Italie",
  espagne: "Espagne",
  grece: "Grèce",
  "moyenne ue": "Moyenne UE",
};

const formatMd = (value: number) => {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Md€`;
};

const formatPct = (value: number) => {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%`;
};

export default function Home() {
  const { context, vueGlobale, budgetEtat, securiteSociale, collectivitesLocales, prelevementsObligatoires, dette, destinationDepenses, retourCitoyen, pedagogie } = financeData;

  const population = context.population;
  const formatPerHab = (milliards: number) =>
    Math.round((milliards * 1_000_000_000) / population).toLocaleString("fr-FR") + " €/hab";

  // Prepare data for charts
  const spendingData = vueGlobale.repartition;
  const secuBranches = securiteSociale.branches;
  const debtEvolution = dette.evolution;
  const prelevements = prelevementsObligatoires.repartition;

  // Missions for state budget chart
  const missionsData = budgetEtat.principalesMissions.map((m) => ({
    mission: m.mission,
    ministry: m.ministere,
    amount_eur: m.montant_milliards_eur * 1_000_000_000,
  }));

  // Evolution data
  const evolutionHistory = evolutionData.annees;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-16 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge className="text-xs font-medium uppercase tracking-wider">
              Finances publiques 2026
            </Badge>
            <Badge variant="outline" className="text-xs">
              Mis à jour le {financeData.lastUpdate}
            </Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Comprendre les finances publiques françaises
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              {vueGlobale.description}. Cette page présente une vue d&apos;ensemble des recettes,
              dépenses et de la dette de l&apos;État, de la Sécurité Sociale et des collectivités locales.
            </p>
            {context.note && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Note : {context.note}
              </p>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardDescription>Dépenses publiques totales</CardDescription>
                <CardTitle className="font-mono text-2xl tracking-tight">
                  {formatMd(vueGlobale.depenses_totales_milliards_eur)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  soit {formatPct(vueGlobale.depenses_pib_pct)} du PIB
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatPerHab(vueGlobale.depenses_totales_milliards_eur)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Prélèvements obligatoires</CardDescription>
                <CardTitle className="font-mono text-2xl tracking-tight">
                  {formatMd(prelevementsObligatoires.total_milliards_eur)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  soit {formatPct(prelevementsObligatoires.pib_pct)} du PIB
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatPerHab(prelevementsObligatoires.total_milliards_eur)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Déficit public</CardDescription>
                <CardTitle className="font-mono text-2xl tracking-tight text-destructive">
                  -{formatMd(Math.round(context.deficit_public_pib_pct / 100 * context.pib_milliards_eur * 10) / 10)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  soit {formatPct(context.deficit_public_pib_pct)} du PIB — objectif &lt;3% en 2029
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatPerHab(context.deficit_public_pib_pct / 100 * context.pib_milliards_eur)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Dette publique</CardDescription>
                <CardTitle className="font-mono text-2xl tracking-tight text-destructive">
                  {formatMd(context.dette_publique_milliards_eur)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  soit {formatPct(context.dette_pib_pct)} du PIB (3e de l&apos;UE)
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatPerHab(context.dette_publique_milliards_eur)}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pour 1 000€ de dépenses publiques */}
        <section className="space-y-6">
          <ThousandEuroBreakdown postes={destinationDepenses.postes} />
        </section>

        {/* Ce que vous recevez en retour */}
        <section className="space-y-6">
          <CitizenReturn services={retourCitoyen.services} />
        </section>

        {/* Vue globale */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Vue d&apos;ensemble des dépenses publiques</h2>
            <p className="text-sm text-muted-foreground">
              Répartition entre les quatre catégories d&apos;administrations publiques (APU)
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <PublicSpendingChart data={spendingData} />
            <Card>
              <CardHeader>
                <CardTitle>Qui dépense quoi ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spendingData.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.categorie}</span>
                      <span className="font-mono">{formatMd(item.depenses_milliards_eur)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs: État / Sécu / Collectivités */}
        <section className="space-y-6">
          <Tabs defaultValue="etat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="etat">Budget de l&apos;État</TabsTrigger>
              <TabsTrigger value="secu">Sécurité Sociale</TabsTrigger>
              <TabsTrigger value="collectivites">Collectivités</TabsTrigger>
            </TabsList>

            {/* Budget de l'État */}
            <TabsContent value="etat" className="space-y-6 pt-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <p className="text-sm">{budgetEtat.description}. Les chiffres ci-dessous portent sur le budget de l&apos;État stricto sensu (526 Md€), qui est une composante des 585 Md€ de dépenses des administrations centrales.</p>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardDescription>Recettes nettes</CardDescription>
                    <CardTitle className="font-mono text-xl">
                      {formatMd(budgetEtat.recettes_nettes_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Dépenses</CardDescription>
                    <CardTitle className="font-mono text-xl">
                      {formatMd(budgetEtat.depenses_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Déficit État</CardDescription>
                    <CardTitle className="font-mono text-xl text-destructive">
                      -{formatMd(budgetEtat.deficit_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Principales missions budgétaires</h3>
                    <p className="text-sm text-muted-foreground">
                      Crédits alloués par mission (hors remboursements/dégrèvements)
                    </p>
                  </div>
                  <TopMissionsChart data={missionsData} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Principaux impôts d&apos;État</h3>
                    <p className="text-sm text-muted-foreground">
                      Les grandes recettes fiscales de l&apos;État
                    </p>
                  </div>
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      {budgetEtat.recettesFiscales.principaux_impots.map((impot, i) => (
                        <div key={i} className="space-y-1 border-b border-border pb-3 last:border-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-medium">{impot.label}</span>
                            <span className="font-mono text-sm">
                              {formatMd("montant_milliards_eur" in impot ? (impot.montant_milliards_eur ?? 0) : (impot.montant_brut_milliards_eur ?? 0))}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{impot.description}</p>
                          <p className="text-xs text-primary/70">Qui paye : {impot.qui_paye}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Sécurité Sociale */}
            <TabsContent value="secu" className="space-y-6 pt-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <p className="text-sm">{securiteSociale.description}</p>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardDescription>Recettes</CardDescription>
                    <CardTitle className="font-mono text-xl">
                      {formatMd(securiteSociale.recettes_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Dépenses</CardDescription>
                    <CardTitle className="font-mono text-xl">
                      {formatMd(securiteSociale.depenses_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Déficit Sécu</CardDescription>
                    <CardTitle className="font-mono text-xl text-destructive">
                      -{formatMd(securiteSociale.deficit_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Dépenses par branche</h3>
                    <p className="text-sm text-muted-foreground">
                      Les cinq branches de la Sécurité Sociale
                    </p>
                  </div>
                  <SecuBranchesChart data={secuBranches} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Financement de la Sécu</h3>
                    <p className="text-sm text-muted-foreground">
                      {securiteSociale.financement.description}
                    </p>
                  </div>
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      {securiteSociale.financement.sources.map((source, i) => (
                        <div key={i} className="space-y-1 border-b border-border pb-3 last:border-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-medium">{source.source}</span>
                            <span className="font-mono text-sm">{formatMd(source.montant_milliards_eur)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                          <p className="text-xs text-primary/70">Qui paye : {source.qui_paye}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Cotisations */}
              <Card>
                <CardHeader>
                  <CardTitle>Cotisations et prélèvements sociaux</CardTitle>
                  <CardDescription>{securiteSociale.tauxCotisations.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Part salariale ({formatPct(securiteSociale.tauxCotisations.total_salarie_pct)})</h4>
                      <div className="space-y-2 text-sm">
                        {securiteSociale.tauxCotisations.salariales.map((c, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">{c.cotisation}</span>
                            <span className="font-mono">{formatPct(c.taux_pct)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Part patronale ({formatPct(securiteSociale.tauxCotisations.total_employeur_pct)})</h4>
                      <div className="space-y-2 text-sm">
                        {securiteSociale.tauxCotisations.patronales.map((c, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">{c.cotisation}</span>
                            <span className="font-mono">{formatPct(c.taux_pct)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                    Total : {formatPct(securiteSociale.tauxCotisations.total_pct)} du salaire brut.{" "}
                    {securiteSociale.tauxCotisations.note}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Collectivités locales */}
            <TabsContent value="collectivites" className="space-y-6 pt-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <p className="text-sm">{collectivitesLocales.description}</p>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardDescription>Recettes de fonctionnement</CardDescription>
                    <CardTitle className="font-mono text-lg">
                      {formatMd(collectivitesLocales.recettes_fonctionnement_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Dépenses de fonctionnement</CardDescription>
                    <CardTitle className="font-mono text-lg">
                      {formatMd(collectivitesLocales.depenses_fonctionnement_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Investissement</CardDescription>
                    <CardTitle className="font-mono text-lg">
                      {formatMd(collectivitesLocales.investissement_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Déficit</CardDescription>
                    <CardTitle className="font-mono text-lg text-destructive">
                      -{formatMd(collectivitesLocales.deficit_milliards_eur)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <Card>
                  <CardHeader>
                    <CardTitle>Types de collectivités</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {collectivitesLocales.types.map((type, i) => (
                      <div key={i} className="space-y-1 border-b border-border pb-3 last:border-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">{type.type}</span>
                          <span className="text-sm text-muted-foreground">{type.nombre.toLocaleString("fr-FR")} entités</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-muted-foreground">Dépenses</span>
                          <span className="font-mono text-sm">{formatMd(type.depenses_milliards_eur)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{type.competences}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sources de financement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {collectivitesLocales.recettes.map((r, i) => (
                      <div key={i} className="space-y-1 border-b border-border pb-3 last:border-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">{r.source}</span>
                          <span className="font-mono text-sm">{formatMd(r.montant_milliards_eur)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                        {"note" in r && r.note && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">{r.note}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Prélèvements obligatoires */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Prélèvements obligatoires</h2>
            <p className="text-sm text-muted-foreground">
              {prelevementsObligatoires.description} - Total : {formatMd(prelevementsObligatoires.total_milliards_eur)} ({formatPct(prelevementsObligatoires.pib_pct)} du PIB)
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <PrelevementsChart data={prelevements} />
            <Card>
              <CardHeader>
                <CardTitle>Comparaison européenne</CardTitle>
                <CardDescription>Taux de prélèvements obligatoires (% du PIB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(prelevementsObligatoires.comparaisonEuropeenne)
                  .filter(([key]) => key !== "note")
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([key, value]) => {
                    const rawLabel = key.replace("_pct", "").replace(/_/g, " ");
                    const label = COUNTRY_LABELS[rawLabel] ?? rawLabel;
                    const isFrance = key === "france_pct";
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className={`${isFrance ? "font-semibold" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 rounded ${isFrance ? "bg-primary" : "bg-muted-foreground/30"}`}
                            style={{ width: `${(value as number) * 2}px` }}
                          />
                          <span className={`font-mono text-sm ${isFrance ? "font-semibold" : ""}`}>
                            {formatPct(value as number)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                <p className="text-xs text-muted-foreground pt-2">
                  {prelevementsObligatoires.comparaisonEuropeenne.note}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Diagramme de flux */}
        <section className="space-y-6">
          <FlowDiagram />
        </section>

        {/* Dette publique */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Évolution de la dette publique</h2>
            <p className="text-sm text-muted-foreground">
              La dette publique atteint {formatMd(dette.montant_milliards_eur)} soit {formatPct(dette.pib_pct)} du PIB.
              La charge des intérêts représente {formatMd(dette.charge_interets_milliards_eur)}/an.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <DebtEvolutionChart data={debtEvolution} />
            <Card>
              <CardHeader>
                <CardTitle>Comparaison européenne</CardTitle>
                <CardDescription>Dette publique (% du PIB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(dette.comparaisonEuropeenne)
                  .filter(([key]) => key !== "note")
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([key, value]) => {
                    const rawLabel = key.replace("_pct", "").replace(/_/g, " ");
                    const label = COUNTRY_LABELS[rawLabel] ?? rawLabel;
                    const isFrance = key === "france_pct";
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className={`${isFrance ? "font-semibold" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 rounded ${isFrance ? "bg-destructive" : "bg-muted-foreground/30"}`}
                            style={{ width: `${(value as number) / 2}px` }}
                          />
                          <span className={`font-mono text-sm ${isFrance ? "font-semibold" : ""}`}>
                            {formatPct(value as number)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                <p className="text-xs text-muted-foreground pt-2">{dette.comparaisonEuropeenne.note}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Évolution historique */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Évolution des finances publiques</h2>
            <p className="text-sm text-muted-foreground">
              Recettes et dépenses des administrations publiques depuis 2015
            </p>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recettes vs Dépenses</CardTitle>
                <CardDescription>L&apos;écart entre les deux courbes représente le déficit</CardDescription>
              </CardHeader>
              <CardContent>
                <EvolutionChart data={evolutionHistory} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Déficit public (% du PIB)</CardTitle>
                <CardDescription>La limite européenne est de 3% du PIB</CardDescription>
              </CardHeader>
              <CardContent>
                <DeficitChart data={evolutionHistory} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Simulateur */}
        <section className="space-y-6">
          <SalarySimulator />
        </section>

        {/* Pédagogie */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Comprendre les finances publiques</h2>
            <p className="text-sm text-muted-foreground">
              Questions fréquentes et glossaire pour mieux comprendre
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Questions fréquentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {pedagogie.questionsFrequentes.map((qa, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-medium text-sm">{qa.question}</h4>
                    <p className="text-sm text-muted-foreground">{qa.reponse}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Glossaire</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {pedagogie.glossaire.map((item, i) => (
                    <div key={i}>
                      <dt className="font-mono text-sm font-semibold text-primary">{item.terme}</dt>
                      <dd className="text-sm text-muted-foreground">{item.definition}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sources */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Sources des données</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(financeData.sources).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-border p-4 text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                <span className="block text-xs text-muted-foreground truncate mt-1">{url}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
