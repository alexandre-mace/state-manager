// Espace insécable avant l'unité : « 1 722 Md€ » ne se coupe jamais en fin de ligne
const NBSP = " ";

export const formatNombre = (value: number, decimales = 1) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: decimales });

export const formatMd = (value: number, decimales = 1) => `${formatNombre(value, decimales)}${NBSP}Md€`;

export const formatPct = (value: number, decimales = 1) => `${formatNombre(value, decimales)}${NBSP}%`;

export const formatEur = (value: number) => `${formatNombre(value, 0)}${NBSP}€`;
