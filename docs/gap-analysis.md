# Gap Analysis : Theorie vs Pratique

> Ecarts entre les guidelines de la stack et le code actuel, à la date de l'audit.
> Organisé par priorité. Les cases servent le temps d'une session de nettoyage :
> le prochain audit réécrit le fichier.
> Audit de main à af8c2c30163574e2faca66ce792532e9ff1b7086, le 31/10/2026. Un delta part de ce commit.
> Session de correction sur la branche `fix/gap-code` : les cases cochées sont corrigées, ce qui reste ouvert est décoché, ce qui est laissé délibérément est dans « Écarts assumés ».

Config et dépendances conformes : Next 16.4.3 (plancher 16.4.1), React 19.3.1, TypeScript 7.0.2,
Biome 2.6.4, Vitest 5.0.5, `packageManager` épinglé, `reactCompiler`, `cacheComponents`,
`ensureStatic`, en-têtes de sécurité, `cn` du paquet `cn`, Base UI seul, style `base-nova` d'accord
avec la géométrie vendue. `AGENTS.md` : 0 écart au script, `CLAUDE.md` réduit à `@AGENTS.md`.

---

## 1. Chiffres affichés (Haute et Moyenne priorité)

**Idéal** : un chiffre affiché est juste, et son périmètre est dit quand il diffère de ses voisins (AGENTS.md, pièges de périmètre)
**Actuel** : un montant brut affiché parmi des nets, des totaux qui ne bouclent pas, une FAQ qui contredit le tableau

- [x] `app/page.tsx:528-534` : la TVA s'affiche à 175,1 Md€ (`montant_brut_milliards_eur`) dans « Principaux impôts d'État », sans le mot « brut », à côté d'impôts nets ; `montant_net_etat_milliards_eur` (109,1) n'est lu nulle part. 66 Md€ d'écart sans signal. **Haute** (probable)
  - Vérifier au passage que l'IR, l'IS et la TICPE du JSON sont bien nets
  - Corrigé : la TVA affiche 109,1 Md€ nets, l'intertitre dit « nets des remboursements et dégrèvements ». L'IR (104,0) et l'IS (59,0) sont les nets du projet de loi de finances 2026 ; les 175,1 Md€ bruts étaient le brut 2025 révisé (INSEE, recettes du budget général), retirés
- [ ] TICPE à 18,5 Md€ : ni le net (22,9 Md€) ni le brut (24,7 Md€) des accises sur les énergies du projet de loi de finances 2026. Ouvert : il faut la source du chiffre, ou celui de la loi promulguée. De même, l'IR et l'IS sont ceux du projet de loi, la loi votée peut différer
- [x] `components/flow-diagram.tsx` : la boîte Sécurité sociale affiche 677 Md€ (`vueGlobale`), ses quatre sous-boîtes font 687,7, l'onglet Sécu affiche 684,2 et les cinq branches 704,7. Trois périmètres sans note (sûr)
  - Corrigé par une note de périmètre : les cinq branches s'affichent, et le circuit comme l'onglet disent que leur somme (704,7) ne se compare pas au total ; les boîtes du haut, en comptabilité nationale, s'additionnent (1 722)
- [x] `data/finances-publiques-2026.json`, `pedagogie.questionsFrequentes` : la FAQ annonce « 32 € à l'employeur » et « ~32 % du brut », le tableau du simulateur « Part patronale (42,1 %) » avant allègement, sans que la FAQ dise que 32 est après allègement (sûr)
  - Les totaux recopiés dans la FAQ (1 722, 1 312, ~150 Md€) concordent aujourd'hui mais dériveront à la prochaine mise à jour : les lire dans le JSON
  - Corrigé : la FAQ et le glossaire lisent leurs chiffres par des marques `{nom}` (`lib/explainer.ts`, testé) ; la part patronale est dite avant (42 %) et après allègement (31 % à 35 000 €)
