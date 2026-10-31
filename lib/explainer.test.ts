import { describe, expect, it } from "vitest";
import { publicFinances2026 as data } from "./data/public-finances-2026";
import { publicFinanceHistory as evolution } from "./data/public-finances-history";
import { explainerValues, fillPlaceholders, yearBalance } from "./explainer";

const values = explainerValues(data, evolution.years);

describe("marques des textes", () => {
	it("remplace chaque marque par sa valeur", () => {
		expect(fillPlaceholders("{a} et {b}", { a: "1", b: "2" })).toBe("1 et 2");
	});

	it("casse sur une marque sans valeur", () => {
		expect(() => fillPlaceholders("{inconnue}", {})).toThrow(
			"Valeur absente pour la marque {inconnue}",
		);
	});

	it("trouvent toutes une valeur, dans tous les textes des données", () => {
		const marks = JSON.stringify(data).match(/\{\w+\}/g) ?? [];
		expect(marks.length).toBeGreaterThan(0);
		for (const mark of marks) expect(values).toHaveProperty(mark.slice(1, -1));
	});
});

describe("valeurs de la FAQ", () => {
	it("distinguent la part patronale avant et après allègement", () => {
		// 42,05 points sous le PASS avant allègement, comme le tableau des cotisations
		expect(values.employerRateBeforeRelief).toBe("42");
		// À 35 000 €, coefficient de réduction générale 0,1099 : 42,05 − 10,99 points
		expect(values.employerRateAfterRelief).toBe("31");
	});

	it("bouclent recettes, prélèvements et déficit", () => {
		const current = yearBalance(evolution.years, data.year);
		expect(
			data.overview.totalSpendingBillionEur - current.revenueBillionEur,
		).toBeCloseTo(current.deficitBillionEur, 6);
	});
});
