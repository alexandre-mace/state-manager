// Calculs affichés par la page : des fonctions pures, testées, plutôt que des expressions
// recopiées dans le JSX.

// Montant par habitant d'un agrégat en milliards d'euros
export function perInhabitantEur(billionEur: number, population: number) {
	return (billionEur * 1_000_000_000) / population;
}

// Impôts et taxes du circuit : les prélèvements obligatoires moins ce qui va à la Sécurité
// sociale, cotisations et CSG-CRDS
export function taxesAndDuties(levies: {
	totalBillionEur: number;
	cotisationsBillionEur: number;
	csgCrdsBillionEur: number;
}) {
	return (
		levies.totalBillionEur -
		levies.cotisationsBillionEur -
		levies.csgCrdsBillionEur
	);
}

// Dernière année au solde positif des séries longues, undefined s'il n'y en a aucune
export function lastSurplusYear(
	years: { annee: number; deficit_pib_pct: number }[],
) {
	return years.findLast((y) => y.deficit_pib_pct > 0)?.annee;
}

// Largeur d'une barre en pourcentage de la plus grande de sa liste
export function barWidthPct(value: number, values: number[]) {
	const max = Math.max(...values);
	return max > 0 ? (value / max) * 100 : 0;
}
