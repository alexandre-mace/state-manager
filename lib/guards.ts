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

// Un lien lu dans le JSON ne sort que vers une page https : une URL javascript: serait une
// exécution, et la CSP autorise les scripts en ligne
export function requireHttpsUrl(url: string): string {
	if (new URL(url).protocol !== "https:")
		throw new Error(`Lien non https dans le JSON : ${url}`);
	return url;
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
