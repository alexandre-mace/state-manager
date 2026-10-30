// Calcul du simulateur de salaire : salarié du privé non-cadre, célibataire sans enfant,
// entreprise de 50 salariés ou plus. Tous les paramètres viennent du JSON
// (securiteSociale.tauxCotisations et simulateur), aucun taux n'est écrit ici.

export type Assiette =
	| "totale"
	| "tranche1"
	| "tranche2"
	| "tranches_1_2"
	| "plafond_chomage"
	| "csg";

export type Poste =
	| "retraite"
	| "sante"
	| "chomage"
	| "famille"
	| "autres"
	| "csg";

export interface Cotisation {
	cle: string;
	cotisation: string;
	taux_pct: number;
	assiette: Assiette;
	poste: Poste;
	// CET : due seulement quand le salaire dépasse le PASS, mais alors sur tout T1 + T2
	si_au_dela_pass?: boolean;
	// CSG non déductible et CRDS restent dans le revenu imposable
	non_deductible?: boolean;
}

export type Tranche = { limite_eur: number | null; taux_pct: number };

export interface ParametresSimulateur {
	pass_annuel_eur: number;
	plafonds_pass: { tranches_1_2: number; chomage: number };
	csg: { base_pct: number; plafond_abattement_pass: number };
	rgdu: {
		smic_annuel_eur: number;
		tmin: number;
		tdelta: number;
		puissance: number;
		seuil_smic: number;
	};
	abattement_frais_pro_pct: number;
	bareme_ir: { description: string; tranches: Tranche[] };
	decote: { forfait_eur: number; taux_pct: number };
}

export interface Simulation {
	brut: number;
	cotisationsSalariales: number;
	cotisationsPatronalesAvantAllegement: number;
	allegement: number;
	cotisationsPatronales: number;
	netAvantIR: number;
	revenuImposable: number;
	impot: number;
	netApresIR: number;
	coutEmployeur: number;
	// Salariales et patronales par poste, avant allègement
	parPoste: Record<Poste, number>;
}

export function assiette(
	brut: number,
	type: Assiette,
	p: ParametresSimulateur,
): number {
	const pass = p.pass_annuel_eur;
	switch (type) {
		case "totale":
			return brut;
		case "tranche1":
			return Math.min(brut, pass);
		case "tranche2":
			return Math.min(
				Math.max(brut - pass, 0),
				(p.plafonds_pass.tranches_1_2 - 1) * pass,
			);
		case "tranches_1_2":
			return Math.min(brut, p.plafonds_pass.tranches_1_2 * pass);
		case "plafond_chomage":
			return Math.min(brut, p.plafonds_pass.chomage * pass);
		case "csg": {
			// Abattement de 1,75 % pour frais professionnels, limité à 4 PASS
			const plafond = p.csg.plafond_abattement_pass * pass;
			return (
				Math.min(brut, plafond) * (p.csg.base_pct / 100) +
				Math.max(brut - plafond, 0)
			);
		}
	}
}

function montant(brut: number, c: Cotisation, p: ParametresSimulateur): number {
	if (c.si_au_dela_pass && brut <= p.pass_annuel_eur) return 0;
	return assiette(brut, c.assiette, p) * (c.taux_pct / 100);
}

// Réduction générale dégressive unique (art. D. 241-7 CSS) : coefficient arrondi à
// 4 décimales, nul à partir de 3 SMIC, plafonné à Tmin + Tdelta
export function coefficientRgdu(brut: number, p: ParametresSimulateur): number {
	const { smic_annuel_eur: smic, tmin, tdelta, puissance, seuil_smic } = p.rgdu;
	if (brut >= seuil_smic * smic) return 0;
	const brutCoefficient =
		tmin + tdelta * (0.5 * ((seuil_smic * smic) / brut - 1)) ** puissance;
	return Math.round(Math.min(brutCoefficient, tmin + tdelta) * 10_000) / 10_000;
}

