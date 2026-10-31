import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as budget2024 from "./budget-2024";
import * as gdpSectors from "./gdp-sectors";
import * as publicFinances2026 from "./public-finances-2026";
import * as publicFinanceHistory from "./public-finances-history";

// Garde typographique sur tout le texte saisi à la main dans lib/data : la virgule décimale et
// l'espace insécable avant l'unité, que formatNumber et formatMd assurent déjà pour les nombres.

const MODULES: Record<string, unknown> = {
	"budget-2024.ts": budget2024,
	"gdp-sectors.ts": gdpSectors,
	"public-finances-2026.ts": publicFinances2026,
	"public-finances-history.ts": publicFinanceHistory,
};

// Des numéros, pas des décimales : l'article 49.3 de la Constitution, les tableaux 3.201 et
// 1.101 des comptes nationaux de l'INSEE
const DOTTED_NUMBERS = new Set(["49.3", "3.201", "1.101"]);

function* strings(value: unknown, path: string): Generator<[string, string]> {
	if (typeof value === "string") yield [path, value];
	else if (Array.isArray(value))
		for (const [i, item] of value.entries())
			yield* strings(item, `${path}[${i}]`);
	else if (value && typeof value === "object")
		for (const [key, item] of Object.entries(value))
			yield* strings(item, `${path}.${key}`);
}

const texts = Object.entries(MODULES).flatMap(([file, module]) => [
	...strings(module, file),
]);

describe("typographie des données", () => {
	it("couvre chaque fichier de lib/data", () => {
		const files = readdirSync(__dirname).filter(
			(f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
		);
		expect(Object.keys(MODULES).sort()).toEqual(files.sort());
	});

	it("écrit les décimales avec une virgule", () => {
		const offenders = texts.filter(([, text]) =>
			(text.match(/\d+\.\d+/g) ?? []).some((n) => !DOTTED_NUMBERS.has(n)),
		);
		expect(offenders).toEqual([]);
	});

	it("met une espace insécable avant % et €", () => {
		const offenders = texts.filter(([, text]) => / (%|€|Md€|M€)/.test(text));
		expect(offenders).toEqual([]);
	});
});
