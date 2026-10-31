# Repository Guidelines

## Project Structure & Module Organization

This Next.js App Router project keeps user-facing routes in `app/`, with `layout.tsx` providing shared chrome and `page.tsx` as the default screen. Global styles live in `app/globals.css`, which imports Tailwind CSS v4 tokens and animation utilities. Shared logic belongs in `lib/`, starting with `utils.ts` for helpers such as `cn`. Static assets, including favicons and any marketing imagery, should be stored under `public/` and referenced via absolute paths. Path aliases are defined in `tsconfig.json` (e.g., `@/lib`), so prefer those imports when reorganizing modules.

## Les données, qui sont tout le produit

Tableau de bord pédagogique statique sur les finances publiques françaises. `app/page.tsx` est
entièrement piloté par la donnée, **aucun chiffre en dur**, la note d'actualité venant de
`context.note`.

Les données sont du TypeScript typé dans `lib/data/`, un fichier par jeu de données, chacun ouvert
par un en-tête qui dit d'où viennent les chiffres et à quelle date (next-guidelines §5). Le
fichier principal regroupe plusieurs sources (loi de finances, LFSS, INSEE, Cour des comptes,
Eurostat) parce qu'il porte un seul exercice : son en-tête dit ce que fournit chacune. Elles sont
saisies à la main : pas de script `pnpm data`, mettre à jour l'en-tête avec les chiffres.

- `lib/data/public-finances-2026.ts` : le fichier principal, l'année en cours.
- `lib/data/public-finances-history.ts` : les séries longues, dépenses, recettes et solde des
  administrations publiques depuis 1959 (la dette depuis 1978 est dans le fichier principal).
- `lib/data/budget-2024.ts` et `lib/data/gdp-sectors.ts` sont historiques et ne se périment pas.

**Règle de cohérence** : le déficit des tuiles d'en-tête, du circuit et de la FAQ se lit dans la
ligne de l'année des séries longues (objectif de la loi de finances), jamais comme un produit
taux × PIB. Le PIB implicite de la dette (dette ÷ dernier ratio INSEE) n'est pas le PIB annuel
de la loi de finances, et les mélanger décale les montants affichés des chiffres officiels. Les
textes des données (FAQ, glossaire, notes, descriptions) citent leurs chiffres par des marques
`{nom}`, remplies par `lib/explainer.ts` : un total ne s'y recopie pas à la main. La page passe
chaque texte qui en porte par `fill`. `lib/data/typography.test.ts` refuse dans tout le texte des
données un point décimal et une espace ordinaire avant %, € ou Md€.

**Pièges de périmètre**, tous rencontrés :
- Les missions budgétaires en crédits de paiement sont « y compris pensions ». L'écart est massif sur
  la Défense. La part retraites (`pensionsBillionEur`) n'est pas dans la loi de finances : elle
  se lit dans les PAP, ligne « Contributions d'équilibre au CAS Pensions », programme par programme.
  Pour Recherche et enseignement supérieur elle est sous-estimée, les universités la payant sur leurs
  subventions, hors titre 2.
- Le budget de l'État se lit en recettes et charges nettes du budget général : le solde général avec
  les comptes spéciaux est légèrement différent.
- Les prélèvements obligatoires INSEE (définition française) ne sont pas ceux d'Eurostat. Ne pas les
  mélanger dans une comparaison européenne.
- Séries longues : les pourcentages d'avant 1995 sont calculés depuis les montants, ceux de 1995 et
  après viennent d'Eurostat. Ne jamais mélanger avec les bases anciennes, l'écart systématique est
  de 1,5 à 2 points.

**Sources** : INSEE Informations rapides (dette trimestrielle, comptes des administrations fin mars),
notification Eurostat PDE (avril et octobre), textes de loi de finances. Les séries longues viennent
des xlsx INSEE base 2020, parsables en python avec openpyxl.

## Build, Test, and Development Commands

- `pnpm dev`: launches the dev server with Turbopack at http://localhost:3000.
- `pnpm build`: produces an optimized production build.
- `pnpm start`: runs the compiled app locally.
- `pnpm check`: Biome lint and format check; `pnpm format` rewrites. The kit is left out: `components/ui/`, `components/link-card.tsx` and `components/made-with-love.tsx` are fixed in the kit, then propagated with `/propagate-kit`.
- `pnpm test`: Vitest, on the pure calculations in `lib/`.

## Coding Style & Naming Conventions

TypeScript is strict-mode by default; minimize `any` and keep components typed via explicit props. Components use PascalCase names and their files kebab-case (e.g., `SalarySimulator` in `salary-simulator.tsx`), while reusable hooks can live in a future `hooks/` folder and start with `use`. Utility functions belong in `lib/` and use camelCase. Tailwind classes should favor the semantic tokens declared in `globals.css`; keep overrides localized with `@layer`. Run `pnpm check` before pushing to catch import ordering and accessibility rules.

## Testing Guidelines

A static site with no backend owes no test suite (`docs/next-guidelines.md`). The exception is a calculation the page shows as a result: it lives in `lib/` as a pure function with a colocated `*.test.ts`, like the salary simulator in `lib/simulator.ts`.

## Commit & Pull Request Guidelines

Follow the existing Git history: Conventional Commits with a French subject, written without accents (e.g., `fix(chiffres): TICPE nette et moyenne UE sourcees`). Each commit should focus on a single logical change, with follow-up fixes squashed before merging. Pull requests need a summary of intent, testing notes (`pnpm check`, `pnpm test`, manual checks), and links to related issues; include before/after screenshots for UI changes.

Conventions de la stack : `docs/next-guidelines.md`, lien vers [dev-standards](https://github.com/alexandre-mace/dev-standards).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
