import type { PublicFinances2026 } from "./data/public-finances-2026";
import type { PublicFinanceYear } from "./data/public-finances-history";
import { formatEur, formatMd, formatNumber, formatPct } from "./format";
import { findOrThrow } from "./guards";
import { rateBelowPass, SALARY_RANGE, simulate } from "./simulator";

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

// Déficit de l'année : une ligne des séries longues, où le solde est négatif
export function yearBalance(years: PublicFinanceYear[], year: number) {
	const row = findOrThrow(years, (y) => y.year === year, `Année ${year}`);
	return {
		year,
		revenueBillionEur: row.revenueBillionEur,
		deficitBillionEur: -row.balanceBillionEur,
		deficitGdpPct: -row.balanceGdpPct,
	};
}

export function explainerValues(
	data: PublicFinances2026,
	years: PublicFinanceYear[],
): PlaceholderValues {
	const current = yearBalance(years, data.year);
	const previous = yearBalance(years, data.year - 1);
	const p = data.simulator;
	const employee = data.socialSecurity.cotisationRates.employee;
	const employer = data.socialSecurity.cotisationRates.employer;
	const reference = simulate(SALARY_RANGE.initial, employee, employer, p);
	const totalLevies = data.compulsoryLevies.totalBillionEur;
	const healthBranch = findOrThrow(
		data.socialSecurity.branches,
		(b) => b.branch === "Maladie",
		"Maladie",
	);
	return {
		year: String(data.year),
		previousYear: String(previous.year),
		previousDeficit: formatMd(previous.deficitBillionEur),
		previousDeficitPct: formatPct(previous.deficitGdpPct),
		deficit: formatMd(current.deficitBillionEur),
		deficitPct: formatPct(current.deficitGdpPct),
		totalSpending: formatMd(data.overview.totalSpendingBillionEur),
		spendingGdpPct: formatPct(data.overview.spendingGdpPct),
		euSpendingGdpPct: formatPct(data.overview.euAverageSpending.gdpPct),
		euSpendingYear: String(data.overview.euAverageSpending.year),
		totalLevies: formatMd(totalLevies),
		totalRevenue: formatMd(current.revenueBillionEur),
		otherRevenue: formatMd(current.revenueBillionEur - totalLevies),
		ondam: formatMd(healthBranch.spendingBillionEur),
		employeeRate: formatNumber(rateBelowPass(employee, p), 0),
		csgCrdsRate: formatNumber(
			rateBelowPass(
				employee.filter((c) => c.destination === "csg"),
				p,
			),
		),
		employerRateBeforeRelief: formatNumber(rateBelowPass(employer, p), 0),
		employerRateAfterRelief: formatNumber(
			(reference.employerCotisations / reference.gross) * 100,
			0,
		),
		referenceSalary: formatEur(SALARY_RANGE.initial),
	};
}
