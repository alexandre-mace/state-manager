// Finances publiques françaises de l'année en cours : tout ce qu'affiche la page hors séries
// longues. Chiffres mis à jour le 30/10/2026 (champ lastUpdate), saisis à la main depuis :
// - loi n° 2026-103 de finances pour 2026 (Légifrance) et dossier du projet de loi
//   (budget.gouv.fr) : budget de l'État, missions ;
// - Évaluation des voies et moyens, tome I, annexe au projet de loi de finances 2026 : recettes
//   fiscales nettes de l'État (IR, IS, TVA, ex-TICPE nette État, ligne 1501) ;
// - loi de financement de la Sécurité sociale 2026 (securite-sociale.fr) : branches, financement ;
// - Cour des comptes, finances publiques locales 2025 : collectivités ;
// - INSEE, dette trimestrielle (T2 2026, Informations rapides du 29/09/2026), comptes des
//   administrations publiques 2025 (mars 2026) et série longue de la dette ;
// - Eurostat 2024 et fin 2025 : comparaisons européennes ; dépenses publiques moyennes de l'UE
//   en 2025, communiqué du 21/10/2026 (notification d'octobre) ;
// - FIPECO/INSEE, COFOG 2024 : ventilation pour 1 000 € ;
// - textes réglementaires 2026 du simulateur, listés dans simulator.sources.
// Les liens de chaque source sont dans sources et simulator.sources ; les pièges de périmètre
// dans AGENTS.md.

import type { Cotisation, SimulatorParameters } from "../simulator";

export type Source = { label: string; url: string };

// Une liste de pays comparés, la France repérée par son code ISO « FR »
export type EuropeanComparison = {
	note: string;
	countries: { code: string; label: string; pct: number }[];
};

export interface PublicFinances2026 {
	year: number;
	// Date de la dernière mise à jour des chiffres, au format AAAA-MM-JJ
	lastUpdate: string;
	context: {
		publicDebtBillionEur: number;
		debtGdpPct: number;
		deficitPeriod: string;
		deficitTarget: string;
		// Limite du traité de Maastricht, en % du PIB
		euDeficitLimitPct: number;
		population: number;
		note: string;
	};
	sources: Record<
		| "loiDeFinances2026"
		| "stateBudget"
		| "revenueEstimates2026"
		| "socialSecurity"
		| "localAuthorities"
		| "debt"
		| "accounts2025"
		| "eurostatDeficitDebt"
		| "debtLongSeries",
		Source
	>;
	overview: {
		description: string;
		totalSpendingBillionEur: number;
		spendingGdpPct: number;
		period: string;
		// Moyenne de l'UE à 27, dépenses des administrations publiques en % du PIB (Eurostat)
		euAverageSpending: { gdpPct: number; year: number };
		breakdown: {
			category: string;
			sharePct: number;
			spendingBillionEur: number;
			description: string;
		}[];
	};
	stateBudget: {
		description: string;
		note: string;
		pensionsNote: string;
		netRevenueBillionEur: number;
		spendingBillionEur: number;
		deficitBillionEur: number;
		taxRevenue: {
			grossTotalBillionEur: number;
			netTotalBillionEur: number;
			// Montants nets des remboursements et dégrèvements, ce que garde l'État
			mainTaxes: {
				code: string;
				label: string;
				amountBillionEur: number;
				description: string;
				whoPays: string;
			}[];
		};
		mainMissions: {
			mission: string;
			ministry: string;
			// Crédits de paiement votés, y compris la contribution au CAS Pensions
			amountBillionEur: number;
			description: string;
			pensionsBillionEur: number;
		}[];
	};
	socialSecurity: {
		description: string;
		note: string;
		revenueBillionEur: number;
		spendingBillionEur: number;
		deficitBillionEur: number;
		// Chaque branche sur son propre périmètre : leur somme ne boucle pas avec spendingBillionEur
		branches: {
			branch: string;
			spendingBillionEur: number;
			description: string;
			change?: string;
		}[];
		funding: {
			description: string;
			sources: {
				source: string;
				amountBillionEur: number;
				description: string;
				whoPays: string;
			}[];
		};
		cotisationRates: {
			description: string;
			employee: Cotisation[];
			employer: Cotisation[];
			note: string;
		};
	};
	localAuthorities: {
		description: string;
		operatingRevenueBillionEur: number;
		operatingSpendingBillionEur: number;
		investmentBillionEur: number;
		deficitBillionEur: number;
		dgfBillionEur: number;
		types: {
			type: string;
			count: number;
			spendingBillionEur: number;
			responsibilities: string;
		}[];
		revenue: {
			source: string;
			amountBillionEur: number;
			description: string;
			note?: string;
		}[];
	};
	compulsoryLevies: {
		description: string;
		totalBillionEur: number;
		gdpPct: number;
		period: string;
		breakdown: {
			type: string;
			amountBillionEur: number;
			shareOfTotalPct: number;
			description: string;
		}[];
		europeanComparison: EuropeanComparison;
	};
	debt: {
		amountBillionEur: number;
		gdpPct: number;
		period: string;
		euRank: string;
		history: {
			year: number;
			amountBillionEur: number;
			gdpPct: number;
			note?: string;
		}[];
		interestBillionEur: number;
		europeanComparison: EuropeanComparison;
	};
	spendingByFunction: {
		description: string;
		baseBillionEur: number;
		source: string;
		// Pour 1 000 € de dépenses publiques
		items: {
			label: string;
			amountEur: number;
			icon: string;
			description: string;
		}[];
	};
	citizenReturn: {
		description: string;
		services: {
			service: string;
			value: string;
			detail: string;
			icon: string;
		}[];
	};
	// Textes à marques {nom}, remplies par lib/explainer.ts
	explainer: {
		faq: { question: string; answer: string }[];
		glossary: { term: string; definition: string }[];
	};
	simulator: SimulatorParameters & {
		benchmarks: {
			averagePension: string;
			healthReimbursement: string;
			unemploymentDuration: string;
		};
		sources: Source[];
	};
}

