// Espace insécable avant l'unité : « 1 722 Md€ » ne se coupe jamais en fin de ligne
const NBSP = "\u00a0";

// minDecimals fixe le nombre de décimales, pour aligner une colonne de montants
export const formatNumber = (value: number, decimals = 1, minDecimals = 0) =>
	value.toLocaleString("fr-FR", {
		minimumFractionDigits: minDecimals,
		maximumFractionDigits: decimals,
	});

export const formatMd = (value: number, decimals = 1, minDecimals = 0) =>
	`${formatNumber(value, decimals, minDecimals)}${NBSP}Md€`;

export const formatPct = (value: number, decimals = 1) =>
	`${formatNumber(value, decimals)}${NBSP}%`;

export const formatEur = (value: number) => `${formatNumber(value, 0)}${NBSP}€`;

// Un compte sous dix s'écrit en lettres dans la prose : « les quatre catégories »
const NUMBER_WORDS = [
	"zéro",
	"un",
	"deux",
	"trois",
	"quatre",
	"cinq",
	"six",
	"sept",
	"huit",
	"neuf",
	"dix",
];
export const formatCount = (value: number) =>
	NUMBER_WORDS[value] ?? formatNumber(value, 0);
