import { describe, expect, it } from "vitest";
import { publicFinances2026 as data } from "./data/public-finances-2026";
import { formatEur, formatNumber, formatPct } from "./format";
import {
	assiette,
	computeIncomeTax,
	rateBelowPass,
	rgduCoefficient,
	type SimulatorParameters,
	simulate,
} from "./simulator";

const p: SimulatorParameters = data.simulator;
const employee = data.socialSecurity.cotisationRates.employee;
const employer = data.socialSecurity.cotisationRates.employer;
const pass = p.annualPassEur;

describe("réduction générale dégressive unique", () => {
	// Exemples de la fiche service-public F24542
	it("vaut le maximum 0,4021 au SMIC", () => {
		expect(rgduCoefficient(21_876.4, p)).toBe(0.4021);
	});

	it("vaut 0,0615 à 3 500 € par mois", () => {
		expect(rgduCoefficient(42_000, p)).toBe(0.0615);
	});

	it("s'éteint à 3 SMIC", () => {
		expect(rgduCoefficient(3 * 21_876.4, p)).toBe(0);
		expect(rgduCoefficient(100_000, p)).toBe(0);
	});

	it("reste plafonnée sous le SMIC annuel", () => {
		expect(rgduCoefficient(15_000, p)).toBe(0.4021);
	});
});

describe("impôt sur le revenu, célibataire", () => {
	it("applique la décote aux revenus modestes", () => {
		// (20 000 − 11 600) × 11 % = 924 ; décote 897 − 45,25 % × 924 = 478,89
		expect(computeIncomeTax(20_000, p)).toBeCloseTo(445.11, 2);
	});

	it("n'applique plus de décote au-delà de son seuil", () => {
		// (29 579 − 11 600) × 11 % + (30 000 − 29 579) × 30 %
		expect(computeIncomeTax(30_000, p)).toBeCloseTo(2_103.99, 2);
	});

	it("est nul sous la première tranche", () => {
		expect(computeIncomeTax(11_000, p)).toBe(0);
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
		const cet = (gross: number) =>
			simulate(
				gross,
				employee.filter((c) => c.key === "cetEmployee"),
				employer.filter((c) => c.key === "cetEmployer"),
				p,
			).byDestination.pension;
		expect(cet(pass - 1_000)).toBe(0);
		expect(cet(pass + 1_000)).toBeCloseTo(
			((pass + 1_000) * (0.14 + 0.21)) / 100,
			6,
		);
	});

	it("efface presque toutes les cotisations employer au SMIC", () => {
		const s = simulate(21_876.4, employee, employer, p);
		expect(s.relief).toBeCloseTo(21_876.4 * 0.4021, 2);
		expect(s.employerCotisations / s.gross).toBeLessThan(0.02);
	});

	it("garde les égalités comptables", () => {
		for (const gross of [15_000, 35_000, 60_000, 150_000]) {
			const s = simulate(gross, employee, employer, p);
			expect(s.employerCost).toBeCloseTo(gross + s.employerCotisations, 6);
			expect(s.netAfterIncomeTax).toBeCloseTo(
				gross - s.employeeCotisations - s.incomeTax,
				6,
			);
			const totalByDestination = Object.values(s.byDestination).reduce(
				(a, b) => a + b,
				0,
			);
			expect(totalByDestination).toBeCloseTo(
				s.employeeCotisations + s.employerCotisationsBeforeRelief,
				6,
			);
		}
	});

	it("donne des taux sous le PASS cohérents avec les tableaux officiels", () => {
		// Salarié : 11,31 points sur le gross, plus 9,7 points de CSG-CRDS sur 98,25 % du gross
		expect(rateBelowPass(employee, p)).toBeCloseTo(11.31 + 9.7 * 0.9825, 6);
		expect(rateBelowPass(employer, p)).toBeCloseTo(42.05, 6);
	});
});

describe("textes des données", () => {
	// Les libellés recopient des paramètres : s'ils divergent, la page se contredit
	const rates = data.socialSecurity.cotisationRates;
	const labels = [...rates.employee, ...rates.employer].map((c) => c.label);

	it("citent le PASS et l'allègement maximal en vigueur", () => {
		expect(rates.description).toContain(formatEur(p.annualPassEur));
		expect(rates.description).toContain(formatPct(p.csg.basePct, 2));
		expect(rates.note).toContain(
			`${formatNumber((p.rgdu.tmin + p.rgdu.tdelta) * 100, 2)} points`,
		);
		expect(rates.note).toContain(`${p.rgdu.smicThreshold} SMIC`);
	});

	it("citent les plafonds de tranche en multiples du PASS", () => {
		expect(
			labels.some((l) => l.includes(`${p.passCeilings.tranches12} PASS`)),
		).toBe(true);
		expect(
			labels.some((l) => l.includes(`${p.passCeilings.unemployment} PASS`)),
		).toBe(true);
	});
});
