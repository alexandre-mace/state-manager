import { describe, expect, it } from "vitest";
import {
	barWidthPct,
	lastSurplusYear,
	perInhabitantEur,
	taxesAndDuties,
} from "./finances";

describe("calculs de la page", () => {
	it("ramène un agrégat en milliards à l'habitant", () => {
		expect(perInhabitantEur(150, 69_100_000)).toBeCloseTo(2_170.77, 2);
	});

	it("retire cotisations et CSG-CRDS des prélèvements obligatoires", () => {
		expect(
			taxesAndDuties({
				totalBillionEur: 1_312,
				cotisationsBillionEur: 420,
				csgCrdsBillionEur: 166,
			}),
		).toBe(726);
	});

	it("trouve le dernier excédent, ou rien", () => {
		const years = [
			{ annee: 1973, deficit_pib_pct: 0.4 },
			{ annee: 1974, deficit_pib_pct: 0.1 },
			{ annee: 1975, deficit_pib_pct: -2.5 },
		];
		expect(lastSurplusYear(years)).toBe(1974);
		expect(lastSurplusYear(years.slice(2))).toBeUndefined();
	});

	it("rapporte une barre à la plus grande", () => {
		expect(barWidthPct(50, [50, 100])).toBe(50);
		expect(barWidthPct(100, [50, 100])).toBe(100);
		expect(barWidthPct(0, [0])).toBe(0);
	});
});
