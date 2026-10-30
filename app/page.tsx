import { DebtEvolutionChart } from "@/components/charts/debt-evolution-chart";
import {
	DeficitChart,
	EvolutionChart,
} from "@/components/charts/evolution-chart";
import { PrelevementsChart } from "@/components/charts/prelevements-chart";
import { PublicSpendingChart } from "@/components/charts/public-spending-chart";
import { SecuBranchesChart } from "@/components/charts/secu-branches-chart";
import { TopMissionsChart } from "@/components/charts/top-missions-chart";
import { CitizenReturn } from "@/components/citizen-return";
import { FlowDiagram, type FlowDiagramData } from "@/components/flow-diagram";
import { SalarySimulator } from "@/components/salary-simulator";
import { ThousandEuroBreakdown } from "@/components/thousand-euro-breakdown";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import evolutionData from "@/data/evolution-finances.json";
import financeData from "@/data/finances-publiques-2026.json";
import { formatEur, formatMd, formatNombre, formatPct } from "@/lib/format";
import { findOrThrow, requireAmount } from "@/lib/guards";
import { lireCotisations, tauxSousLePass } from "@/lib/simulateur";

const COUNTRY_LABELS: Record<string, string> = {
	danemark: "Danemark",
	france: "France",
	allemagne: "Allemagne",
	italie: "Italie",
	espagne: "Espagne",
	grece: "Grèce",
	"moyenne ue": "Moyenne UE",
};

const SOMMAIRE = [
	{ id: "repartition", libelle: "Pour 1\u202f000\u00a0€" },
	{ id: "qui-gere", libelle: "Qui dépense" },
	{ id: "administrations", libelle: "Administrations" },
	{ id: "prelevements", libelle: "Prélèvements" },
	{ id: "circuit", libelle: "Circuit" },
	{ id: "dette", libelle: "Dette" },
	{ id: "evolution", libelle: "Évolution" },
	{ id: "simulateur", libelle: "Simulateur" },
	{ id: "comprendre", libelle: "Comprendre" },
	{ id: "sources", libelle: "Sources" },
];

type Source = { libelle: string; url: string };

function SourceNote({ sources }: { sources: Source[] }) {
	return (
		<p className="text-xs text-muted-foreground">
			Source{sources.length > 1 ? "s" : ""} :{" "}
			{sources.map((source, i) => (
				<span key={source.url}>
					{i > 0 && " ; "}
					<a
						href={source.url}
						target="_blank"
						rel="noreferrer"
						className="underline underline-offset-2 hover:text-foreground"
					>
						{source.libelle}
					</a>
				</span>
			))}
		</p>
	);
}