- [ ] FAQ : « ~50 % en moyenne dans l'UE » (dépenses publiques) et « 70 % / 30 % » (qui paie les prélèvements) restent écrits dans le texte, sans champ ni source dans les données. Ouvert : il faut une source (Eurostat pour la moyenne UE) avant d'en faire une donnée. Basse
- [x] `app/page.tsx:443-488` : `budgetEtat.note`, qui explique le périmètre « recettes et charges nettes du budget général » et le solde avec comptes spéciaux (-134,6 Md€), n'est jamais affiché à côté du déficit État de -133,5 Md€. Basse (sûr)
- [x] Deux PIB en circulation : le glossaire et `evolution-finances.json` impliquent ~3 010 Md€ en 2026, `context.pib_milliards_eur` vaut 3 021. La tuile « 1 722 Md€, soit 57,2 % du PIB » donne 57,0 % sur 3 021. Basse (à vérifier)
  - Corrigé : 3 021 Md€ est le PIB implicite de la dette (33f4ceb), pas celui de la loi de finances. Le déficit ne se calcule plus en taux × PIB : il se lit dans la ligne 2026 des séries longues (150 Md€ au lieu de 151,1 Md€), et le champ PIB est retiré

## 2. Rendu statique et Server Components (Moyenne priorité)

**Idéal** : Server Components par défaut, tout le contenu présent dans le HTML statique (next-guidelines §4 et §5)
**Actuel** : un composant sans interaction envoyé au client, les onglets inactifs absents du HTML

- [x] `components/flow-diagram.tsx:1` : `"use client"` sans hook, handler ni API navigateur ; sa seule prop est sérialisable et son parent `app/page.tsx:907` est serveur. Retirer la directive (sûr)
- [x] `app/page.tsx:435-840` : `TabsContent` de Base UI a `keepMounted=false` par défaut (`TabsPanel.js:37`, `return null` l. 101-103). Le HTML construit n'a qu'un `role="tabpanel"` : « Dépenses par branche », « Types de collectivités », « Sources de financement » n'existent que dans le payload RSC, invisibles sans JavaScript, pour les moteurs et pour la recherche dans la page (sûr)
  - Passer `keepMounted` depuis la page, sans toucher au kit

## 3. Accessibilité (Moyenne priorité)

**Idéal** : une hiérarchie de titres sans trou, un contraste de 4,5:1 sur le texte courant (react-guidelines §6, WCAG 1.3.1, 2.4.6, 1.4.3)
**Actuel** : quatre sections du sommaire sans titre, un saut h2 vers h4, un token trop clair employé pour du texte

- [x] `CardTitle` rend une `div` : les sections #repartition, #services, #circuit et #simulateur n'ont aucun titre de section, et le simulateur passe du h2 « Évolution » à trois h4 (sûr)
  - `app/page.tsx:370-379, 906-908, 1021-1028`, `components/citizen-return.tsx:45`, `components/thousand-euro-breakdown.tsx:62`, `components/flow-diagram.tsx:74`, `components/salary-simulator.tsx:64, 137, 173, 216`
  - Un vrai `<h2>` par section, ou `render` sur le titre
