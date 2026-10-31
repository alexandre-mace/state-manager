import { describe, expect, it } from "vitest";
import evolution from "../data/evolution-finances.json";
import donnees from "../data/finances-publiques-2026.json";
import { explainerValues, fillPlaceholders, yearBalance } from "./explainer";

const values = explainerValues(donnees, evolution.annees);

describe("marques des textes", () => {
	it("remplace chaque marque par sa valeur", () => {
		expect(fillPlaceholders("{a} et {b}", { a: "1", b: "2" })).toBe("1 et 2");
	});

	it("casse sur une marque sans valeur", () => {
		expect(() => fillPlaceholders("{inconnue}", {})).toThrow(
			"Valeur absente pour la marque {inconnue}",
		);
	});

	it("trouvent toutes une valeur dans la FAQ et le glossaire", () => {
		const { questionsFrequentes, glossaire } = donnees.pedagogie;
		const textes = [
			...questionsFrequentes.flatMap((q) => [q.question, q.reponse]),
			...glossaire.map((g) => g.definition),
		];
		for (const texte of textes)
			expect(fillPlaceholders(texte, values)).not.toMatch(/[{}]/);
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
		const current = yearBalance(evolution.annees, donnees.year);
		expect(
			donnees.vueGlobale.depenses_totales_milliards_eur -
				current.revenueBillionEur,
		).toBeCloseTo(current.deficitBillionEur, 6);
	});
});
