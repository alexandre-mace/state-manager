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

// Une clé renommée dans le JSON (une icône, par exemple) casse le build au lieu de disparaître
export function lookupOrThrow<T>(
	record: Record<string, T>,
	key: string,
	label: string,
): T {
	const value = record[key];
	if (value === undefined)
		throw new Error(`Clé inconnue pour ${label} : ${key}`);
	return value;
}