export const publicFinances2026: PublicFinances2026 = {
	year: 2026,
	lastUpdate: "2026-10-30",
	context: {
		publicDebtBillionEur: 3595.5,
		debtGdpPct: 119.0,
		deficitPeriod: "2026, objectif de la loi de finances",
		deficitTarget: "objectif sous 3 % en 2029",
		euDeficitLimitPct: 3,
		population: 69100000,
		note: "La loi de finances 2026 a été promulguée le 19 février 2026 (adoption via 49.3, motions de censure rejetées), après la loi spéciale du 23 décembre 2025. La LFSS 2026 a été promulguée le 30 décembre 2025 (suspension de la réforme des retraites de 2023, gel des pensions en 2026). Déficit public {previousYear} constaté par l'INSEE : {previousDeficit}, soit {previousDeficitPct} du PIB.",
	},
	sources: {
		loiDeFinances2026: {
			label:
				"Loi n° 2026-103 de finances pour 2026, crédits par mission (Légifrance)",
			url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053509625",
		},
		stateBudget: {
			label: "Dossier du projet de loi de finances 2026 (budget.gouv.fr)",
			url: "https://www.budget.gouv.fr/reperes/loi-finances/dossiers/plf_2026",
		},
		revenueEstimates2026: {
			label:
				"Évaluation des voies et moyens, tome I, annexe au projet de loi de finances 2026 (Assemblée nationale)",
			url: "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf",
		},
		socialSecurity: {
			label: "Loi de financement de la Sécurité sociale (securite-sociale.fr)",
			url: "https://www.securite-sociale.fr/la-secu-en-detail/loi-de-financement/annee-en-cours",
		},
		localAuthorities: {
			label: "Finances publiques locales 2025 (Cour des comptes)",
			url: "https://www.ccomptes.fr/fr/publications/les-finances-publiques-locales-2025-fascicule-1",
		},
		debt: {
			label: "Dette trimestrielle des administrations publiques (INSEE)",
			url: "https://www.insee.fr/fr/statistiques/9053525",
		},
		accounts2025: {
			label: "Comptes des administrations publiques 2025 (INSEE)",
			url: "https://www.insee.fr/fr/statistiques/8956575",
		},
		eurostatDeficitDebt: {
			label:
				"Déficit et dette publics 2025, notification d'octobre 2026 (Eurostat)",
			url: "https://ec.europa.eu/eurostat/en/web/products-euro-indicators/w/2-21102026-ap",
		},
		debtLongSeries: {
			label: "Série longue de la dette publique (INSEE)",
			url: "https://www.insee.fr/fr/statistiques/8988843",
		},
	},
	overview: {
		description:
			"Les finances publiques françaises sont gérées par les administrations publiques (APU)",
		totalSpendingBillionEur: 1722,
		spendingGdpPct: 57.2,
		period: "2026, prévision de la loi de finances",
		euAverageSpending: { gdpPct: 49.4, year: 2025 },
		breakdown: [
			{
				category: "Sécurité sociale",
				sharePct: 39,
				spendingBillionEur: 677,
				description: "Santé, retraites, famille, chômage",
			},
			{
				category: "État",
				sharePct: 34,
				spendingBillionEur: 585,
				description: "Défense, éducation, justice, sécurité",
			},
			{
				category: "Collectivités locales",
				sharePct: 17,
				spendingBillionEur: 298,
				description: "Régions, départements, communes, intercommunalités",
			},
			{
				category: "Autres organismes publics",
				sharePct: 10,
				spendingBillionEur: 162,
				description:
					"Universités, hôpitaux publics, agences, caisses de retraite complémentaire (ODAC)",
			},
		],
	},
	stateBudget: {
		description:
			"Le budget de l'État finance les missions régaliennes et les politiques publiques nationales",
		note: "Chiffres de la loi de finances 2026 (promulguée le 19 février 2026) : recettes et charges nettes du budget général, après prélèvements sur recettes au profit des collectivités et de l'UE. Solde général y compris comptes spéciaux : -134,6 Md€.",
		pensionsNote:
			"Les crédits votés de chaque mission comprennent la contribution du ministère au CAS Pensions, le compte qui paie les retraites des fonctionnaires de l'État, retraités actuels compris. Son taux est passé de 74,28 % du traitement indiciaire brut en 2024 à 82,28 % en 2026 : cette hausse grossit les crédits des ministères sans moyens nouveaux pour leurs services. Ces pensions figurent aussi dans la branche Vieillesse de la Sécurité sociale, il ne faut donc pas additionner les deux. Montants votés en loi de finances 2026 ; part retraites tirée des projets annuels de performance du projet de loi.",
		netRevenueBillionEur: 325.4,
		spendingBillionEur: 458.9,
		deficitBillionEur: 133.5,
		taxRevenue: {
			grossTotalBillionEur: 513.8,
			netTotalBillionEur: 363.6,
			mainTaxes: [
				{
					code: "TVA",
					label: "Taxe sur la valeur ajoutée",
					amountBillionEur: 109.1,
					description:
						"Impôt indirect sur la consommation (taux normal 20 %, réduits 10 %, 5,5 % et 2,1 %) ; la Sécurité sociale et les collectivités en reçoivent d'autres parts, hors de ce montant",
					whoPays: "Consommateurs (via les entreprises)",
				},
				{
					code: "IR",
					label: "Impôt sur le revenu",
					amountBillionEur: 104,
					description:
						"Impôt progressif sur les revenus des ménages (barème de 0 % à 45 %, indexé sur l'inflation en 2026)",
					whoPays: "Ménages (environ 44 % des foyers fiscaux)",
				},
				{
					code: "IS",
					label: "Impôt sur les sociétés",
					amountBillionEur: 59,
					description:
						"Impôt sur les bénéfices des entreprises (taux normal 25 %, surtaxe grandes entreprises prorogée à taux réduits en 2026)",
					whoPays: "Entreprises",
				},
				{
					code: "TICPE",
					label: "Accise sur les produits énergétiques (ex-TICPE)",
					amountBillionEur: 15.3,
					description:
						"Taxe sur les carburants et combustibles ; part de l'État, après les fractions versées aux collectivités, à l'AFITF et aux charges de service public de l'électricité",
					whoPays: "Consommateurs de carburants",
				},
				{
					code: "DMTG",
					label: "Droits de mutation à titre gratuit",
					amountBillionEur: 16,
					description: "Droits de succession et donations",
					whoPays: "Héritiers et donataires",
				},
			],
		},
		mainMissions: [
			{
				mission: "Enseignement scolaire",
				ministry: "Éducation nationale",
				amountBillionEur: 89.6,
				description: "Écoles, collèges, lycées publics et privés",
				pensionsBillionEur: 25.2,
			},
			{
				mission: "Défense",
				ministry: "Armées",
				amountBillionEur: 66.5,
				description:
					"Forces armées, équipements (+6,7 Md€ hors pensions vs 2025 au projet de loi, conformément à la LPM accélérée)",
				pensionsBillionEur: 9.6,
			},
			{
				mission: "Engagements financiers de l'État",
				ministry: "Économie et Finances",
				amountBillionEur: 60.3,
				description:
					"Charge de la dette (intérêts) : {debtInterest}, en forte hausse",
				pensionsBillionEur: 0,
			},
			{
				mission: "Recherche et enseignement supérieur",
				ministry: "Enseignement supérieur",
				amountBillionEur: 31.6,
				description:
					"Universités, recherche publique (les universités paient les pensions de leurs fonctionnaires sur leurs subventions : cette part n'est pas isolée ici)",
				pensionsBillionEur: 0.2,
			},
			{
				mission: "Solidarité, insertion et égalité des chances",
				ministry: "Solidarités",
				amountBillionEur: 31.3,
				description: "AAH, RSA, aide sociale",
				pensionsBillionEur: 0,
			},
			{
				mission: "Sécurités",
				ministry: "Intérieur",
				amountBillionEur: 25.8,
				description: "Police nationale, gendarmerie, sécurité civile",
				pensionsBillionEur: 8.3,
			},
			{
				mission: "Écologie et mobilités",
				ministry: "Transition écologique",
				amountBillionEur: 22.8,
				description: "Transports, environnement, énergie",
				pensionsBillionEur: 1.0,
			},
			{
				mission: "Travail et emploi",
				ministry: "Travail",
				amountBillionEur: 20.8,
				description: "France Travail, formation professionnelle, apprentissage",
				pensionsBillionEur: 0.3,
			},
			{
				mission: "Justice",
				ministry: "Justice",
				amountBillionEur: 13,
				description: "Tribunaux, prisons, aide juridictionnelle",
				pensionsBillionEur: 2.4,
			},
			{
				mission: "Culture",
				ministry: "Culture",
				amountBillionEur: 3.7,
				description: "Patrimoine, création, médias",
				pensionsBillionEur: 0.2,
			},
		],
	},
	socialSecurity: {
		description:
			"La Sécurité sociale couvre les risques sociaux : maladie, vieillesse, famille, accidents du travail et autonomie",
		note: "LFSS 2026 promulguée le 30 décembre 2025. Mesures majeures : suspension de la réforme des retraites de 2023 et gel des pensions en 2026. Déficit 2025 constaté : 21,6 Md€.",
		revenueBillionEur: 664.8,
		spendingBillionEur: 684.2,
		deficitBillionEur: 19.4,
		branches: [
			{
				branch: "Maladie",
				spendingBillionEur: 274.4,
				description: "ONDAM : hôpitaux, médecine de ville, médicaments",
				change: "+3,1 % vs 2025",
			},
			{
				branch: "Vieillesse",
				spendingBillionEur: 310,
				description:
					"Pensions de retraite, tous régimes de base (CNAV, MSA, fonctionnaires de l'État, régimes spéciaux)",
			},
			{
				branch: "Famille",
				spendingBillionEur: 59.7,
				description: "Allocations familiales, garde d'enfants",
			},
			{
				branch: "Accidents du travail",
				spendingBillionEur: 17,
				description: "Indemnisation des accidents et maladies professionnelles",
			},
			{
				branch: "Autonomie",
				spendingBillionEur: 43.6,
				description: "Dépendance, APA, aide aux personnes âgées/handicapées",
			},
		],
		funding: {
			description:
				"La Sécu est financée par les cotisations sociales et la CSG",
			sources: [
				{
					source: "Cotisations sociales",
					amountBillionEur: 420,
					description: "Part salariale + part patronale sur les salaires",
					whoPays: "Employeurs et salariés",
				},
				{
					source: "CSG",
					amountBillionEur: 157,
					description:
						"Contribution sociale généralisée ({csgRate} sur les revenus d'activité)",
					whoPays: "Tous les revenus (travail, capital, remplacement)",
				},
				{
					source: "Impôts et taxes affectés",
					amountBillionEur: 82,
					description: "TVA sociale, taxes tabac/alcool, etc.",
					whoPays: "Consommateurs",
				},
			],
		},
		cotisationRates: {
			description:
				"Taux 2026 sur le salaire brut d'un salarié non-cadre, entreprise de 50 salariés ou plus. La CSG et la CRDS portent sur 98,25 % du brut, d'où un total salarial un peu inférieur à la somme des taux. Les totaux portent sur un salaire sous le plafond de la Sécurité sociale (PASS, 48 060 € par an)",
			employee: [
				{
					key: "cappedOldAgeEmployee",
					label: "Assurance vieillesse plafonnée (jusqu'au PASS)",
					ratePct: 6.9,
					assiette: "tranche1",
					destination: "pension",
				},
				{
					key: "uncappedOldAgeEmployee",
					label: "Assurance vieillesse déplafonnée",
					ratePct: 0.4,
					assiette: "total",
					destination: "pension",
				},
				{
					key: "agircArrcoT1Employee",
					label: "Retraite complémentaire AGIRC-ARRCO, tranche 1",
					ratePct: 3.15,
					assiette: "tranche1",
					destination: "pension",
				},
				{
					key: "cegT1Employee",
					label: "Contribution d'équilibre général (CEG), tranche 1",
					ratePct: 0.86,
					assiette: "tranche1",
					destination: "pension",
				},
				{
					key: "agircArrcoT2Employee",
					label:
						"Retraite complémentaire AGIRC-ARRCO, tranche 2 (de 1 à 8 PASS)",
					ratePct: 8.64,
					assiette: "tranche2",
					destination: "pension",
				},
				{
					key: "cegT2Employee",
					label: "CEG, tranche 2",
					ratePct: 1.08,
					assiette: "tranche2",
					destination: "pension",
				},
				{
					key: "cetEmployee",
					label: "Contribution d'équilibre technique (au-delà du PASS)",
					ratePct: 0.14,
					assiette: "tranches12",
					destination: "pension",
					onlyAbovePass: true,
				},
				{
					key: "csgDeductible",
					label: "CSG déductible",
					ratePct: 6.8,
					assiette: "csg",
					destination: "csg",
				},
				{
					key: "csgNonDeductible",
					label: "CSG non déductible",
					ratePct: 2.4,
					assiette: "csg",
					destination: "csg",
					nonDeductible: true,
				},
				{
					key: "crds",
					label: "CRDS",
					ratePct: 0.5,
					assiette: "csg",
					destination: "csg",
					nonDeductible: true,
				},
			],
			employer: [
				{
					key: "healthEmployer",
					label: "Assurance maladie",
					ratePct: 13,
					assiette: "total",
					destination: "health",
				},
				{
					key: "cappedOldAgeEmployer",
					label: "Assurance vieillesse plafonnée (jusqu'au PASS)",
					ratePct: 8.55,
					assiette: "tranche1",
					destination: "pension",
				},
				{
					key: "uncappedOldAgeEmployer",
					label: "Assurance vieillesse déplafonnée",
					ratePct: 2.11,
					assiette: "total",
					destination: "pension",
				},
				{
					key: "familyEmployer",
					label: "Allocations familiales",
					ratePct: 5.25,
					assiette: "total",
					destination: "family",
				},
				{
					key: "workAccidentEmployer",
					label: "Accidents du travail (taux moyen national)",
					ratePct: 2.08,
					assiette: "total",
					destination: "other",
				},
				{
					key: "unemploymentEmployer",
					label: "Assurance chômage (jusqu'à 4 PASS)",
					ratePct: 4,
					assiette: "unemploymentCeiling",
					destination: "unemployment",
				},
				{
					key: "agsEmployer",
					label: "Garantie des salaires (AGS)",
					ratePct: 0.25,
					assiette: "unemploymentCeiling",
					destination: "unemployment",
				},
				{
					key: "agircArrcoT1Employer",
					label: "Retraite complémentaire AGIRC-ARRCO, tranche 1",
					ratePct: 4.72,
					assiette: "tranche1",
					destination: "pension",
				},
				{
					key: "cegT1Employer",
					label: "CEG, tranche 1",
					ratePct: 1.29,
					assiette: "tranche1",
					destination: "pension",
				},
				{
					key: "agircArrcoT2Employer",
					label:
						"Retraite complémentaire AGIRC-ARRCO, tranche 2 (de 1 à 8 PASS)",
					ratePct: 12.95,
					assiette: "tranche2",
					destination: "pension",
				},
				{
					key: "cegT2Employer",
					label: "CEG, tranche 2",
					ratePct: 1.62,
					assiette: "tranche2",
					destination: "pension",
				},
				{
					key: "cetEmployer",
					label: "Contribution d'équilibre technique (au-delà du PASS)",
					ratePct: 0.21,
					assiette: "tranches12",
					destination: "pension",
					onlyAbovePass: true,
				},
				{
					key: "fnalEmployer",
					label: "Aide au logement (FNAL, 50 salariés ou plus)",
					ratePct: 0.5,
					assiette: "total",
					destination: "other",
				},
				{
					key: "csaEmployer",
					label: "Contribution solidarité autonomie",
					ratePct: 0.3,
					assiette: "total",
					destination: "other",
				},
			],
			note: "Avant allègement : l'allègement général (réduction générale dégressive unique) efface jusqu'à 40,21 points de cotisations patronales au SMIC et s'éteint à 3 SMIC. Hors mutuelle, prévoyance, formation professionnelle et taxe d'apprentissage.",
		},
	},
	localAuthorities: {
		description:
			"Les collectivités territoriales gèrent les services publics locaux",
		operatingRevenueBillionEur: 260,
		operatingSpendingBillionEur: 225,
		investmentBillionEur: 75,
		deficitBillionEur: 11.4,
		dgfBillionEur: 27.4,
		types: [
			{
				type: "Communes",
				count: 34945,
				spendingBillionEur: 105,
				responsibilities:
					"Urbanisme, écoles primaires, voirie communale, état civil",
			},
			{
				type: "Intercommunalités (EPCI)",
				count: 1254,
				spendingBillionEur: 65,
				responsibilities: "Transports, déchets, eau, développement économique",
			},
			{
				type: "Départements",
				count: 101,
				spendingBillionEur: 85,
				responsibilities:
					"RSA, APA, collèges, routes départementales, protection de l'enfance",
			},
			{
				type: "Régions",
				count: 18,
				spendingBillionEur: 43,
				responsibilities:
					"Lycées, TER, formation professionnelle, développement économique",
			},
		],
		revenue: [
			{
				source: "Impôts locaux",
				amountBillionEur: 90,
				description: "Taxe foncière, CFE, CVAE",
				note: "La taxe d'habitation sur les résidences principales a été progressivement supprimée entre 2018 et 2023",
			},
			{
				source: "Dotations de l'État",
				amountBillionEur: 55,
				description: "DGF et autres concours",
			},
			{
				source: "Fiscalité transférée",
				amountBillionEur: 60,
				description: "Part de TVA, DMTO (droits de mutation)",
			},
			{
				source: "Autres recettes",
				amountBillionEur: 55,
				description: "Redevances, subventions, emprunts",
			},
		],
	},
	compulsoryLevies: {
		description:
			"Ensemble des impôts et cotisations prélevés par les administrations publiques (estimation 2026 ; taux 2025 constaté par l'INSEE : {leviesGdpPct} du PIB)",
		totalBillionEur: 1312,
		gdpPct: 43.6,
		period: "Montant estimé pour 2026, taux 2025 constaté par l'INSEE",
		breakdown: [
			{
				type: "Cotisations sociales",
				amountBillionEur: 420,
				shareOfTotalPct: 32,
				description: "Cotisations salariales et patronales",
			},
			{
				type: "TVA",
				amountBillionEur: 210,
				shareOfTotalPct: 16,
				description: "Taxe sur la valeur ajoutée",
			},
			{
				type: "CSG-CRDS",
				amountBillionEur: 166,
				shareOfTotalPct: 12.7,
				description: "Prélèvements sociaux sur tous les revenus",
			},
			{
				type: "Impôt sur le revenu",
				amountBillionEur: 104,
				shareOfTotalPct: 7.9,
				description: "IR des ménages",
			},
			{
				type: "Impôt sur les sociétés",
				amountBillionEur: 59,
				shareOfTotalPct: 4.5,
				description: "IS des entreprises",
			},
			{
				type: "Taxes locales",
				amountBillionEur: 90,
				shareOfTotalPct: 6.9,
				description: "Taxe foncière, CFE, etc.",
			},
			{
				type: "Autres taxes",
				amountBillionEur: 263,
				shareOfTotalPct: 20,
				description:
					"TICPE, droits de succession, taxes sur les assurances, taxes diverses",
			},
		],
		europeanComparison: {
			note: "Données Eurostat 2024 (définition plus large que celle de l'INSEE, qui mesure {leviesGdpPct} du PIB pour la France en 2025). La France reste le 2e pays de l'UE derrière le Danemark.",
			countries: [
				{
					code: "DK",
					label: "Danemark",
					pct: 45.8,
				},
				{
					code: "FR",
					label: "France",
					pct: 45.3,
				},
				{
					code: "DE",
					label: "Allemagne",
					pct: 40.9,
				},
				{
					code: "IT",
					label: "Italie",
					pct: 42.5,
				},
				{
					code: "ES",
					label: "Espagne",
					pct: 37,
				},
				{
					code: "EU",
					label: "Moyenne UE",
					pct: 40.4,
				},
			],
		},
	},
	debt: {
		amountBillionEur: 3595.5,
		gdpPct: 119.0,
		period: "Fin du 2e trimestre 2026 (INSEE)",
		euRank: "3e de l'UE fin 2025",
		history: [
			{
				year: 1978,
				amountBillionEur: 74.5,
				gdpPct: 21.6,
				note: "Début de la série INSEE",
			},
			{
				year: 1979,
				amountBillionEur: 85.1,
				gdpPct: 21.6,
			},
			{
				year: 1980,
				amountBillionEur: 95.3,
				gdpPct: 21.3,
			},
			{
				year: 1981,
				amountBillionEur: 114.3,
				gdpPct: 22.6,
			},
			{
				year: 1982,
				amountBillionEur: 151.8,
				gdpPct: 26.2,
			},
			{
				year: 1983,
				amountBillionEur: 178.3,
				gdpPct: 27.7,
			},
			{
				year: 1984,
				amountBillionEur: 211.2,
				gdpPct: 30.2,
			},
			{
				year: 1985,
				amountBillionEur: 238.8,
				gdpPct: 31.9,
			},
			{
				year: 1986,
				amountBillionEur: 261.7,
				gdpPct: 32.4,
			},
			{
				year: 1987,
				amountBillionEur: 295,
				gdpPct: 34.8,
			},
			{
				year: 1988,
				amountBillionEur: 318.2,
				gdpPct: 34.7,
			},
			{
				year: 1989,
				amountBillionEur: 351.3,
				gdpPct: 35.5,
			},
			{
				year: 1990,
				amountBillionEur: 384.1,
				gdpPct: 36.8,
			},
			{
				year: 1991,
				amountBillionEur: 409,
				gdpPct: 37.8,
			},
			{
				year: 1992,
				amountBillionEur: 467.7,
				gdpPct: 41.7,
			},
			{
				year: 1993,
				amountBillionEur: 546.5,
				gdpPct: 48.2,
				note: "Récession",
			},
			{
				year: 1994,
				amountBillionEur: 605,
				gdpPct: 51.6,
			},
			{
				year: 1995,
				amountBillionEur: 701.6,
				gdpPct: 57.8,
			},
			{
				year: 1996,
				amountBillionEur: 755.6,
				gdpPct: 60.6,
			},
			{
				year: 1997,
				amountBillionEur: 799.4,
				gdpPct: 62,
			},
			{
				year: 1998,
				amountBillionEur: 836.1,
				gdpPct: 62.1,
			},
			{
				year: 1999,
				amountBillionEur: 856.9,
				gdpPct: 61.4,
			},
			{
				year: 2000,
				amountBillionEur: 880,
				gdpPct: 59.7,
			},
			{
				year: 2001,
				amountBillionEur: 907.7,
				gdpPct: 59.3,
			},
			{
				year: 2002,
				amountBillionEur: 966.8,
				gdpPct: 61.3,
			},
			{
				year: 2003,
				amountBillionEur: 1060.4,
				gdpPct: 65.4,
			},
			{
				year: 2004,
				amountBillionEur: 1134.3,
				gdpPct: 66.9,
			},
			{
				year: 2005,
				amountBillionEur: 1201.5,
				gdpPct: 68.2,
			},
			{
				year: 2006,
				amountBillionEur: 1207.3,
				gdpPct: 65.4,
			},
			{
				year: 2007,
				amountBillionEur: 1268.9,
				gdpPct: 65.5,
			},
			{
				year: 2008,
				amountBillionEur: 1389.4,
				gdpPct: 69.8,
			},
			{
				year: 2009,
				amountBillionEur: 1627.2,
				gdpPct: 84.1,
				note: "Crise financière",
			},
			{
				year: 2010,
				amountBillionEur: 1722.2,
				gdpPct: 86.3,
			},
			{
				year: 2011,
				amountBillionEur: 1830.1,
				gdpPct: 88.7,
			},
			{
				year: 2012,
				amountBillionEur: 1915.8,
				gdpPct: 91.7,
			},
			{
				year: 2013,
				amountBillionEur: 2005,
				gdpPct: 94.6,
			},
			{
				year: 2014,
				amountBillionEur: 2071.1,
				gdpPct: 96.2,
			},
			{
				year: 2015,
				amountBillionEur: 2134.9,
				gdpPct: 97,
			},
			{
				year: 2016,
				amountBillionEur: 2190.5,
				gdpPct: 98.2,
			},
			{
				year: 2017,
				amountBillionEur: 2263.3,
				gdpPct: 98.8,
			},
			{
				year: 2018,
				amountBillionEur: 2320.7,
				gdpPct: 98.5,
			},
			{
				year: 2019,
				amountBillionEur: 2387.4,
				gdpPct: 98.2,
			},
			{
				year: 2020,
				amountBillionEur: 2663.9,
				gdpPct: 114.9,
				note: "COVID-19",
			},
			{
				year: 2021,
				amountBillionEur: 2828.8,
				gdpPct: 112.8,
			},
			{
				year: 2022,
				amountBillionEur: 2955.6,
				gdpPct: 111.4,
			},
			{
				year: 2023,
				amountBillionEur: 3103.2,
				gdpPct: 109.5,
			},
			{
				year: 2024,
				amountBillionEur: 3306.1,
				gdpPct: 112.6,
			},
			{
				year: 2025,
				amountBillionEur: 3460.5,
				gdpPct: 115.6,
				note: "Fin 2025",
			},
			{
				year: 2026,
				amountBillionEur: 3595.5,
				gdpPct: 119.0,
				note: "T2 2026",
			},
		],
		interestBillionEur: 59.3,
		europeanComparison: {
			note: "France = 3e pays le plus endetté de l'UE (données Eurostat fin 2025)",
			countries: [
				{
					code: "FR",
					label: "France",
					pct: 115.6,
				},
				{
					code: "DE",
					label: "Allemagne",
					pct: 63.5,
				},
				{
					code: "IT",
					label: "Italie",
					pct: 137.1,
				},
				{
					code: "ES",
					label: "Espagne",
					pct: 100.7,
				},
				{
					code: "GR",
					label: "Grèce",
					pct: 146.1,
				},
				{
					code: "EU",
					label: "Moyenne UE",
					pct: 81.7,
				},
			],
		},
	},
	spendingByFunction: {
		description:
			"Ventilation fonctionnelle (classification COFOG) de chaque tranche de 1 000 € dépensés par les administrations publiques",
		baseBillionEur: 1722,
		source:
			"proportions de la classification fonctionnelle COFOG 2024 (FIPECO, INSEE)",
		items: [
			{
				label: "Retraites",
				amountEur: 260,
				icon: "Clock",
				description: "Pensions, réversion, minimum vieillesse",
			},
			{
				label: "Santé",
				amountEur: 207,
				icon: "Heart",
				description: "Hôpitaux, médecine de ville, médicaments",
			},
			{
				label: "Enseignement & recherche",
				amountEur: 101,
				icon: "GraduationCap",
				description: "Primaire, secondaire, supérieur, recherche publique",
			},
			{
				label: "Affaires économiques",
				amountEur: 99,
				icon: "Briefcase",
				description: "Transports, aides aux entreprises, énergie, agriculture",
			},
			{
				label: "Administration générale",
				amountEur: 62,
				icon: "Building2",
				description: "Fonctionnement des administrations centrales et locales",
			},
			{
				label: "Solidarité & chômage",
				amountEur: 51,
				icon: "HandHelping",
				description: "Minima sociaux, RSA, indemnisation chômage, insertion",
			},
			{
				label: "Famille",
				amountEur: 40,
				icon: "Baby",
				description: "Allocations familiales, garde d'enfants",
			},
			{
				label: "Logement",
				amountEur: 38,
				icon: "Home",
				description: "Équipements collectifs, APL, aménagement du territoire",
			},
			{
				label: "Charge de la dette",
				amountEur: 35,
				icon: "TrendingDown",
				description:
					"Intérêts sur la dette publique (poste en forte hausse depuis 2024)",
			},
			{
				label: "Défense",
				amountEur: 32,
				icon: "Shield",
				description: "Forces armées, équipements militaires",
			},
			{
				label: "Sécurité & justice",
				amountEur: 31,
				icon: "Scale",
				description: "Police, gendarmerie, tribunaux, prisons",
			},
			{
				label: "Culture & loisirs",
				amountEur: 26,
				icon: "Palette",
				description: "Patrimoine, création, médias, sports",
			},
			{
				label: "Environnement",
				amountEur: 18,
				icon: "Leaf",
				description: "Gestion des déchets, eau, biodiversité, pollution",
			},
		],
	},
	citizenReturn: {
		description:
			"Les services et prestations concrets dont bénéficient les citoyens",
		services: [
			{
				service: "Éducation",
				value: "~8 500 €/élève/an",
				detail: "De la maternelle au lycée, gratuit",
				icon: "GraduationCap",
			},
			{
				service: "Santé",
				value: "~4 000 €/personne/an",
				detail: "Consultations, hospitalisations, médicaments",
				icon: "Heart",
			},
			{
				service: "Retraite",
				value: "~1 550 €/mois net moyen",
				detail: "17,2M de retraités",
				icon: "Clock",
			},
			{
				service: "Routes",
				value: "1,1M km",
				detail: "Réseau routier public entretenu",
				icon: "Map",
			},
			{
				service: "Sécurité",
				value: "250 000 policiers/gendarmes",
				detail: "+ pompiers, sécurité civile",
				icon: "Shield",
			},
			{
				service: "Justice",
				value: "9 000 magistrats",
				detail: "Tribunaux, aide juridictionnelle",
				icon: "Scale",
			},
			{
				service: "Famille",
				value: "~2 800 €/an/enfant moyen",
				detail: "Allocations familiales, aides garde (branche famille CNAF)",
				icon: "Users",
			},
			{
				service: "Chômage",
				value: "~1 200 €/mois moyen",
				detail: "Indemnisation des demandeurs d'emploi",
				icon: "Briefcase",
			},
		],
	},
	explainer: {
		faq: [
			{
				question:
					"Quelle est la différence entre impôt et cotisation sociale ?",
				answer:
					"L'impôt finance les dépenses générales de l'État (éducation, défense, justice) sans contrepartie directe. Les cotisations sociales financent la protection sociale (santé, retraite, chômage) et ouvrent des droits pour celui qui cotise.",
			},
			{
				question: "Pourquoi y a-t-il un déficit ?",
				answer:
					"Le déficit apparaît quand les dépenses dépassent les recettes. En {previousYear}, le déficit public constaté a atteint {previousDeficit} ({previousDeficitPct} du PIB) ; la loi de finances {year} vise {deficit} ({deficitPct} du PIB). Causes principales : vieillissement (retraites, santé), crise COVID (2020-2022), choix politiques (baisses d'impôts, dépenses nouvelles).",
			},
			{
				question: "Qui paye vraiment les impôts en France ?",
				answer:
					"Les ménages paient l'impôt sur le revenu, la CSG, la TVA et les cotisations salariales ; les entreprises, l'impôt sur les sociétés, les cotisations patronales et des taxes sur la production. Mais in fine, tout est payé par les citoyens (consommateurs, salariés, actionnaires).",
			},
			{
				question: "Comment fonctionne le financement de la Sécu ?",
				answer:
					"Sur un salaire brut de 100 € sous le plafond de la Sécurité sociale, environ {employeeRate} € sont prélevés au salarié, dont {csgCrdsRate} € de CSG et de CRDS, et {employerRateBeforeRelief} € à l'employeur avant l'allègement général. L'allègement diminue la part patronale d'autant plus que le salaire est bas : pour {referenceSalary} brut par an, elle tombe à {employerRateAfterRelief} €, et presque à zéro au SMIC. La CSG porte aussi sur les revenus du capital et de remplacement. Ces sommes financent santé, retraite, famille, chômage.",
			},
			{
				question: "Pourquoi les cotisations patronales sont si élevées ?",
				answer:
					"Les cotisations patronales (environ {employerRateBeforeRelief} % du brut avant l'allègement général, {employerRateAfterRelief} % après pour un salaire de {referenceSalary} par an) financent principalement la retraite, l'assurance maladie et le chômage. C'est un choix historique français de faire porter une grande part du financement social sur l'emploi plutôt que sur l'impôt.",
			},
			{
				question:
					"Pourquoi les dépenses ({totalSpending}) sont très supérieures aux prélèvements ({totalLevies}) ?",
				answer:
					"Les prélèvements obligatoires (impôts + cotisations) ne sont pas la seule source de revenus des administrations. Il y a aussi les recettes non fiscales : redevances, dividendes d'entreprises publiques, ventes de services, transferts européens, etc. (environ {otherRevenue}). Les recettes totales sont donc d'environ {totalRevenue}. Le déficit (environ {deficit}) est la différence entre ces recettes totales et les dépenses.",
			},
			{
				question:
					"Pourquoi la France dépense-t-elle plus que ses voisins européens ?",
				answer:
					"La France consacre {spendingGdpPct} de son PIB aux dépenses publiques, contre {euSpendingGdpPct} en moyenne dans l'UE en {euSpendingYear} (Eurostat). L'écart vient principalement de la protection sociale : retraites généreuses (départ plus tôt, taux de remplacement élevé), système de santé très couvrant, prestations familiales étendues, et minima sociaux (RSA, APL). Ce modèle social est un choix collectif qui se traduit par des prélèvements plus élevés mais aussi par des services et prestations plus larges.",
			},
			{
				question: "Que s'est-il passé avec le budget 2026 ?",
				answer:
					"Faute d'accord au Parlement fin 2025, une loi spéciale a été votée le 23 décembre 2025 pour permettre à l'État de continuer à fonctionner. Le débat a repris en janvier 2026 : le gouvernement Lecornu a engagé sa responsabilité (article 49.3), les motions de censure ont été rejetées (fin janvier et début février), et la loi de finances 2026 a été promulguée le 19 février 2026. En contrepartie du soutien d'une partie de l'opposition, la réforme des retraites de 2023 a été suspendue et le barème de l'impôt sur le revenu indexé sur l'inflation.",
			},
		],
		glossary: [
			{
				term: "PIB",
				definition:
					"Produit intérieur brut : valeur totale de la production de biens et services en France en un an, à laquelle se rapportent les dépenses, le déficit et la dette exprimés en pourcentage du PIB",
			},
			{
				term: "PLF",
				definition:
					"Projet de Loi de Finances : budget annuel de l'État, voté au Parlement",
			},
			{
				term: "PLFSS",
				definition: "Projet de Loi de Financement de la Sécurité sociale",
			},
			{
				term: "DGF",
				definition:
					"Dotation Globale de Fonctionnement : principale dotation de l'État aux collectivités",
			},
			{
				term: "ONDAM",
				definition:
					"Objectif National de Dépenses d'Assurance Maladie : plafond des dépenses de santé ({ondam} en {year})",
			},
			{
				term: "CSG",
				definition:
					"Contribution Sociale Généralisée : impôt sur tous les revenus finançant la Sécu",
			},
			{
				term: "CRDS",
				definition:
					"Contribution au remboursement de la dette sociale ({crdsRate})",
			},
			{
				term: "APU",
				definition:
					"Administrations Publiques : État + Sécu + Collectivités locales",
			},
			{
				term: "49.3",
				definition:
					"Article de la Constitution permettant au gouvernement de faire adopter un texte sans vote, sauf motion de censure. Utilisé pour le budget 2026",
			},
		],
	},
	simulator: {
		annualPassEur: 48060,
		passCeilings: {
			tranches12: 8,
			unemployment: 4,
		},
		csg: {
			basePct: 98.25,
			allowanceCeilingPass: 4,
		},
		rgdu: {
			annualSmicEur: 21876.4,
			tmin: 0.02,
			tdelta: 0.3821,
			exponent: 1.75,
			smicThreshold: 3,
		},
		professionalExpensesAllowancePct: 10,
		incomeTaxScale: {
			description: "barème 2026 sur les revenus 2025",
			brackets: [
				{
					limitEur: 11600,
					ratePct: 0,
				},
				{
					limitEur: 29579,
					ratePct: 11,
				},
				{
					limitEur: 84577,
					ratePct: 30,
				},
				{
					limitEur: 181917,
					ratePct: 41,
				},
				{
					limitEur: null,
					ratePct: 45,
				},
			],
		},
		decote: {
			flatAmountEur: 897,
			ratePct: 45.25,
		},
		benchmarks: {
			averagePension: "~1 550 €/mois net",
			healthReimbursement: "~77 %",
			unemploymentDuration: "~24 mois",
		},
		sources: [
			{
				label:
					"Taux de cotisations vieillesse 2026, décret n° 2025-1446 (Légifrance)",
				url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053276542",
			},
			{
				label:
					"Taux AGIRC-ARRCO et PASS 2026, circulaire 2025-16 (AGIRC-ARRCO)",
				url: "https://www.agirc-arrco.fr/storage/CirculaireAgircArrco2025-16sg-drj.pdf",
			},
			{
				label:
					"Suppression des taux réduits maladie et allocations familiales en 2026 (service-public.fr)",
				url: "https://entreprendre.service-public.gouv.fr/actualites/A18448",
			},
			{
				label:
					"Assiette de la CSG et de la CRDS sur les salaires (service-public.fr)",
				url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2971",
			},
			{
				label: "Réduction générale dégressive unique 2026 (service-public.fr)",
				url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24542",
			},
			{
				label: "Assurance chômage et AGS, paramètres avril 2026 (Unédic)",
				url: "https://unedic.org/storage/uploads/2026/05/27/unedic_parametres_utiles_avril2026_uid_6a17039e9f727.pdf",
			},
			{
				label: "Taux AT moyen 2026, arrêté du 30 décembre 2025 (Légifrance)",
				url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053228984",
			},
			{
				label:
					"Barème de l'impôt sur le revenu 2026, revenus 2025 (service-public.fr)",
				url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1419",
			},
			{
				label:
					"Décote de l'impôt sur le revenu 2026, revenus 2025 (Weblex, chiffres clés)",
				url: "https://www.weblex.fr/chiffres-cles/impot-sur-le-revenu-et-decote-2026",
			},
		],
	},
};