- [x] `--chart-2` (#c85c2e) en couleur de texte : 4,09:1 sur `--card`, 4,20:1 sous texte blanc, aucun cas en grand texte (sûr)
  - `components/salary-simulator.tsx:100-103` (« Net » blanc text-xs) et `:163` ; `components/flow-diagram.tsx:49` et `:205-209`
  - Le token vient du kit : ne pas l'employer pour du texte plutôt que le modifier

## 4. Graphiques (Moyenne priorité)

**Idéal** : un format de nombre unique (`lib/format.ts`), une infobulle qui dit de quelle année elle parle
**Actuel** : infobulles sans année, nombres non formatés, un fond jamais appliqué

- [x] `components/charts/debt-evolution-chart.tsx:71-87`, `components/charts/evolution-chart.tsx:121-143` et `:231` : l'en-tête d'infobulle affiche le nom de la série au lieu de l'année. Recharts passe la valeur brute de `annee` (un nombre) et `components/ui/chart.tsx:158` n'accepte qu'une chaîne (sûr)
  - `labelFormatter` dans chaque graphique ; les libellés « Dépenses »/« Recettes » réécrits en dur (evolution l. 125-126, debt l. 76) viennent de `chartConfig`
- [x] `components/charts/evolution-chart.tsx:231` (DeficitChart), `components/charts/prelevements-chart.tsx:69-72`, `components/charts/secu-branches-chart.tsx:56-59` : sans `formatter`, le kit affiche `toLocaleString()` sans locale ni unité, « 310 » au lieu de « 310 Md€ » (sûr)
- [x] `components/flow-diagram.tsx:46` : `${color}15` avec `color = "var(--chart-1)"` donne `var(--chart-1)15`, invalide au calcul : le fond des boîtes est transparent depuis 8e32a49. `color-mix(in oklch, … 8%, transparent)`. Basse (sûr)
- [x] `components/charts/prelevements-chart.tsx:51/65` et `components/charts/secu-branches-chart.tsx:40/52` : `margin.left` plus `YAxis width` comptent la marge deux fois, il reste ~90 px de barres sur un mobile de 375 px. Basse (probable)

## 5. Calculs de la page (Moyenne priorité)

**Idéal** : un calcul affiché comme résultat vit dans `lib/` en fonction pure testée (AGENTS.md, react-guidelines §5), aucun chiffre en dur
**Actuel** : calculs en ligne et recopiés dans `app/page.tsx`

- [x] `app/page.tsx` : le déficit en Md€ est calculé trois fois (l. 219-221 à l'unité, 306-310 au dixième, 323-326 sans arrondi) ; `impots = PO − cotisations − CSG` (l. 156-159) et `formatPerHab` sans test (sûr)
  - Sortir dans `lib/` avec un test
- [x] `app/page.tsx:866-899` et `:933-966` : bloc « Comparaison européenne » recopié, échelles de barre en dur (`*2` contre `/2`) ; `findOrThrow(… "État")` appelé deux fois (l. 164-168, 452-456) (sûr)
  - Un composant, l'échelle calculée depuis le maximum
- [x] Chiffres en dur : `x={2020}` « COVID » (`evolution-chart.tsx:165`) alors que le JSON porte la note sur 2020 ; la limite de 3 % recopiée cinq fois (`page.tsx:1004`, `evolution-chart.tsx:201, 212, 234, 238`) ; « les quatre catégories » (`page.tsx:391`), « Les cinq branches » (`page.tsx:598`). Basse (sûr)
- [x] Replis silencieux, à rebours de `lib/guards.ts` : une icône renommée dans le JSON disparaît sans erreur (`citizen-return.tsx:53/60`, `thousand-euro-breakdown.tsx:70/76`) ; un pays absent de `COUNTRY_LABELS` s'affiche par sa clé (`page.tsx:871/938`). Basse (sûr)
- [x] `lib/simulateur.ts:87, 102-103, 188-189` : les commentaires recopient « 1,75 % », « 4 PASS », « 3 SMIC », « 98,25 % » alors que l'en-tête promet qu'aucun taux n'est écrit ici. Basse (sûr)
- [x] `lib/simulateur.test.ts:147-152` : le garde sur un poste inconnu (`simulateur.ts:228`) n'est pas testé, seulement celui sur l'assiette. Basse (sûr)

## 6. Langue du code (Moyenne priorité)

**Idéal** : identifiants en anglais, termes légaux français gardés entiers, commentaires en français (agent/writing.md)
**Actuel** : identifiants français restants après 8c2781e, commentaires anglais

- [x] Identifiants à traduire (sûr) :
  - `lib/format.ts` : `formatNombre`, `decimales`, `decimalesMin`
  - `lib/simulateur.ts` : `simuler`, `lireCotisations`, `ParametresSimulateur`, `Poste`, `tauxSousLePass`, `montant`, `parPoste`, `precedent`, `limite`
  - `app/page.tsx` : `SOMMAIRE`, `libelle`, `entree`, `dernierExcedent`, `cotisationsMontant`
  - `components/salary-simulator.tsx` : `salaireBrutAnnuel`, `SALAIRE_MIN`
  - Les clés du JSON (`vueGlobale`, `montant_milliards_eur`…) relèvent de la même règle
  - Restent en français : `assiette`, `cotisation`, `decote`, `rgdu`, `pass`
- [x] Commentaires en anglais : `app/page.tsx:107, 113, 121, 127, 228, 260, 422`, `components/salary-simulator.tsx:71` ; périmé : `app/page.tsx:377` « Ce que vous recevez en retour » pour un composant intitulé « Ce que financent les dépenses publiques ». Basse (sûr)

## 7. Textes visibles (Basse priorité)

- [x] `components/salary-simulator.tsx:230` : « Finance votre future pension », faux dans un régime par répartition (sûr)
- [x] `components/salary-simulator.tsx:269` : les APL rangées sous Famille, alors que l'encart l. 279 les finance par le FNAL (sûr)
- [x] `components/flow-diagram.tsx:175` : « (tabac, alcool...) » omet la fraction de TVA, la plus grosse part (sûr)
- [x] Majuscule après deux-points : `salary-simulator.tsx:64` « Simulateur : Où va… », `flow-diagram.tsx:130, 140` « Reçoit : Cotisations », « Reçoit : Taxes locales » (sûr)
- [x] « Sécurité Sociale » au lieu de « Sécurité sociale » : `page.tsx:251, 438, 598`, `public-spending-chart.tsx:26/44`, `flow-diagram.tsx:125`, `lib/site.ts:6` et les clés `categorie` du JSON ; `categoryToKey` et les `findOrThrow` dépendent de la chaîne exacte (sûr)
- [x] Point décimal et pas d'espace insécable dans « 9.2% », « 5.5% », « 20% », « +3.1% vs 2025 » ; « 3ème » au lieu de « 3e » (`page.tsx:810`) ; la description de la Sécu oublie l'Autonomie (sûr)

## 8. Kit, config et outillage (Basse priorité)

- [x] `components/ui/tooltip.tsx` : importé nulle part (sûr)
- [x] `app/globals.css:13-20, 80-87` : tokens `--sidebar-*` morts ; l. 5 accents manquants (« Mono-theme », « posee ») (sûr)
- [x] `components/thousand-euro-breakdown.tsx:49/54` : prop `baseMiliardsEur` mal orthographiée, et optionnelle alors que toujours passée (sûr)
- [x] `README.md:5` : dit la page pilotée par `finances-publiques-2026.json` seul, elle lit aussi `evolution-finances.json` (sûr)
- [x] `app/page.tsx:62` et `:1097` : `href` lus dans le JSON sans contrôle du schéma, alors que la CSP autorise `'unsafe-inline'` en script ; un garde `https:` dans `lib/guards.ts` (à vérifier, risque faible)
- [x] `<input type="range">` natif dans le simulateur alors que le kit publie `slider` ; liens de sources stylés à la main alors que le kit publie `text-link` et `link-card` (next-guidelines §2) (à vérifier, peut-être un choix)
  - Tranché : les trois conviennent, installés par le registre
- [x] `components.json` : `baseColor: "neutral"` contre `"gray"` dans le kit, sans effet visible en `cssVariables` (à vérifier)
- [x] `data/*.json` plutôt que du TypeScript typé dans `lib/` (next-guidelines §5) : types inférés, d'où `"montant_milliards_eur" in impot` (`page.tsx:530`) et les `as number` (`page.tsx:868-891, 935-958`). AGENTS.md documente `data/` : trancher entre la guideline et le projet (à vérifier)
  - Tranché pour la guideline : `lib/data/*.ts` typés, un fichier par jeu de données avec son en-tête de sources et de dates ; AGENTS.md et le README suivent

## Écarts assumés

- Biome et Vitest ne tournent nulle part automatiquement, ni hook ni CI : le guide Next n'en exige pas, `pnpm build` est le contrôle et Vercel le lance à chaque push
- `lib/data/public-finances-2026.ts` regroupe plusieurs sources (loi de finances, LFSS, INSEE, Cour des comptes) : c'est l'année affichée par la page, et la couper par source disperserait un même exercice ; son en-tête liste chaque source et ce qu'elle fournit
- `app/globals.css` : tokens hexadécimaux, ce sont les valeurs du thème du kit à l'identique
- `app/opengraph-image.tsx` : couleurs en dur, `ImageResponse` ne lit pas les variables CSS ; un commentaire l'explique
- `app/shadcn-tailwind.css` : copie vendue, option prévue par react-guidelines §3 (8f19497)
- `components/ui/chart.tsx` : `useMemo` du kit, le kit est la source (5e77c82)
- `components/made-with-love.tsx` : `"use client"` inutile mais identique au kit ; la correction se fait dans le kit, puis `/propagate-kit`
- `app/icon.tsx`, `app/apple-icon.tsx` : `ImageResponse` autorisé par next-guidelines §4 pour une icône tirée d'un emoji
- Prélèvements obligatoires à 43,6 % avec un montant 2026 : expliqué par `periode` (« taux 2025 constaté »)
- Bornes du curseur du simulateur (15 000 à 150 000, défaut 35 000) : constantes d'interface, pas des paramètres réglementaires (5e77c82), réunies dans `SALARY_RANGE` (`lib/simulator.ts`)
- `lib/simulator.test.ts` : oracles en dur tirés des exemples officiels F24542, oracle indépendant voulu
- Pas d'`<Activity>` sur les onglets : les panneaux n'ont pas d'état ; le besoin réel était `keepMounted`, posé (section 2)
- `components/charts/top-missions-chart.tsx` en liste HTML et pensions retirées des dépenses de l'État dans le flux : expliqués par un commentaire (`top-missions-chart.tsx:15`, `page.tsx:169`)
