import { DebtEvolutionChart } from "@/components/charts/debt-evolution-chart";
import {
	DeficitChart,
	EvolutionChart,
} from "@/components/charts/evolution-chart";
import { LeviesChart } from "@/components/charts/levies-chart";
import { PublicSpendingChart } from "@/components/charts/public-spending-chart";
import { SocialSecurityBranchesChart } from "@/components/charts/social-security-branches-chart";
import { TopMissionsChart } from "@/components/charts/top-missions-chart";
import { CitizenReturn } from "@/components/citizen-return";
import { EuropeanComparison } from "@/components/european-comparison";
import { FlowDiagram, type FlowDiagramData } from "@/components/flow-diagram";
import { LinkCard } from "@/components/link-card";
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
import { TextLink } from "@/components/ui/text-link";
import {
	publicFinances2026 as financeData,
	type Source,
} from "@/lib/data/public-finances-2026";
import { publicFinanceHistory as evolutionData } from "@/lib/data/public-finances-history";
import {
	explainerValues,
	fillPlaceholders,
	yearBalance,
} from "@/lib/explainer";
import {
	lastSurplusYear,
	perInhabitantEur,
	taxesAndDuties,
} from "@/lib/finances";
import {
	formatCount,
	formatEur,
	formatMd,
	formatNumber,
	formatPct,
} from "@/lib/format";
import { findOrThrow, requireHttpsUrl } from "@/lib/guards";
import { rateBelowPass } from "@/lib/simulator";

const TABLE_OF_CONTENTS = [
	{ id: "breakdown", label: "Pour 1\u202f000\u00a0€" },
	{ id: "who-spends", label: "Qui dépense" },
	{ id: "administrations", label: "Administrations" },
	{ id: "levies", label: "Prélèvements" },
	{ id: "flow", label: "Circuit" },
	{ id: "debt", label: "Dette" },
	{ id: "history", label: "Évolution" },
	{ id: "simulator", label: "Simulateur" },
	{ id: "explainer", label: "Comprendre" },
	{ id: "sources", label: "Sources" },
];

function SourceNote({ sources }: { sources: Source[] }) {
	return (
		<p className="text-xs text-muted-foreground">
			Source{sources.length > 1 ? "s" : ""} :{" "}
			{sources.map((source, i) => (
				<span key={source.url}>
					{i > 0 && " ; "}
					<TextLink
						href={requireHttpsUrl(source.url)}
						target="_blank"
						rel="noopener noreferrer"
					>
						{source.label}
					</TextLink>
				</span>
			))}
		</p>
	);
}

