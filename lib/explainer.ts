import type evolutionData from "../data/evolution-finances.json";
import type financeData from "../data/finances-publiques-2026.json";
import { formatEur, formatMd, formatNombre, formatPct } from "./format";
import { findOrThrow } from "./guards";
import {
	lireCotisations,
	SALARY_RANGE,
	simuler,
	tauxSousLePass,
} from "./simulateur";

// Les textes de la FAQ et du glossaire citent des totaux et des taux : ils les lisent dans les
// données par des marques {nom}, au lieu de recopier des chiffres qui dériveraient à la
// prochaine mise à jour.

export type PlaceholderValues = Record<string, string>;

const PLACEHOLDER = /\{(\w+)\}/g;

// Une marque sans valeur casse le build plutôt que d'afficher « {deficit} » sur la page
export function fillPlaceholders(
	text: string,
	values: PlaceholderValues,
): string {
	return text.replace(PLACEHOLDER, (_, name: string) => {
		const value = values[name];
		if (value === undefined)
			throw new Error(`Valeur absente pour la marque {${name}} : ${text}`);
		return value;
	});
}

type FinanceData = typeof financeData;
type EvolutionYear = (typeof evolutionData)["annees"][number];

// Déficit de l'année : une ligne des séries longues, où le solde est négatif
export function yearBalance(years: EvolutionYear[], year: number) {
	const row = findOrThrow(years, (y) => y.annee === year, `Année ${year}`);
	return {
		year,
		revenueBillionEur: row.recettes_milliards_eur,
		deficitBillionEur: -row.deficit_milliards_eur,
		deficitGdpPct: -row.deficit_pib_pct,
	};
}

export function explainerValues(
	data: FinanceData,
	years: EvolutionYear[],
): PlaceholderValues {
	const current = yearBalance(years, data.year);
	const previous = yearBalance(years, data.year - 1);
	const p = data.simulateur;
	const employee = lireCotisations(
		data.securiteSociale.tauxCotisations.salariales,
	);
	const employer = lireCotisations(
		data.securiteSociale.tauxCotisations.patronales,
	);
	const reference = simuler(SALARY_RANGE.initial, employee, employer, p);
	const totalLevies = data.prelevementsObligatoires.total_milliards_eur;
	const maladie = findOrThrow(
		data.securiteSociale.branches,
		(b) => b.branche === "Maladie",
		"Maladie",
	);
	return {
		year: String(data.year),
		previousYear: String(previous.year),
		previousDeficit: formatMd(previous.deficitBillionEur),
		previousDeficitPct: formatPct(previous.deficitGdpPct),
		deficit: formatMd(current.deficitBillionEur),
		deficitPct: formatPct(current.deficitGdpPct),
		totalSpending: formatMd(data.vueGlobale.depenses_totales_milliards_eur),
		spendingGdpPct: formatPct(data.vueGlobale.depenses_pib_pct),
		totalLevies: formatMd(totalLevies),
		totalRevenue: formatMd(current.revenueBillionEur),
		otherRevenue: formatMd(current.revenueBillionEur - totalLevies),
		ondam: formatMd(maladie.depenses_milliards_eur),
		employeeRate: formatNombre(tauxSousLePass(employee, p), 0),
		csgCrdsRate: formatNombre(
			tauxSousLePass(
				employee.filter((c) => c.poste === "csg"),
				p,
			),
		),
		employerRateBeforeRelief: formatNombre(tauxSousLePass(employer, p), 0),
		employerRateAfterRelief: formatNombre(
			(reference.cotisationsPatronales / reference.brut) * 100,
			0,
		),
		referenceSalary: formatEur(SALARY_RANGE.initial),
	};
}