export default function Home() {
	const { sources } = financeData;
	const {
		context,
		vueGlobale,
		budgetEtat,
		securiteSociale,
		collectivitesLocales,
		prelevementsObligatoires,
		dette,
		destinationDepenses,
		retourCitoyen,
		pedagogie,
	} = financeData;

	const cotisationsSalariales = lireCotisations(
		securiteSociale.tauxCotisations.salariales,
	);
	const cotisationsPatronales = lireCotisations(
		securiteSociale.tauxCotisations.patronales,
	);

	const autresOrganismes = findOrThrow(
		vueGlobale.repartition,
		(r) => r.categorie === "Autres organismes publics",
		"Autres organismes publics",
	);

	const population = context.population;
	const formatPerHab = (milliards: number) =>
		`${formatEur((milliards * 1_000_000_000) / population)}/hab`;

	// Prepare data for charts
	const spendingData = vueGlobale.repartition;
	const secuBranches = securiteSociale.branches;
	const debtEvolution = dette.evolution;
	const prelevements = prelevementsObligatoires.repartition;

	// Missions for state budget chart
	const missionsData = budgetEtat.principalesMissions.map((m) => ({
		mission: m.mission,
		description: m.description,
		amount_milliards_eur: m.montant_milliards_eur,
		pensions_milliards_eur: m.dont_pensions_milliards_eur,
	}));

	// Evolution data
	const evolutionHistory = evolutionData.annees;
	const dernierExcedent = evolutionHistory.findLast(
		(a) => a.deficit_pib_pct > 0,
	)?.annee;

	// Flow diagram data (derived from JSON)
	const cotisationsMontant = findOrThrow(
		prelevementsObligatoires.repartition,
		(r) => r.type === "Cotisations sociales",
		"Cotisations sociales",
	).montant_milliards_eur;
	const csgMontant = findOrThrow(
		prelevementsObligatoires.repartition,
		(r) => r.type === "CSG-CRDS",
		"CSG-CRDS",
	).montant_milliards_eur;

	const MISSION_LABELS: Record<string, string> = {
		"Enseignement scolaire": "Éducation",
		"Engagements financiers de l'État": "Intérêts dette",
		"Recherche et enseignement supérieur": "Recherche",
		"Solidarité, insertion et égalité des chances": "Solidarité",
		Sécurités: "Sécurité",
		"Travail et emploi": "Emploi",
		"Écologie et mobilités": "Écologie",
	};

	const BRANCHE_LABELS: Record<string, string> = {
		Vieillesse: "Retraites",
		Maladie: "Santé",
	};

	const flowData: FlowDiagramData = {
		prelevements: {
			impots:
				prelevementsObligatoires.total_milliards_eur -
				cotisationsMontant -
				csgMontant,
			cotisations: cotisationsMontant,
			csgCrds: csgMontant,
		},
		etat: {
			total: findOrThrow(
				vueGlobale.repartition,
				(r) => r.categorie === "État",
				"État",
			).depenses_milliards_eur,
			// Hors retraites des agents : ces pensions sont déjà dans la colonne Sécu (Retraites)
			depenses: budgetEtat.principalesMissions
				.map((m) => ({
					label: MISSION_LABELS[m.mission] ?? m.mission,
					amount: m.montant_milliards_eur - m.dont_pensions_milliards_eur,
				}))
				.sort((a, b) => b.amount - a.amount)
				.slice(0, 4),
		},
		secu: {
			total: findOrThrow(
				vueGlobale.repartition,
				(r) => r.categorie === "Sécurité Sociale",
				"Sécurité Sociale",
			).depenses_milliards_eur,
			depenses: [...securiteSociale.branches]
				.sort((a, b) => b.depenses_milliards_eur - a.depenses_milliards_eur)
				.slice(0, 4)
				.map((b) => ({
					label: BRANCHE_LABELS[b.branche] ?? b.branche,
					amount: b.depenses_milliards_eur,
				})),
		},
		collectivites: {
			total: findOrThrow(
				vueGlobale.repartition,
				(r) => r.categorie === "Collectivités locales",
				"Collectivités locales",
			).depenses_milliards_eur,
			depenses: collectivitesLocales.types.map((t) => ({
				label: t.type.includes("EPCI") ? "Interco" : t.type,
				amount: t.depenses_milliards_eur,
			})),
		},
		autresOrganismes: {
			total: autresOrganismes.depenses_milliards_eur,
			description: autresOrganismes.description,
		},
		transferts: {
			etatCollectivites: findOrThrow(
				collectivitesLocales.recettes,
				(r) => r.source === "Dotations de l'État",
				"Dotations de l'État",
			).montant_milliards_eur,
			taxesAffecteesSecu: findOrThrow(
				securiteSociale.financement.sources,
				(s) => s.source === "Impôts et taxes affectés",
				"Impôts et taxes affectés",
			).montant_milliards_eur,
		},
		deficit: Math.round(
			(context.deficit_public_pib_pct / 100) * context.pib_milliards_eur,
		),
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16">
			<main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-16 sm:px-6 lg:px-8">
				{/* Header */}
				<section className="space-y-6">
					<div className="flex flex-wrap gap-2">
						<Badge className="text-xs font-medium uppercase tracking-wider">
							Finances publiques {financeData.year}
						</Badge>
						<Badge variant="outline" className="text-xs">
							Mis à jour le{" "}
							{new Date(financeData.lastUpdate).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "long",
								year: "numeric",
								timeZone: "UTC",
							})}
						</Badge>
					</div>
					<div className="space-y-4">
						<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
							Comprendre les finances publiques françaises
						</h1>
						<p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
							{vueGlobale.description}. Cette page présente une vue
							d&apos;ensemble des recettes, dépenses et de la dette de
							l&apos;État, de la Sécurité Sociale et des collectivités locales.
						</p>
						{context.note && (
							<p className="text-xs text-muted-foreground">
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
									{vueGlobale.periode}
								</p>
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
									{prelevementsObligatoires.periode}
								</p>
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
									-
									{formatMd(
										Math.round(
											(context.deficit_public_pib_pct / 100) *
												context.pib_milliards_eur *
												10,
										) / 10,
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-xs text-muted-foreground">
									{context.deficit_periode}
								</p>
								<p className="text-xs text-muted-foreground">
									soit {formatPct(context.deficit_public_pib_pct)} du PIB,{" "}
									{context.deficit_objectif}
								</p>
								<p className="text-xs font-medium text-muted-foreground">
									{formatPerHab(
										(context.deficit_public_pib_pct / 100) *
											context.pib_milliards_eur,
									)}
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
								<p className="text-xs text-muted-foreground">{dette.periode}</p>
								<p className="text-xs text-muted-foreground">
									soit {formatPct(context.dette_pib_pct)} du PIB (
									{dette.rang_ue})
								</p>
								<p className="text-xs font-medium text-muted-foreground">
									{formatPerHab(context.dette_publique_milliards_eur)}
								</p>
							</CardContent>
						</Card>
					</div>
					<SourceNote
						sources={[sources.budget_etat, sources.comptes_2025, sources.dette]}
					/>
				</section>

				<nav
					aria-label="Sommaire"
					className="sticky top-0 z-10 -mx-4 -my-6 overflow-x-auto border-b border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
				>
					<ul className="flex gap-4 whitespace-nowrap text-sm text-muted-foreground">
						{SOMMAIRE.map((entree) => (
							<li key={entree.id}>
								<a href={`#${entree.id}`} className="hover:text-foreground">
									{entree.libelle}
								</a>
							</li>
						))}
					</ul>
				</nav>

				{/* Pour 1 000€ de dépenses publiques */}
				<section id="repartition" className="scroll-mt-16 space-y-6">
					<ThousandEuroBreakdown
						postes={destinationDepenses.postes}
						baseMiliardsEur={destinationDepenses.base_milliards_eur}
					/>
				</section>

				{/* Ce que vous recevez en retour */}
				<section id="services" className="scroll-mt-16 space-y-6">
					<CitizenReturn services={retourCitoyen.services} />
				</section>

				{/* Vue globale */}
				<section id="qui-gere" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Qui gère les dépenses publiques ?
						</h2>
						<p className="text-sm text-muted-foreground">
							La section précédente montrait <strong>à quoi</strong> sert
							l&apos;argent public (retraites, santé, éducation...). Ici, on
							regarde <strong>qui</strong> le dépense : les quatre catégories
							d&apos;administrations publiques (APU). Les chiffres diffèrent car
							une même fonction (ex : l&apos;éducation) est financée par
							plusieurs administrations à la fois.
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
						<PublicSpendingChart data={spendingData} />
						<Card>
							<CardHeader>
								<CardTitle>Qui dépense quoi ?</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{spendingData.map((item) => (
									<div key={item.categorie} className="space-y-1">
										<div className="flex justify-between">
											<span className="font-medium">{item.categorie}</span>
											<span className="font-mono">
												{formatMd(item.depenses_milliards_eur)}
											</span>
										</div>
										<p className="text-xs text-muted-foreground">
											{item.description}
										</p>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Tabs: État / Sécu / Collectivités */}
				<section id="administrations" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Zoom sur chaque administration
						</h2>
						<p className="text-sm text-muted-foreground">
							Chaque onglet détaille les recettes et dépenses d&apos;une
							catégorie d&apos;administration. Tout ce qui se trouve dans le
							cadre ci-dessous se rapporte à l&apos;onglet sélectionné.
						</p>
					</div>
					<div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
						<Tabs defaultValue="etat" className="w-full">
							<TabsList>
								<TabsTrigger value="etat">Budget de l&apos;État</TabsTrigger>
								<TabsTrigger value="secu">Sécurité Sociale</TabsTrigger>
								<TabsTrigger value="collectivites">Collectivités</TabsTrigger>
							</TabsList>

							{/* Budget de l'État */}
							<TabsContent value="etat" className="space-y-6 pt-4">
								<Card className="bg-muted/30">
									<CardContent>
										<p className="text-sm">
											{budgetEtat.description}. Les chiffres ci-dessous portent
											sur le budget de l&apos;État stricto sensu (
											{formatMd(budgetEtat.depenses_milliards_eur)}), qui est
											une composante des{" "}
											{formatMd(
												findOrThrow(
													vueGlobale.repartition,
													(r) => r.categorie === "État",
													"État",
												).depenses_milliards_eur,
											)}{" "}
											de dépenses des administrations centrales.
										</p>
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
											<h3 className="text-lg font-semibold">
												Principales missions budgétaires
											</h3>
											<p className="text-sm text-muted-foreground">
												Crédits alloués par mission (hors
												remboursements/dégrèvements)
											</p>
										</div>
										<TopMissionsChart data={missionsData} />
										<p className="text-xs text-muted-foreground">
											{budgetEtat.notePensions}
										</p>
									</div>
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-semibold">
												Principaux impôts d&apos;État
											</h3>
											<p className="text-sm text-muted-foreground">
												Les grandes recettes fiscales de l&apos;État
											</p>
										</div>
										<Card>
											<CardContent className="space-y-3">
												{budgetEtat.recettesFiscales.principaux_impots.map(
													(impot) => (
														<div
															key={impot.label}
															className="space-y-1 border-b border-border pb-3 last:border-0"
														>
															<div className="flex justify-between items-baseline">
																<span className="font-medium">
																	{impot.label}
																</span>
																<span className="font-mono text-sm">
																	{formatMd(
																		requireAmount(
																			"montant_milliards_eur" in impot
																				? impot.montant_milliards_eur
																				: impot.montant_brut_milliards_eur,
																			impot.label,
																		),
																	)}
																</span>
															</div>
															<p className="text-xs text-muted-foreground">
																{impot.description}
															</p>
															<p className="text-xs text-primary">
																Qui paye : {impot.qui_paye}
															</p>
														</div>
													),
												)}
											</CardContent>
										</Card>
									</div>
								</div>
								<SourceNote
									sources={[sources.loi_finances_2026, sources.budget_etat]}
								/>
							</TabsContent>

							{/* Sécurité Sociale */}
							<TabsContent value="secu" className="space-y-6 pt-4">
								<Card className="bg-muted/30">
									<CardContent>
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
											<h3 className="text-lg font-semibold">
												Dépenses par branche
											</h3>
											<p className="text-sm text-muted-foreground">
												Les cinq branches de la Sécurité Sociale
											</p>
										</div>
										<SecuBranchesChart data={secuBranches} />
									</div>
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-semibold">
												Financement de la Sécu
											</h3>
											<p className="text-sm text-muted-foreground">
												{securiteSociale.financement.description}
											</p>
										</div>
										<Card>
											<CardContent className="space-y-3">
												{securiteSociale.financement.sources.map((source) => (
													<div
														key={source.source}
														className="space-y-1 border-b border-border pb-3 last:border-0"
													>
														<div className="flex justify-between items-baseline">
															<span className="font-medium">
																{source.source}
															</span>
															<span className="font-mono text-sm">
																{formatMd(source.montant_milliards_eur)}
															</span>
														</div>
														<p className="text-xs text-muted-foreground">
															{source.description}
														</p>
														<p className="text-xs text-primary">
															Qui paye : {source.qui_paye}
														</p>
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
										<CardDescription>
											{securiteSociale.tauxCotisations.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid gap-6 md:grid-cols-2">
											<div>
												<h4 className="font-medium mb-3">
													Part salariale (
													{formatPct(
														tauxSousLePass(
															cotisationsSalariales,
															financeData.simulateur,
														),
													)}
													)
												</h4>
												<div className="space-y-2 text-sm">
													{securiteSociale.tauxCotisations.salariales.map(
														(c) => (
															<div key={c.cle} className="flex justify-between">
																<span className="text-muted-foreground">
																	{c.cotisation}
																</span>
																<span className="font-mono">
																	{formatPct(c.taux_pct)}
																</span>
															</div>
														),
													)}
												</div>
											</div>
											<div>
												<h4 className="font-medium mb-3">
													Part patronale (
													{formatPct(
														tauxSousLePass(
															cotisationsPatronales,
															financeData.simulateur,
														),
													)}
													)
												</h4>
												<div className="space-y-2 text-sm">
													{securiteSociale.tauxCotisations.patronales.map(
														(c) => (
															<div key={c.cle} className="flex justify-between">
																<span className="text-muted-foreground">
																	{c.cotisation}
																</span>
																<span className="font-mono">
																	{formatPct(c.taux_pct)}
																</span>
															</div>
														),
													)}
												</div>
											</div>
										</div>
										<p className="mt-4 text-sm text-muted-foreground">
											Total :{" "}
											{formatPct(
												tauxSousLePass(
													cotisationsSalariales,
													financeData.simulateur,
												) +
													tauxSousLePass(
														cotisationsPatronales,
														financeData.simulateur,
													),
											)}{" "}
											du salaire brut. {securiteSociale.tauxCotisations.note}
										</p>
									</CardContent>
								</Card>
								<SourceNote sources={[sources.securite_sociale]} />
							</TabsContent>

							{/* Collectivités locales */}
							<TabsContent value="collectivites" className="space-y-6 pt-4">
								<Card className="bg-muted/30">
									<CardContent>
										<p className="text-sm">
											{collectivitesLocales.description}
										</p>
									</CardContent>
								</Card>

								<div className="grid gap-4 sm:grid-cols-4">
									<Card>
										<CardHeader>
											<CardDescription>
												Recettes de fonctionnement
											</CardDescription>
											<CardTitle className="font-mono text-lg">
												{formatMd(
													collectivitesLocales.recettes_fonctionnement_milliards_eur,
												)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>
												Dépenses de fonctionnement
											</CardDescription>
											<CardTitle className="font-mono text-lg">
												{formatMd(
													collectivitesLocales.depenses_fonctionnement_milliards_eur,
												)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Investissement</CardDescription>
											<CardTitle className="font-mono text-lg">
												{formatMd(
													collectivitesLocales.investissement_milliards_eur,
												)}
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
											{collectivitesLocales.types.map((type) => (
												<div
													key={type.type}
													className="space-y-1 border-b border-border pb-3 last:border-0"
												>
													<div className="flex justify-between items-baseline">
														<span className="font-medium">{type.type}</span>
														<span className="text-sm text-muted-foreground">
															{formatNombre(type.nombre, 0)} entités
														</span>
													</div>
													<div className="flex justify-between items-baseline">
														<span className="text-xs text-muted-foreground">
															Dépenses
														</span>
														<span className="font-mono text-sm">
															{formatMd(type.depenses_milliards_eur)}
														</span>
													</div>
													<p className="text-xs text-muted-foreground">
														{type.competences}
													</p>
												</div>
											))}
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Sources de financement</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											{collectivitesLocales.recettes.map((r) => (
												<div
													key={r.source}
													className="space-y-1 border-b border-border pb-3 last:border-0"
												>
													<div className="flex justify-between items-baseline">
														<span className="font-medium">{r.source}</span>
														<span className="font-mono text-sm">
															{formatMd(r.montant_milliards_eur)}
														</span>
													</div>
													<p className="text-xs text-muted-foreground">
														{r.description}
													</p>
													{"note" in r && r.note && (
														<p className="text-xs text-muted-foreground">
															{r.note}
														</p>
													)}
												</div>
											))}
										</CardContent>
									</Card>
								</div>
								<SourceNote sources={[sources.collectivites]} />
							</TabsContent>
						</Tabs>
					</div>
				</section>

				{/* Prélèvements obligatoires */}
				<section id="prelevements" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Prélèvements obligatoires
						</h2>
						<p className="text-sm text-muted-foreground">
							{prelevementsObligatoires.description}. Total :{" "}
							{formatMd(prelevementsObligatoires.total_milliards_eur)} (
							{formatPct(prelevementsObligatoires.pib_pct)} du PIB)
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
						<PrelevementsChart data={prelevements} />
						<Card>
							<CardHeader>
								<CardTitle>Comparaison européenne</CardTitle>
								<CardDescription>
									Taux de prélèvements obligatoires (% du PIB)
								</CardDescription>
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
											<div
												key={key}
												className="flex justify-between items-center"
											>
												<span
													className={`${isFrance ? "font-semibold" : "text-muted-foreground"}`}
												>
													{label}
												</span>
												<div className="flex items-center gap-2">
													<div
														className={`h-2 rounded ${isFrance ? "bg-primary" : "bg-muted-foreground/30"}`}
														style={{ width: `${(value as number) * 2}px` }}
													/>
													<span
														className={`font-mono text-sm ${isFrance ? "font-semibold" : ""}`}
													>
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
				<section id="circuit" className="scroll-mt-16 space-y-6">
					<FlowDiagram data={flowData} />
				</section>

				{/* Dette publique */}
				<section id="dette" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Évolution de la dette publique
						</h2>
						<p className="text-sm text-muted-foreground">
							La dette publique atteint {formatMd(dette.montant_milliards_eur)}{" "}
							soit {formatPct(dette.pib_pct)} du PIB. La charge des intérêts
							représente {formatMd(dette.charge_interets_milliards_eur)}/an. Le
							graphique retrace la dette au sens de Maastricht depuis{" "}
							{debtEvolution[0]?.annee} (en % du PIB, montants en Md€ au
							survol).
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
											<div
												key={key}
												className="flex justify-between items-center"
											>
												<span
													className={`${isFrance ? "font-semibold" : "text-muted-foreground"}`}
												>
													{label}
												</span>
												<div className="flex items-center gap-2">
													<div
														className={`h-2 rounded ${isFrance ? "bg-destructive" : "bg-muted-foreground/30"}`}
														style={{ width: `${(value as number) / 2}px` }}
													/>
													<span
														className={`font-mono text-sm ${isFrance ? "font-semibold" : ""}`}
													>
														{formatPct(value as number)}
													</span>
												</div>
											</div>
										);
									})}
								<p className="text-xs text-muted-foreground pt-2">
									{dette.comparaisonEuropeenne.note}
								</p>
							</CardContent>
						</Card>
					</div>
					<SourceNote sources={[sources.dette_serie_longue, sources.dette]} />
				</section>

				{/* Évolution historique */}
				<section id="evolution" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Évolution des finances publiques
						</h2>
						<p className="text-sm text-muted-foreground">
							Recettes et dépenses des administrations publiques en % du PIB
							depuis {evolutionHistory[0]?.annee} (comptes nationaux
							INSEE/Eurostat)
						</p>
					</div>
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Recettes vs Dépenses</CardTitle>
								<CardDescription>
									L&apos;écart entre les deux courbes représente le déficit
								</CardDescription>
							</CardHeader>
							<CardContent>
								<EvolutionChart
									data={evolutionHistory}
									dernierExcedent={dernierExcedent}
								/>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Solde public (% du PIB)</CardTitle>
								<CardDescription>
									La limite européenne est de 3&nbsp;% de déficit ; dernier
									excédent : {dernierExcedent}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<DeficitChart data={evolutionHistory} />
							</CardContent>
						</Card>
					</div>
					<SourceNote
						sources={[
							{ libelle: evolutionData.source, url: evolutionData.sourceUrl },
						]}
					/>
				</section>

				{/* Simulateur */}
				<section id="simulateur" className="scroll-mt-16 space-y-6">
					<SalarySimulator
						salariales={cotisationsSalariales}
						patronales={cotisationsPatronales}
						simulateur={financeData.simulateur}
					/>
					<SourceNote sources={financeData.simulateur.sources} />
				</section>

				{/* Pédagogie */}
				<section id="comprendre" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Comprendre les finances publiques
						</h2>
						<p className="text-sm text-muted-foreground">
							Questions fréquentes et glossaire pour mieux comprendre
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Questions fréquentes</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{pedagogie.questionsFrequentes.map((qa) => (
									<details
										key={qa.question}
										className="group border-b border-border pb-3 last:border-0"
									>
										<summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
											<span
												aria-hidden="true"
												className="mr-2 inline-block text-muted-foreground transition-transform group-open:rotate-90"
											>
												›
											</span>
											{qa.question}
										</summary>
										<p className="mt-2 text-sm text-muted-foreground">
											{qa.reponse}
										</p>
									</details>
								))}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Glossaire</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="space-y-3">
									{pedagogie.glossaire.map((item) => (
										<div key={item.terme}>
											<dt className="font-mono text-sm font-semibold text-primary">
												{item.terme}
											</dt>
											<dd className="text-sm text-muted-foreground">
												{item.definition}
											</dd>
										</div>
									))}
								</dl>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Sources */}
				<section id="sources" className="scroll-mt-16 space-y-4">
					<h2 className="text-lg font-semibold">Sources des données</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{Object.entries(financeData.sources).map(([key, source]) => (
							<a
								key={key}
								href={source.url}
								target="_blank"
								rel="noreferrer"
								className="block rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-primary/40"
							>
								<span className="font-medium">{source.libelle}</span>
								<span className="mt-1 block text-xs text-muted-foreground">
									{new URL(source.url).hostname}
								</span>
							</a>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
