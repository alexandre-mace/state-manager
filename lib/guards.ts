// Une entrée renommée dans le JSON doit casser le build, pas afficher 0 en silence
export function findOrThrow<T>(
	list: T[],
	predicate: (entry: T) => boolean,
	label: string,
): T {
	const entry = list.find(predicate);
	if (entry === undefined) throw new Error(`Donnée absente du JSON : ${label}`);
	return entry;
}

// Un impôt porte son montant net ou son montant brut : l'absence des deux casse le build
export function requireAmount(
	value: number | undefined,
	label: string,
): number {
	if (value === undefined) throw new Error(`Montant absent du JSON : ${label}`);
	return value;
}
