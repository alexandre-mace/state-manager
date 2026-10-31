import { describe, expect, it } from "vitest";
import { formatCount, formatMd } from "./format";

describe("formats", () => {
	it("écrit en lettres un compte sous dix, en chiffres au-delà", () => {
		expect(formatCount(4)).toBe("quatre");
		expect(formatCount(12)).toBe("12");
	});

	it("garde l'unité collée au nombre par une espace insécable", () => {
		expect(formatMd(1_722)).toBe("1 722 Md€");
	});
});