export default function Home() {
	const { sources } = financeData;
	const {
		context,
		overview,
		stateBudget,
		socialSecurity,
		localAuthorities,
		compulsoryLevies,
		debt,
		spendingByFunction,
		citizenReturn,
		explainer,
	} = financeData;

	const employeeCotisations = socialSecurity.cotisationRates.employee;
	const employerCotisations = socialSecurity.cotisationRates.employer;

	const stateCategory = findOrThrow(
		overview.breakdown,
		(r) => r.category === "État",
		"État",
	);
	const otherBodies = findOrThrow(
		overview.breakdown,
		(r) => r.category === "Autres organismes publics",
		"Autres organismes publics",
	);

	// Déficit de l'année : la ligne des séries longues, objectif de la loi de finances. Pas un
	// produit taux × PIB : le PIB implicite de la dette n'est pas celui de la loi de finances.
	const currentBalance = yearBalance(evolutionData.years, financeData.year);
	const placeholderValues = explainerValues(financeData, evolutionData.years);

	const formatPerHab = (billionEur: number) =>
		`${formatEur(perInhabitantEur(billionEur, context.population))}/hab`;

	// Données des graphiques
	const spendingData = overview.breakdown;
	const socialSecurityBranches = socialSecurity.branches;
	const branchesTotal = socialSecurityBranches.reduce(
		(sum, b) => sum + b.spendingBillionEur,
		0,
	);
	const debtHistory = debt.history;
	const levies = compulsoryLevies.breakdown;

	// Séries longues
	const evolutionHistory = evolutionData.years;
	const lastSurplus = lastSurplusYear(evolutionHistory);

	// Données du circuit
	const cotisationsBillionEur = findOrThrow(
		compulsoryLevies.breakdown,
		(r) => r.type === "Cotisations sociales",
		"Cotisations sociales",
	).amountBillionEur;
	const csgCrdsBillionEur = findOrThrow(
		compulsoryLevies.breakdown,
		(r) => r.type === "CSG-CRDS",
		"CSG-CRDS",
	).amountBillionEur;

	const MISSION_LABELS: Record<string, string> = {
		"Enseignement scolaire": "Éducation",
		"Engagements financiers de l'État": "Intérêts dette",
		"Recherche et enseignement supérieur": "Recherche",
		"Solidarité, insertion et égalité des chances": "Solidarité",
		Sécurités: "Sécurité",
		"Travail et emploi": "Emploi",
		"Écologie et mobilités": "Écologie",
	};

	const BRANCH_LABELS: Record<string, string> = {
		Vieillesse: "Retraites",
		Maladie: "Santé",
	};

	const flowData: FlowDiagramData = {
		levies: {
			taxes: taxesAndDuties({
				totalBillionEur: compulsoryLevies.totalBillionEur,
				cotisationsBillionEur: cotisationsBillionEur,
				csgCrdsBillionEur: csgCrdsBillionEur,
			}),
			cotisations: cotisationsBillionEur,
			csgCrds: csgCrdsBillionEur,
		},
		state: {
			total: stateCategory.spendingBillionEur,
			// Hors retraites des agents : ces pensions sont déjà dans la colonne Sécu (Retraites)
			spending: stateBudget.mainMissions
				.map((m) => ({
					label: MISSION_LABELS[m.mission] ?? m.mission,
					amount: m.amountBillionEur - m.pensionsBillionEur,
				}))
				.sort((a, b) => b.amount - a.amount)
				.slice(0, 4),
		},
		socialSecurity: {
			total: findOrThrow(
				overview.breakdown,
				(r) => r.category === "Sécurité sociale",
				"Sécurité sociale",
			).spendingBillionEur,
			branchesTotal: branchesTotal,
			spending: [...socialSecurity.branches]
				.sort((a, b) => b.spendingBillionEur - a.spendingBillionEur)
				.map((b) => ({
					label: BRANCH_LABELS[b.branch] ?? b.branch,
					amount: b.spendingBillionEur,
				})),
		},
		localAuthorities: {
			total: findOrThrow(
				overview.breakdown,
				(r) => r.category === "Collectivités locales",
				"Collectivités locales",
			).spendingBillionEur,
			spending: localAuthorities.types.map((t) => ({
				label: t.type.includes("EPCI") ? "Interco" : t.type,
				amount: t.spendingBillionEur,
			})),
		},
		otherBodies: {
			total: otherBodies.spendingBillionEur,
			description: otherBodies.description,
		},
		transfers: {
			stateToLocalAuthorities: findOrThrow(
				localAuthorities.revenue,
				(r) => r.source === "Dotations de l'État",
				"Dotations de l'État",
			).amountBillionEur,
			earmarkedTaxesToSocialSecurity: findOrThrow(
				socialSecurity.funding.sources,
				(s) => s.source === "Impôts et taxes affectés",
				"Impôts et taxes affectés",
			).amountBillionEur,
		},
		deficit: currentBalance.deficitBillionEur,
		year: financeData.year,
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-16">
			<main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-16 sm:px-6 lg:px-8">
				{/* En-tête */}
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
							{overview.description}. Cette page présente une vue
							d&apos;ensemble des recettes, dépenses et de la dette de
							l&apos;État, de la Sécurité sociale et des collectivités locales.
						</p>
						{context.note && (
							<p className="text-xs text-muted-foreground">
								Note : {context.note}
							</p>
						)}
					</div>

					{/* Chiffres clés */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader>
								<CardDescription>Dépenses publiques totales</CardDescription>
								<CardTitle className="font-mono text-2xl tracking-tight">
									{formatMd(overview.totalSpendingBillionEur)}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-xs text-muted-foreground">
									{overview.period}
								</p>
								<p className="text-xs text-muted-foreground">
									soit {formatPct(overview.spendingGdpPct)} du PIB
								</p>
								<p className="text-xs font-medium text-muted-foreground">
									{formatPerHab(overview.totalSpendingBillionEur)}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>Prélèvements obligatoires</CardDescription>
								<CardTitle className="font-mono text-2xl tracking-tight">
									{formatMd(compulsoryLevies.totalBillionEur)}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-xs text-muted-foreground">
									{compulsoryLevies.period}
								</p>
								<p className="text-xs text-muted-foreground">
									soit {formatPct(compulsoryLevies.gdpPct)} du PIB
								</p>
								<p className="text-xs font-medium text-muted-foreground">
									{formatPerHab(compulsoryLevies.totalBillionEur)}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>Déficit public</CardDescription>
								<CardTitle className="font-mono text-2xl tracking-tight text-destructive">
									-{formatMd(currentBalance.deficitBillionEur)}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-xs text-muted-foreground">
									{context.deficitPeriod}
								</p>
								<p className="text-xs text-muted-foreground">
									soit {formatPct(currentBalance.deficitGdpPct)} du PIB,{" "}
									{context.deficitTarget}
								</p>
								<p className="text-xs font-medium text-muted-foreground">
									{formatPerHab(currentBalance.deficitBillionEur)}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardDescription>Dette publique</CardDescription>
								<CardTitle className="font-mono text-2xl tracking-tight text-destructive">
									{formatMd(context.publicDebtBillionEur)}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-xs text-muted-foreground">{debt.period}</p>
								<p className="text-xs text-muted-foreground">
									soit {formatPct(context.debtGdpPct)} du PIB ({debt.euRank})
								</p>
								<p className="text-xs font-medium text-muted-foreground">
									{formatPerHab(context.publicDebtBillionEur)}
								</p>
							</CardContent>
						</Card>
					</div>
					<SourceNote
						sources={[sources.stateBudget, sources.accounts2025, sources.debt]}
					/>
				</section>

				<nav
					aria-label="Sommaire"
					className="sticky top-0 z-10 -mx-4 -my-6 overflow-x-auto border-b border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
				>
					<ul className="flex gap-4 whitespace-nowrap text-sm text-muted-foreground">
						{TABLE_OF_CONTENTS.map((entry) => (
							<li key={entry.id}>
								<a href={`#${entry.id}`} className="hover:text-foreground">
									{entry.label}
								</a>
							</li>
						))}
					</ul>
				</nav>

				{/* Pour 1 000€ de dépenses publiques */}
				<section id="breakdown" className="scroll-mt-16 space-y-6">
					<ThousandEuroBreakdown
						items={spendingByFunction.items}
						baseBillionEur={spendingByFunction.baseBillionEur}
					/>
				</section>

				{/* Ce que financent les dépenses publiques */}
				<section id="services" className="scroll-mt-16 space-y-6">
					<CitizenReturn services={citizenReturn.services} />
				</section>

				{/* Vue globale */}
				<section id="who-spends" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Qui gère les dépenses publiques ?
						</h2>
						<p className="text-sm text-muted-foreground">
							La section précédente montrait <strong>à quoi</strong> sert
							l&apos;argent public (retraites, santé, éducation...). Ici, on
							regarde <strong>qui</strong> le dépense : les{" "}
							{formatCount(spendingData.length)} catégories
							d&apos;administrations publiques (APU). Les chiffres diffèrent car
							une même fonction (ex : l&apos;éducation) est financée par
							plusieurs administrations à la fois.
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
						<PublicSpendingChart data={spendingData} />
						<Card>
							<CardHeader>
								<CardTitle>
									<h3>Qui dépense quoi ?</h3>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{spendingData.map((item) => (
									<div key={item.category} className="space-y-1">
										<div className="flex justify-between">
											<span className="font-medium">{item.category}</span>
											<span className="font-mono">
												{formatMd(item.spendingBillionEur)}
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

				{/* Onglets : État, Sécurité sociale, collectivités */}
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
						<Tabs defaultValue="state" className="w-full">
							<TabsList>
								<TabsTrigger value="state">Budget de l&apos;État</TabsTrigger>
								<TabsTrigger value="social-security">
									Sécurité sociale
								</TabsTrigger>
								<TabsTrigger value="local-authorities">
									Collectivités
								</TabsTrigger>
							</TabsList>

							{/* Budget de l'État */}
							<TabsContent value="state" keepMounted className="space-y-6 pt-4">
								<Card className="bg-muted/30">
									<CardContent>
										<p className="text-sm">
											{stateBudget.description}. Les chiffres ci-dessous portent
											sur le budget de l&apos;État stricto sensu (
											{formatMd(stateBudget.spendingBillionEur)}), qui est une
											composante des{" "}
											{formatMd(stateCategory.spendingBillionEur)} de dépenses
											des administrations centrales.
										</p>
									</CardContent>
								</Card>

								<div className="grid gap-4 sm:grid-cols-3">
									<Card>
										<CardHeader>
											<CardDescription>Recettes nettes</CardDescription>
											<CardTitle className="font-mono text-xl">
												{formatMd(stateBudget.netRevenueBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Dépenses</CardDescription>
											<CardTitle className="font-mono text-xl">
												{formatMd(stateBudget.spendingBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Déficit État</CardDescription>
											<CardTitle className="font-mono text-xl text-destructive">
												-{formatMd(stateBudget.deficitBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
								</div>
								<p className="text-xs text-muted-foreground">
									{stateBudget.note}
								</p>

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
										<TopMissionsChart data={stateBudget.mainMissions} />
										<p className="text-xs text-muted-foreground">
											{stateBudget.pensionsNote}
										</p>
									</div>
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-semibold">
												Principaux impôts d&apos;État
											</h3>
											<p className="text-sm text-muted-foreground">
												Ce que garde l&apos;État : montants nets des
												remboursements et dégrèvements
											</p>
										</div>
										<Card>
											<CardContent className="space-y-3">
												{stateBudget.taxRevenue.mainTaxes.map((impot) => (
													<div
														key={impot.label}
														className="space-y-1 border-b border-border pb-3 last:border-0"
													>
														<div className="flex justify-between items-baseline">
															<span className="font-medium">{impot.label}</span>
															<span className="font-mono text-sm">
																{formatMd(impot.amountBillionEur)}
															</span>
														</div>
														<p className="text-xs text-muted-foreground">
															{impot.description}
														</p>
														<p className="text-xs text-primary">
															Qui paye : {impot.whoPays}
														</p>
													</div>
												))}
											</CardContent>
										</Card>
									</div>
								</div>
								<SourceNote
									sources={[
										sources.loiDeFinances2026,
										sources.stateBudget,
										sources.revenueEstimates2026,
									]}
								/>
							</TabsContent>

							{/* Sécurité sociale */}
							<TabsContent
								value="social-security"
								keepMounted
								className="space-y-6 pt-4"
							>
								<Card className="bg-muted/30">
									<CardContent>
										<p className="text-sm">{socialSecurity.description}</p>
									</CardContent>
								</Card>

								<div className="grid gap-4 sm:grid-cols-3">
									<Card>
										<CardHeader>
											<CardDescription>Recettes</CardDescription>
											<CardTitle className="font-mono text-xl">
												{formatMd(socialSecurity.revenueBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Dépenses</CardDescription>
											<CardTitle className="font-mono text-xl">
												{formatMd(socialSecurity.spendingBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Déficit Sécu</CardDescription>
											<CardTitle className="font-mono text-xl text-destructive">
												-{formatMd(socialSecurity.deficitBillionEur)}
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
												Les {formatCount(socialSecurityBranches.length)}{" "}
												branches de la Sécurité sociale
											</p>
										</div>
										<SocialSecurityBranchesChart
											data={socialSecurityBranches}
										/>
										<p className="text-xs text-muted-foreground">
											Chaque branche est comptée sur son propre périmètre
											(l&apos;assurance maladie par l&apos;ONDAM, la vieillesse
											tous régimes de base) : leur somme,{" "}
											{formatMd(branchesTotal)}, ne se compare pas aux{" "}
											{formatMd(socialSecurity.spendingBillionEur)} de dépenses
											ci-dessus.
										</p>
									</div>
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-semibold">
												Financement de la Sécu
											</h3>
											<p className="text-sm text-muted-foreground">
												{socialSecurity.funding.description}
											</p>
										</div>
										<Card>
											<CardContent className="space-y-3">
												{socialSecurity.funding.sources.map((source) => (
													<div
														key={source.source}
														className="space-y-1 border-b border-border pb-3 last:border-0"
													>
														<div className="flex justify-between items-baseline">
															<span className="font-medium">
																{source.source}
															</span>
															<span className="font-mono text-sm">
																{formatMd(source.amountBillionEur)}
															</span>
														</div>
														<p className="text-xs text-muted-foreground">
															{source.description}
														</p>
														<p className="text-xs text-primary">
															Qui paye : {source.whoPays}
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
										<CardTitle>
											<h3>Cotisations et prélèvements sociaux</h3>
										</CardTitle>
										<CardDescription>
											{socialSecurity.cotisationRates.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid gap-6 md:grid-cols-2">
											<div>
												<h4 className="font-medium mb-3">
													Part salariale (
													{formatPct(
														rateBelowPass(
															employeeCotisations,
															financeData.simulator,
														),
													)}
													)
												</h4>
												<div className="space-y-2 text-sm">
													{socialSecurity.cotisationRates.employee.map((c) => (
														<div key={c.key} className="flex justify-between">
															<span className="text-muted-foreground">
																{c.label}
															</span>
															<span className="font-mono">
																{formatPct(c.ratePct)}
															</span>
														</div>
													))}
												</div>
											</div>
											<div>
												<h4 className="font-medium mb-3">
													Part patronale (
													{formatPct(
														rateBelowPass(
															employerCotisations,
															financeData.simulator,
														),
													)}
													)
												</h4>
												<div className="space-y-2 text-sm">
													{socialSecurity.cotisationRates.employer.map((c) => (
														<div key={c.key} className="flex justify-between">
															<span className="text-muted-foreground">
																{c.label}
															</span>
															<span className="font-mono">
																{formatPct(c.ratePct)}
															</span>
														</div>
													))}
												</div>
											</div>
										</div>
										<p className="mt-4 text-sm text-muted-foreground">
											Total :{" "}
											{formatPct(
												rateBelowPass(
													employeeCotisations,
													financeData.simulator,
												) +
													rateBelowPass(
														employerCotisations,
														financeData.simulator,
													),
											)}{" "}
											du salaire brut. {socialSecurity.cotisationRates.note}
										</p>
									</CardContent>
								</Card>
								<SourceNote sources={[sources.socialSecurity]} />
							</TabsContent>

							{/* Collectivités locales */}
							<TabsContent
								value="local-authorities"
								keepMounted
								className="space-y-6 pt-4"
							>
								<Card className="bg-muted/30">
									<CardContent>
										<p className="text-sm">{localAuthorities.description}</p>
									</CardContent>
								</Card>

								<div className="grid gap-4 sm:grid-cols-4">
									<Card>
										<CardHeader>
											<CardDescription>
												Recettes de fonctionnement
											</CardDescription>
											<CardTitle className="font-mono text-lg">
												{formatMd(localAuthorities.operatingRevenueBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>
												Dépenses de fonctionnement
											</CardDescription>
											<CardTitle className="font-mono text-lg">
												{formatMd(localAuthorities.operatingSpendingBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Investissement</CardDescription>
											<CardTitle className="font-mono text-lg">
												{formatMd(localAuthorities.investmentBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardDescription>Déficit</CardDescription>
											<CardTitle className="font-mono text-lg text-destructive">
												-{formatMd(localAuthorities.deficitBillionEur)}
											</CardTitle>
										</CardHeader>
									</Card>
								</div>

								<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
									<Card>
										<CardHeader>
											<CardTitle>
												<h3>Types de collectivités</h3>
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											{localAuthorities.types.map((type) => (
												<div
													key={type.type}
													className="space-y-1 border-b border-border pb-3 last:border-0"
												>
													<div className="flex justify-between items-baseline">
														<span className="font-medium">{type.type}</span>
														<span className="text-sm text-muted-foreground">
															{formatNumber(type.count, 0)} entités
														</span>
													</div>
													<div className="flex justify-between items-baseline">
														<span className="text-xs text-muted-foreground">
															Dépenses
														</span>
														<span className="font-mono text-sm">
															{formatMd(type.spendingBillionEur)}
														</span>
													</div>
													<p className="text-xs text-muted-foreground">
														{type.responsibilities}
													</p>
												</div>
											))}
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>
												<h3>Sources de financement</h3>
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											{localAuthorities.revenue.map((r) => (
												<div
													key={r.source}
													className="space-y-1 border-b border-border pb-3 last:border-0"
												>
													<div className="flex justify-between items-baseline">
														<span className="font-medium">{r.source}</span>
														<span className="font-mono text-sm">
															{formatMd(r.amountBillionEur)}
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
								<SourceNote sources={[sources.localAuthorities]} />
							</TabsContent>
						</Tabs>
					</div>
				</section>

				{/* Prélèvements obligatoires */}
				<section id="levies" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Prélèvements obligatoires
						</h2>
						<p className="text-sm text-muted-foreground">
							{compulsoryLevies.description}. Total :{" "}
							{formatMd(compulsoryLevies.totalBillionEur)} (
							{formatPct(compulsoryLevies.gdpPct)} du PIB)
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
						<LeviesChart data={levies} />
						<EuropeanComparison
							description="Taux de prélèvements obligatoires (% du PIB)"
							countries={compulsoryLevies.europeanComparison.countries}
							note={compulsoryLevies.europeanComparison.note}
							highlightClassName="bg-primary"
						/>
					</div>
				</section>

				{/* Diagramme de flux */}
				<section id="flow" className="scroll-mt-16 space-y-6">
					<FlowDiagram data={flowData} />
				</section>

				{/* Dette publique */}
				<section id="debt" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Évolution de la dette publique
						</h2>
						<p className="text-sm text-muted-foreground">
							La dette publique atteint {formatMd(debt.amountBillionEur)} soit{" "}
							{formatPct(debt.gdpPct)} du PIB. La charge des intérêts représente{" "}
							{formatMd(debt.interestBillionEur)}/an. Le graphique retrace la
							dette au sens de Maastricht depuis {debtHistory[0]?.year} (en % du
							PIB, montants en Md€ au survol).
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
						<DebtEvolutionChart data={debtHistory} />
						<EuropeanComparison
							description="Dette publique (% du PIB)"
							countries={debt.europeanComparison.countries}
							note={debt.europeanComparison.note}
							highlightClassName="bg-destructive"
						/>
					</div>
					<SourceNote sources={[sources.debtLongSeries, sources.debt]} />
				</section>

				{/* Évolution historique */}
				<section id="history" className="scroll-mt-16 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">
							Évolution des finances publiques
						</h2>
						<p className="text-sm text-muted-foreground">
							Recettes et dépenses des administrations publiques en % du PIB
							depuis {evolutionHistory[0]?.year} (comptes nationaux
							INSEE/Eurostat)
						</p>
					</div>
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>
									<h3>Recettes vs Dépenses</h3>
								</CardTitle>
								<CardDescription>
									L&apos;écart entre les deux courbes représente le déficit
								</CardDescription>
							</CardHeader>
							<CardContent>
								<EvolutionChart
									data={evolutionHistory}
									lastSurplus={lastSurplus}
								/>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>
									<h3>Solde public (% du PIB)</h3>
								</CardTitle>
								<CardDescription>
									La limite européenne est de{" "}
									{formatPct(context.euDeficitLimitPct)} de déficit ; dernier
									excédent : {lastSurplus}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<DeficitChart
									data={evolutionHistory}
									limitPct={context.euDeficitLimitPct}
								/>
							</CardContent>
						</Card>
					</div>
					<SourceNote
						sources={[
							{ label: evolutionData.source, url: evolutionData.sourceUrl },
						]}
					/>
				</section>

				{/* Simulateur */}
				<section id="simulator" className="scroll-mt-16 space-y-6">
					<SalarySimulator
						employee={employeeCotisations}
						employer={employerCotisations}
						simulator={financeData.simulator}
					/>
					<SourceNote sources={financeData.simulator.sources} />
				</section>

				{/* Pédagogie */}
				<section id="explainer" className="scroll-mt-16 space-y-6">
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
								<CardTitle>
									<h3>Questions fréquentes</h3>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{explainer.faq.map((qa) => (
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
											{fillPlaceholders(qa.question, placeholderValues)}
										</summary>
										<p className="mt-2 text-sm text-muted-foreground">
											{fillPlaceholders(qa.answer, placeholderValues)}
										</p>
									</details>
								))}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>
									<h3>Glossaire</h3>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="space-y-3">
									{explainer.glossary.map((item) => (
										<div key={item.term}>
											<dt className="font-mono text-sm font-semibold text-primary">
												{item.term}
											</dt>
											<dd className="text-sm text-muted-foreground">
												{fillPlaceholders(item.definition, placeholderValues)}
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
							<LinkCard
								key={key}
								href={requireHttpsUrl(source.url)}
								external
								padding="sm"
								className="pr-10 text-sm"
							>
								<span className="font-medium">{source.label}</span>
								<span className="mt-1 block text-xs text-muted-foreground">
									{new URL(source.url).hostname}
								</span>
							</LinkCard>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
