import { describe, expect, it } from "vitest";
import donnees from "../data/finances-publiques-2026.json";
import { formatEur, formatNombre, formatPct } from "./format";
import {
	assiette,
	coefficientRgdu,
	impotSurLeRevenu,
	lireCotisations,
	type ParametresSimulateur,
	simuler,
	tauxSousLePass,
} from "./simulateur";

const p: ParametresSimulateur = donnees.simulateur;
const salariales = lireCotisations(
	donnees.securiteSociale.tauxCotisations.salariales,
);
const patronales = lireCotisations(
	donnees.securiteSociale.tauxCotisations.patronales,
);
const pass = p.pass_annuel_eur;

describe("réduction générale dégressive unique", () => {
	// Exemples de la fiche service-public F24542
	it("vaut le maximum 0,4021 au SMIC", () => {
		expect(coefficientRgdu(21_876.4, p)).toBe(0.4021);
	});

	it("vaut 0,0615 à 3 500 € par mois", () => {
		expect(coefficientRgdu(42_000, p)).toBe(0.0615);
	});

	it("s'éteint à 3 SMIC", () => {
		expect(coefficientRgdu(3 * 21_876.4, p)).toBe(0);
		expect(coefficientRgdu(100_000, p)).toBe(0);
	});

	it("reste plafonnée sous le SMIC annuel", () => {
		expect(coefficientRgdu(15_000, p)).toBe(0.4021);
	});
});

describe("impôt sur le revenu, célibataire", () => {
	it("applique la décote aux revenus modestes", () => {
		// (20 000 − 11 600) × 11 % = 924 ; décote 897 − 45,25 % × 924 = 478,89
		expect(impotSurLeRevenu(20_000, p)).toBeCloseTo(445.11, 2);
	});

	it("n'applique plus de décote au-delà de son seuil", () => {
		// (29 579 − 11 600) × 11 % + (30 000 − 29 579) × 30 %
		expect(impotSurLeRevenu(30_000, p)).toBeCloseTo(2_103.99, 2);
	});

	it("est nul sous la première tranche", () => {
		expect(impotSurLeRevenu(11_000, p)).toBe(0);
	});
});

describe("assiettes", () => {
	it("coupe la tranche 1 au PASS et ouvre la tranche 2 au-delà", () => {
		expect(assiette(30_000, "tranche1", p)).toBe(30_000);
		expect(assiette(30_000, "tranche2", p)).toBe(0);
		expect(assiette(60_000, "tranche1", p)).toBe(pass);
		expect(assiette(60_000, "tranche2", p)).toBe(60_000 - pass);
	});

	it("applique l'abattement CSG de 1,75 % jusqu'à 4 PASS seulement", () => {
		expect(assiette(40_000, "csg", p)).toBeCloseTo(39_300, 6);
		expect(assiette(5 * pass, "csg", p)).toBeCloseTo(
			4 * pass * 0.9825 + pass,
			6,
		);
	});
});

describe("simulation complète", () => {
	it("ne fait payer la CET qu'au-delà du PASS, mais alors sur tout le salaire", () => {
		const cet = (brut: number) =>
			simuler(
				brut,
				salariales.filter((c) => c.cle === "cet_sal"),
				patronales.filter((c) => c.cle === "cet_pat"),
				p,
			).parPoste.retraite;
		expect(cet(pass - 1_000)).toBe(0);
		expect(cet(pass + 1_000)).toBeCloseTo(
			((pass + 1_000) * (0.14 + 0.21)) / 100,
			6,
		);
	});

	it("efface presque toutes les cotisations patronales au SMIC", () => {
		const s = simuler(21_876.4, salariales, patronales, p);
		expect(s.allegement).toBeCloseTo(21_876.4 * 0.4021, 2);
		expect(s.cotisationsPatronales / s.brut).toBeLessThan(0.02);
	});

	it("garde les égalités comptables", () => {
		for (const brut of [15_000, 35_000, 60_000, 150_000]) {
			const s = simuler(brut, salariales, patronales, p);
			expect(s.coutEmployeur).toBeCloseTo(brut + s.cotisationsPatronales, 6);
			expect(s.netApresIR).toBeCloseTo(
				brut - s.cotisationsSalariales - s.impot,
				6,
			);
			const totalPostes = Object.values(s.parPoste).reduce((a, b) => a + b, 0);
			expect(totalPostes).toBeCloseTo(
				s.cotisationsSalariales + s.cotisationsPatronalesAvantAllegement,
				6,
			);
		}
	});

	it("donne des taux sous le PASS cohérents avec les tableaux officiels", () => {
		// Salarié : 11,31 points sur le brut, plus 9,7 points de CSG-CRDS sur 98,25 % du brut
		expect(tauxSousLePass(salariales, p)).toBeCloseTo(11.31 + 9.7 * 0.9825, 6);
		expect(tauxSousLePass(patronales, p)).toBeCloseTo(42.05, 6);
	});
});

describe("textes du JSON", () => {
	// Les libellés recopient des paramètres : s'ils divergent, la page se contredit
	const tc = donnees.securiteSociale.tauxCotisations;
	const libelles = [...tc.salariales, ...tc.patronales].map(
		(c) => c.cotisation,
	);

	it("citent le PASS et l'allègement maximal en vigueur", () => {
		expect(tc.description).toContain(formatEur(p.pass_annuel_eur));
		expect(tc.description).toContain(formatPct(p.csg.base_pct, 2));
		expect(tc.note).toContain(
			`${formatNombre((p.rgdu.tmin + p.rgdu.tdelta) * 100, 2)} points`,
		);
		expect(tc.note).toContain(`${p.rgdu.seuil_smic} SMIC`);
	});

	it("citent les plafonds de tranche en multiples du PASS", () => {
		expect(
			libelles.some((l) => l.includes(`${p.plafonds_pass.tranches_1_2} PASS`)),
		).toBe(true);
		expect(
			libelles.some((l) => l.includes(`${p.plafonds_pass.chomage} PASS`)),
		).toBe(true);
	});
});

describe("lecture du JSON", () => {
	it("refuse une assiette inconnue", () => {
		expect(() =>
			lireCotisations([{ cle: "x", assiette: "plafonee", poste: "retraite" }]),
		).toThrow("Assiette inconnue");
	});
});
