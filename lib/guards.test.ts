import { describe, expect, it } from "vitest";
import { findOrThrow, lookupOrThrow, requireHttpsUrl } from "./guards";

describe("findOrThrow", () => {
	const list = [{ categorie: "État" }, { categorie: "Sécurité sociale" }];

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

describe("lookupOrThrow", () => {
	it("rend la valeur de la clé, ou casse sur une clé inconnue", () => {
		const icons = { Heart: "cœur" };
		expect(lookupOrThrow(icons, "Heart", "icône")).toBe("cœur");
		expect(() => lookupOrThrow(icons, "Hearts", "icône")).toThrow(
			"Clé inconnue pour icône : Hearts",
		);
	});
});

describe("requireHttpsUrl", () => {
	it("laisse passer un lien https et refuse tout autre protocole", () => {
		expect(requireHttpsUrl("https://www.insee.fr/fr")).toBe(
			"https://www.insee.fr/fr",
		);
		expect(() => requireHttpsUrl("javascript:alert(1)")).toThrow(
			"Lien non https",
		);
		expect(() => requireHttpsUrl("http://www.insee.fr")).toThrow(
			"Lien non https",
		);
	});
});
