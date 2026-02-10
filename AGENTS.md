# Repository Guidelines

## Project Structure & Module Organization
This Next.js App Router project keeps user-facing routes in `app/`, with `layout.tsx` providing shared chrome and `page.tsx` as the default screen. Global styles live in `app/globals.css`, which imports Tailwind CSS v4 tokens and animation utilities. Shared logic belongs in `lib/`, starting with `utils.ts` for helpers such as `cn`. Static assets, including favicons and any marketing imagery, should be stored under `public/` and referenced via absolute paths. Path aliases are defined in `tsconfig.json` (e.g., `@/lib`), so prefer those imports when reorganizing modules.

## Build, Test, and Development Commands
- `npm run dev`: launches the dev server with Turbopack at http://localhost:3000.
- `npm run build`: produces an optimized production build.
- `npm run start`: runs the compiled app locally.
- `npm run lint`: executes ESLint with the Next.js config; pair with `--fix` when safe.

## Coding Style & Naming Conventions
TypeScript is strict-mode by default; minimize `any` and keep components typed via explicit props. Components and files that render JSX should use PascalCase (e.g., `StatePanel.tsx`), while reusable hooks can live in a future `hooks/` folder and start with `use`. Utility functions belong in `lib/` and use camelCase. Tailwind classes should favor the semantic tokens declared in `globals.css`; keep overrides localized with `@layer`. Run `npm run lint` before pushing to catch import ordering and accessibility rules.

## Testing Guidelines
Automated tests are not scaffolded yet, so add a `tests/` or colocated `*.test.tsx` directory when introducing coverage. Prefer React Testing Library for component behavior and consider Playwright for end-to-end flows once UI stabilizes. Keep test names descriptive (`it("renders empty state")`) and group by component. Document any required mocks in the test file for future contributors.

## Commit & Pull Request Guidelines
Follow the existing Git history by writing short, imperative commit subjects (e.g., `Add state panel layout`). Each commit should focus on a single logical change, with follow-up fixes squashed before merging. Pull requests need a summary of intent, testing notes (`npm run lint`, manual checks), and links to related issues; include before/after screenshots for UI changes.
