import { describe, expect, it } from "vitest";
import { findOrThrow } from "./guards";

describe("findOrThrow", () => {
	const list = [{ categorie: "État" }, { categorie: "Sécurité Sociale" }];

	it("rend l'entrée trouvée", () => {
		expect(findOrThrow(list, (r) => r.categorie === "État", "État")).toBe(
			list[0],
		);
	});

	it("casse sur une entrée renommée au lieu de rendre 0", () => {
		expect(() =>
			findOrThrow(list, (r) => r.categorie === "Etat", "État"),
		).toThrow("Donnée absente du JSON : État");
	});
});
