# Finances publiques françaises

Tableau de bord pédagogique et statique sur les finances publiques françaises, en ligne sur
[state.alexandremace.fr](https://state.alexandremace.fr). Toute la page est pilotée par
`lib/data/public-finances-2026.ts`, pour l'année en cours, et
`lib/data/public-finances-history.ts`, pour les séries longues ; d'où viennent les chiffres et leurs pièges de périmètre sont décrits
dans `AGENTS.md`.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm check    # Biome, lint et format
pnpm test     # Vitest, calculs de lib/
pnpm build    # types et génération statique
```
