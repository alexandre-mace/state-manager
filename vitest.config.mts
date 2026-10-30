import { defineConfig } from "vitest/config";

// Ordre aléatoire : un test qui dépend d'un autre échoue au lieu de passer par chance
export default defineConfig({
	test: { sequence: { shuffle: true } },
});