export function impotSurLeRevenu(
	revenuImposable: number,
	p: ParametresSimulateur,
): number {
	let impot = 0;
	let precedent = 0;
	for (const tranche of p.bareme_ir.tranches) {
		const limite = tranche.limite_eur ?? Number.POSITIVE_INFINITY;
		const part = Math.min(revenuImposable, limite) - precedent;
		if (part <= 0) break;
		impot += part * (tranche.taux_pct / 100);
		precedent = limite;
	}
	const decote = Math.max(
		p.decote.forfait_eur - impot * (p.decote.taux_pct / 100),
		0,
	);
	return Math.max(impot - decote, 0);
}

export function simuler(
	brut: number,
	salariales: Cotisation[],
	patronales: Cotisation[],
	p: ParametresSimulateur,
): Simulation {
	const parPoste: Record<Poste, number> = {
		retraite: 0,
		sante: 0,
		chomage: 0,
		famille: 0,
		autres: 0,
		csg: 0,
	};
	let cotisationsSalariales = 0;
	let nonDeductibles = 0;
	for (const c of salariales) {
		const m = montant(brut, c, p);
		cotisationsSalariales += m;
		parPoste[c.poste] += m;
		if (c.non_deductible) nonDeductibles += m;
	}
	let cotisationsPatronalesAvantAllegement = 0;
	for (const c of patronales) {
		const m = montant(brut, c, p);
		cotisationsPatronalesAvantAllegement += m;
		parPoste[c.poste] += m;
	}

	const allegement = Math.min(
		coefficientRgdu(brut, p) * brut,
		cotisationsPatronalesAvantAllegement,
	);
	const cotisationsPatronales =
		cotisationsPatronalesAvantAllegement - allegement;
	const netAvantIR = brut - cotisationsSalariales;
	// Net imposable = net + CSG non déductible et CRDS, puis abattement pour frais professionnels
	const revenuImposable =
		(netAvantIR + nonDeductibles) * (1 - p.abattement_frais_pro_pct / 100);
	const impot = impotSurLeRevenu(revenuImposable, p);

	return {
		brut,
		cotisationsSalariales,
		cotisationsPatronalesAvantAllegement,
		allegement,
		cotisationsPatronales,
		netAvantIR,
		revenuImposable,
		impot,
		netApresIR: netAvantIR - impot,
		coutEmployeur: brut + cotisationsPatronales,
		parPoste,
	};
}

// Taux cumulé d'une liste de cotisations pour un salaire sous le PASS, rapporté au brut :
// la CSG et la CRDS ne portent que sur 98,25 % du brut (tableau de la page)
export function tauxSousLePass(
	cotisations: Cotisation[],
	p: ParametresSimulateur,
): number {
	return cotisations
		.filter((c) => c.assiette !== "tranche2" && !c.si_au_dela_pass)
		.reduce(
			(total, c) =>
				total + c.taux_pct * (c.assiette === "csg" ? p.csg.base_pct / 100 : 1),
			0,
		);
}

const ASSIETTES: Assiette[] = [
	"totale",
	"tranche1",
	"tranche2",
	"tranches_1_2",
	"plafond_chomage",
	"csg",
];
const POSTES: Poste[] = [
	"retraite",
	"sante",
	"chomage",
	"famille",
	"autres",
	"csg",
];

// Le JSON type assiette et poste en simple chaîne : une faute de frappe y casserait le
// calcul sans bruit, d'où la vérification au chargement
export function lireCotisations(
	lignes: { cle: string; assiette: string; poste: string }[],
): Cotisation[] {
	for (const l of lignes) {
		if (!ASSIETTES.includes(l.assiette as Assiette))
			throw new Error(`Assiette inconnue pour ${l.cle} : ${l.assiette}`);
		if (!POSTES.includes(l.poste as Poste))
			throw new Error(`Poste inconnu pour ${l.cle} : ${l.poste}`);
	}
	return lignes as Cotisation[];
}
