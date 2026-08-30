# Repository Guidelines

## Project Structure & Module Organization
This Next.js App Router project keeps user-facing routes in `app/`, with `layout.tsx` providing shared chrome and `page.tsx` as the default screen. Global styles live in `app/globals.css`, which imports Tailwind CSS v4 tokens and animation utilities. Shared logic belongs in `lib/`, starting with `utils.ts` for helpers such as `cn`. Static assets, including favicons and any marketing imagery, should be stored under `public/` and referenced via absolute paths. Path aliases are defined in `tsconfig.json` (e.g., `@/lib`), so prefer those imports when reorganizing modules.

## Les données, qui sont tout le produit

Tableau de bord pédagogique statique sur les finances publiques françaises. `app/page.tsx` est
entièrement piloté par la donnée, **aucun chiffre en dur**, la note d'actualité venant de
`context.note`.

- `data/finances-publiques-2026.json` : le fichier principal.
- `data/evolution-finances.json` : les séries longues, dépenses, recettes et solde des
  administrations publiques depuis 1959, dette depuis 1978.
- `data/budget-2024.json` et `data/gdp-sectors.json` sont historiques et ne se périment pas.

**Règle de cohérence** : les tuiles d'en-tête calculent le déficit en milliards et par habitant à
partir de `context.pib_milliards_eur` et `context.population`. Choisir un PIB cohérent avec le
dernier ratio dette sur PIB publié par l'INSEE (PIB implicite = dette ÷ ratio), sinon les
pourcentages affichés divergent des chiffres officiels.

**Pièges de périmètre**, tous rencontrés :
- Les missions budgétaires en crédits de paiement sont « y compris pensions ». L'écart est massif sur
  la Défense.
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
- `pnpm lint`: executes ESLint with the Next.js config; pair with `--fix` when safe.

## Coding Style & Naming Conventions
TypeScript is strict-mode by default; minimize `any` and keep components typed via explicit props. Components and files that render JSX should use PascalCase (e.g., `StatePanel.tsx`), while reusable hooks can live in a future `hooks/` folder and start with `use`. Utility functions belong in `lib/` and use camelCase. Tailwind classes should favor the semantic tokens declared in `globals.css`; keep overrides localized with `@layer`. Run `pnpm lint` before pushing to catch import ordering and accessibility rules.

## Testing Guidelines
Automated tests are not scaffolded yet, so add a `tests/` or colocated `*.test.tsx` directory when introducing coverage. Prefer React Testing Library for component behavior and consider Playwright for end-to-end flows once UI stabilizes. Keep test names descriptive (`it("renders empty state")`) and group by component. Document any required mocks in the test file for future contributors.

## Commit & Pull Request Guidelines
Follow the existing Git history by writing short, imperative commit subjects (e.g., `Add state panel layout`). Each commit should focus on a single logical change, with follow-up fixes squashed before merging. Pull requests need a summary of intent, testing notes (`pnpm lint`, manual checks), and links to related issues; include before/after screenshots for UI changes.

Conventions de la stack : `docs/next-guidelines.md`, lien vers [dev-standards](https://github.com/alexandre-mace/dev-standards).
