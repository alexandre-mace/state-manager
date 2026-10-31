// Budget de l'État 2024 au projet de loi de finances : agrégats de recettes, principaux impôts et
// missions, en euros. Source : data.economie.gouv.fr, jeux « PLF 2024 recettes du budget
// général » et « PLF 2024 dépenses selon nomenclatures destination et nature » (liens dans
// sources). Historique : ne se périme pas, la page ne l'affiche plus.

export interface Budget2024 {
	year: number;
	sources: { revenues: string; expenditures: string };
	totals: { revenuesPlfEur: number; expendituresPlfEur: number };
	revenueAggregates: { type: string; amountEur: number }[];
	topTaxes: { code: string; label: string; amountEur: number }[];
	topMissions: { mission: string; ministry: string; amountEur: number }[];
}

export const budget2024: Budget2024 = {
	year: 2024,
	sources: {
		revenues:
			"https://data.economie.gouv.fr/explore/dataset/plf-2024-recettes-du-budget-general/information/",
		expenditures:
			"https://data.economie.gouv.fr/explore/dataset/plf-2024-depenses-2024-selon-nomenclatures-destination-et-nature/information/",
	},
	totals: {
		revenuesPlfEur: 574469391617,
		expendituresPlfEur: 812095043818,
	},
	revenueAggregates: [
		{
			type: "Recettes fiscales",
			amountEur: 485383817319,
		},
		{
			type: "Recettes non fiscales",
			amountEur: 22633486801,
		},
		{
			type: "Prélèvements sur les recettes de l'État au profit des collectivités territoriales",
			amountEur: 44842463483,
		},
		{
			type: "Prélèvement sur les recettes de l'État au profit de l'Union européenne",
			amountEur: 21609624014,
		},
	],
	topTaxes: [
		{
			code: "1601",
			label: "Taxe sur la valeur ajoutée",
			amountEur: 183857035556,
		},
		{
			code: "1101",
			label: "Impôt sur le revenu",
			amountEur: 117616000769,
		},
		{
			code: "1301",
			label: "Impôt sur les sociétés",
			amountEur: 91415375411,
		},
		{
			code: "1501",
			label: "Taxe intérieure de consommation sur les produits énergétiques",
			amountEur: 18422732922,
		},
		{
			code: "1706",
			label: "Mutations à titre gratuit par décès",
			amountEur: 15400000000,
		},
		{
			code: "1427",
			label: "Prélèvements de solidarité",
			amountEur: 15210000000,
		},
		{
			code: "1402",
			label:
				"Retenues à la source et prélèvements sur les revenus de capitaux mobiliers",
			amountEur: 4800000000,
		},
		{
			code: "1497",
			label: "Cotisation sur la valeur ajoutée des entreprises",
			amountEur: 4160000000,
		},
		{
			code: "1705",
			label: "Mutations à titre gratuit entre vifs (donations)",
			amountEur: 3936000000,
		},
		{
			code: "1799",
			label: "Autres taxes",
			amountEur: 3258000000,
		},
	],
	topMissions: [
		{
			mission: "Remboursements et dégrèvements",
			ministry: "Économie, finances et souveraineté industrielle et numérique",
			amountEur: 140250561424,
		},
		{
			mission: "Avances aux collectivités territoriales",
			ministry: "Économie, finances et souveraineté industrielle et numérique",
			amountEur: 132434502964,
		},
		{
			mission: "Enseignement scolaire",
			ministry: "Éducation nationale et jeunesse",
			amountEur: 86833850228,
		},
		{
			mission: "Pensions",
			ministry: "Économie, finances et souveraineté industrielle et numérique",
			amountEur: 67583738257,
		},
		{
			mission: "Engagements financiers de l'État",
			ministry: "Économie, finances et souveraineté industrielle et numérique",
			amountEur: 60818123694,
		},
		{
			mission: "Défense",
			ministry: "Armées",
			amountEur: 56778360430,
		},
		{
			mission: "Recherche et enseignement supérieur",
			ministry: "Enseignement supérieur et recherche",
			amountEur: 31819150903,
		},
		{
			mission: "Solidarité, insertion et égalité des chances",
			ministry: "Solidarités et des Familles",
			amountEur: 30845369866,
		},
		{
			mission: "Sécurités",
			ministry: "Intérieur et outre-mer",
			amountEur: 24169218938,
		},
		{
			mission: "Travail et emploi",
			ministry: "Travail, plein emploi et insertion",
			amountEur: 22560984550,
		},
		{
			mission: "Écologie, développement et mobilité durables",
			ministry: "Transition écologique et cohésion des territoires",
			amountEur: 21630866316,
		},
		{
			mission: "Cohésion des territoires",
			ministry: "Transition écologique et cohésion des territoires",
			amountEur: 19371932077,
		},
	],
};
