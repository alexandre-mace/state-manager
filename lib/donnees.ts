// Une entrée renommée dans le JSON doit casser le build, pas afficher 0 en silence
export function trouver<T>(
	liste: T[],
	predicat: (entree: T) => boolean,
	quoi: string,
): T {
	const entree = liste.find(predicat);
	if (entree === undefined) throw new Error(`Donnée absente du JSON : ${quoi}`);
	return entree;
}
