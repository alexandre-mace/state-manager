// Calcul du simulateur de salaire : salarié du privé non-cadre, célibataire sans enfant,
// entreprise de 50 salariés ou plus. Tous les paramètres viennent des données
// (socialSecurity.cotisationRates et simulator), aucun taux n'est écrit ici.

export type Assiette =
	| "total"
	| "tranche1"
	| "tranche2"
	| "tranches12"
	| "unemploymentCeiling"
	| "csg";

// Ce que finance une cotisation, pour la ventilation « où vont les cotisations »
export type Destination =
	| "pension"
	| "health"
	| "unemployment"
	| "family"
	| "other"
	| "csg";

export interface Cotisation {
	key: string;
	label: string;
	ratePct: number;
	assiette: Assiette;
	destination: Destination;
	// CET : due seulement quand le salaire dépasse le PASS, mais alors sur tout T1 + T2
	onlyAbovePass?: boolean;
	// CSG non déductible et CRDS restent dans le revenu imposable
	nonDeductible?: boolean;
}

export type Bracket = { limitEur: number | null; ratePct: number };

export interface SimulatorParameters {
	annualPassEur: number;
	passCeilings: { tranches12: number; unemployment: number };
	csg: { basePct: number; allowanceCeilingPass: number };
	rgdu: {
		annualSmicEur: number;
		tmin: number;
		tdelta: number;
		exponent: number;
		smicThreshold: number;
	};
	professionalExpensesAllowancePct: number;
	incomeTaxScale: { description: string; brackets: Bracket[] };
	decote: { flatAmountEur: number; ratePct: number };
}

export interface Simulation {
	gross: number;
	employeeCotisations: number;
	employerCotisationsBeforeRelief: number;
	relief: number;
	employerCotisations: number;
	netBeforeIncomeTax: number;
	taxableIncome: number;
	incomeTax: number;
	netAfterIncomeTax: number;
	employerCost: number;
	// Salariales et patronales par destination, avant allègement
	byDestination: Record<Destination, number>;
}

export function assiette(
	gross: number,
	type: Assiette,
	p: SimulatorParameters,
): number {
	const pass = p.annualPassEur;
	switch (type) {
		case "total":
			return gross;
		case "tranche1":
			return Math.min(gross, pass);
		case "tranche2":
			return Math.min(
				Math.max(gross - pass, 0),
				(p.passCeilings.tranches12 - 1) * pass,
			);
		case "tranches12":
			return Math.min(gross, p.passCeilings.tranches12 * pass);
		case "unemploymentCeiling":
			return Math.min(gross, p.passCeilings.unemployment * pass);
		case "csg": {
			// Abattement pour frais professionnels (assiette à basePct du brut), limité à
			// allowanceCeilingPass PASS
			const ceiling = p.csg.allowanceCeilingPass * pass;
			return (
				Math.min(gross, ceiling) * (p.csg.basePct / 100) +
				Math.max(gross - ceiling, 0)
			);
		}
	}
}

function amount(gross: number, c: Cotisation, p: SimulatorParameters): number {
	if (c.onlyAbovePass && gross <= p.annualPassEur) return 0;
	return assiette(gross, c.assiette, p) * (c.ratePct / 100);
}

// Réduction générale dégressive unique (art. D. 241-7 CSS) : coefficient arrondi à
// 4 décimales, nul à partir de smicThreshold SMIC, plafonné à Tmin + Tdelta
export function rgduCoefficient(gross: number, p: SimulatorParameters): number {
	const { annualSmicEur: smic, tmin, tdelta, exponent, smicThreshold } = p.rgdu;
	if (gross >= smicThreshold * smic) return 0;
	const rawCoefficient =
		tmin + tdelta * (0.5 * ((smicThreshold * smic) / gross - 1)) ** exponent;
	return Math.round(Math.min(rawCoefficient, tmin + tdelta) * 10_000) / 10_000;
}

export function computeIncomeTax(
	taxableIncome: number,
	p: SimulatorParameters,
): number {
	let tax = 0;
	let previous = 0;
	for (const bracket of p.incomeTaxScale.brackets) {
		const limit = bracket.limitEur ?? Number.POSITIVE_INFINITY;
		const part = Math.min(taxableIncome, limit) - previous;
		if (part <= 0) break;
		tax += part * (bracket.ratePct / 100);
		previous = limit;
	}
	const decote = Math.max(
		p.decote.flatAmountEur - tax * (p.decote.ratePct / 100),
		0,
	);
	return Math.max(tax - decote, 0);
}

export function simulate(
	gross: number,
	employee: Cotisation[],
	employer: Cotisation[],
	p: SimulatorParameters,
): Simulation {
	const byDestination: Record<Destination, number> = {
		pension: 0,
		health: 0,
		unemployment: 0,
		family: 0,
		other: 0,
		csg: 0,
	};
	let employeeCotisations = 0;
	let nonDeductibleAmount = 0;
	for (const c of employee) {
		const m = amount(gross, c, p);
		employeeCotisations += m;
		byDestination[c.destination] += m;
		if (c.nonDeductible) nonDeductibleAmount += m;
	}
	let employerCotisationsBeforeRelief = 0;
	for (const c of employer) {
		const m = amount(gross, c, p);
		employerCotisationsBeforeRelief += m;
		byDestination[c.destination] += m;
	}

	const relief = Math.min(
		rgduCoefficient(gross, p) * gross,
		employerCotisationsBeforeRelief,
	);
	const employerCotisations = employerCotisationsBeforeRelief - relief;
	const netBeforeIncomeTax = gross - employeeCotisations;
	// Net imposable = net + CSG non déductible et CRDS, puis abattement pour frais professionnels
	const taxableIncome =
		(netBeforeIncomeTax + nonDeductibleAmount) *
		(1 - p.professionalExpensesAllowancePct / 100);
	const incomeTax = computeIncomeTax(taxableIncome, p);

	return {
		gross,
		employeeCotisations,
		employerCotisationsBeforeRelief,
		relief,
		employerCotisations,
		netBeforeIncomeTax,
		taxableIncome,
		incomeTax,
		netAfterIncomeTax: netBeforeIncomeTax - incomeTax,
		employerCost: gross + employerCotisations,
		byDestination,
	};
}

// Taux cumulé d'une liste de cotisations pour un salaire sous le PASS, rapporté au brut :
// la CSG et la CRDS ne portent que sur basePct du brut (tableau de la page)
export function rateBelowPass(
	cotisations: Cotisation[],
	p: SimulatorParameters,
): number {
	return cotisations
		.filter((c) => c.assiette !== "tranche2" && !c.onlyAbovePass)
		.reduce(
			(total, c) =>
				total + c.ratePct * (c.assiette === "csg" ? p.csg.basePct / 100 : 1),
			0,
		);
}

// Bornes et position de départ du curseur : des constantes d'interface, pas des paramètres
// réglementaires. Le salaire de départ sert aussi d'exemple à la FAQ.
export const SALARY_RANGE = {
	min: 15_000,
	max: 150_000,
	step: 1_000,
	initial: 35_000,
};
