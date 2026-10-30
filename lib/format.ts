// Espace insécable avant l'unité : « 1 722 Md€ » ne se coupe jamais en fin de ligne
const NBSP = "\u00a0";

// decimalesMin fixe le nombre de décimales, pour aligner une colonne de montants
export const formatNombre = (value: number, decimales = 1, decimalesMin = 0) =>
  value.toLocaleString("fr-FR", { minimumFractionDigits: decimalesMin, maximumFractionDigits: decimales });

export const formatMd = (value: number, decimales = 1, decimalesMin = 0) =>
  `${formatNombre(value, decimales, decimalesMin)}${NBSP}Md€`;

export const formatPct = (value: number, decimales = 1) => `${formatNombre(value, decimales)}${NBSP}%`;

export const formatEur = (value: number) => `${formatNombre(value, 0)}${NBSP}€`;
